import '@oasisprotocol/sapphire-hardhat';
import "@nomicfoundation/hardhat-ethers"
import { promises as fs } from 'fs';
import path from 'path';

import canonicalize from 'canonicalize';
import { TASK_COMPILE } from 'hardhat/builtin-tasks/task-names';
import { HardhatUserConfig, task } from 'hardhat/config';

import '@typechain/hardhat';
import 'hardhat-watcher';
import 'solidity-coverage';
import { WhitelistVotersACLv1 } from './src/contracts';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

const TASK_EXPORT_ABIS = 'export-abis';

task(TASK_COMPILE, async (_args, hre, runSuper) => {
  await runSuper();
  await hre.run(TASK_EXPORT_ABIS);
});

task(TASK_EXPORT_ABIS, async (_args, hre) => {
  const srcDir = path.basename(hre.config.paths.sources);
  const outDir = path.join(hre.config.paths.root, 'abis');

  const [artifactNames] = await Promise.all([
    hre.artifacts.getAllFullyQualifiedNames(),
    fs.mkdir(outDir, { recursive: true }),
  ]);

  await Promise.all(
    artifactNames.map(async (fqn) => {
      const { abi, contractName, sourceName } = await hre.artifacts.readArtifact(fqn);
      if (abi.length === 0 || !sourceName.startsWith(srcDir) || contractName.endsWith('Test'))
        return;
      await fs.writeFile(`${path.join(outDir, contractName)}.json`, `${canonicalize(abi)}\n`);
    }),
  );
});

// Default DAO deployment, no permissions.
task('deploy')
  .addFlag('gasless', 'Enable GaslessVoting plugin')
  .addParam('gaslessFunds', 'How much ROSE to give to GaslessVoting', '1')
  .addParam('gaslessAccounts', 'How many gas accounts to create', '1')
  .addParam('acl', 'Access Control List contract name to use', '')
  .setAction(async (args, hre) => {
    await hre.run('compile');

    let acl: WhitelistVotersACLv1 | undefined;
    if (args.acl) {
      console.log('Deploying ACL')
      const ACLv1 = await hre.ethers.getContractFactory('WhitelistVotersACLv1', args.acl);
      acl = await ACLv1.deploy();
      await acl.waitForDeployment();
      console.log(`Deployed ACL to ${await acl.getAddress()}`);
    }

    console.log('Deploying GaslessVoting');
    const gaslessFunds = hre.ethers.parseEther(args.gaslessFunds);
    const GaslessVoting_factory = await hre.ethers.getContractFactory('GaslessVoting');
    const gv = await GaslessVoting_factory.deploy(hre.ethers.ZeroAddress, {value: gaslessFunds});

    console.log('Deploy transaction:', gv.deploymentTransaction()?.hash);
    await gv.waitForDeployment()
    console.log(`Deployed GaslessVoting proxy to ${await gv.getAddress()}`);

    const DAOv1 = await hre.ethers.getContractFactory('DAOv1');
    const dao = await DAOv1.deploy(acl ? (await acl.getAddress()) : hre.ethers.ZeroAddress, (await gv.getAddress()));
    await dao.waitForDeployment();

    await gv.setDAO(await dao.getAddress());

    let n = Number(args.gaslessAccounts);
    if( n > 1 ) {
      console.log(`Adding ${n-1} accounts`);
      for( let i = 0; i < n; i++ ) {
        await gv.addKeypair();
      }
    }

    const accounts = await gv.listAddresses();
    for( const a of accounts ) {
      console.log(' -', a);
    }

    console.log(`VITE_DAO_V1_ADDR=${await dao.getAddress()}`);
    return dao;
});

async function getGaslessProxy(hre:HardhatRuntimeEnvironment, daoAddr:string)
{
  const dao = await hre.ethers.getContractAt('DAOv1', daoAddr);
  const gv_addr = await dao.proxyVoter();
  return await hre.ethers.getContractAt('GaslessVoting', gv_addr);
}

task('gv-topup')
  .addPositionalParam('dao', 'DAO address')
  .addOptionalParam('minimumTopup', 'Minimum topup amount to make', '0')
  .addOptionalParam('min', 'Minimum balance of accounts (in ROSE)', '0')
  .addFlag('dryrun', 'Perform a dry-run')
  .setAction(async (args, hre) => {
    const gv = await getGaslessProxy(hre, args.dao);
    const min = hre.ethers.parseEther(args.min);
    const dryrun = args.dryrun;
    const mintop = hre.ethers.parseEther(args.minimumTopup);

    for( const addr of await gv.listAddresses() )
    {
      const bal = await gv.runner!.provider!.getBalance(addr);
      console.log(addr, 'has', hre.ethers.formatEther(bal), `ROSE (${bal} wei)`);

      if( bal < min )
      {
        const diff = min - bal;
        if( diff >= mintop )
        {
          console.log(' - needs', hre.ethers.formatEther(diff), 'ROSE');
          if( ! dryrun )
          {
            const tx = await (await hre.ethers.getSigners())[0].sendTransaction({
              to: addr,
              data: "0x",
              value: diff
            });
            console.log(' -', tx.hash);
            tx.wait();
            const newBal = await gv.runner!.provider!.getBalance(addr);
            console.log(' - new balance', hre.ethers.formatEther(newBal), `ROSE (${newBal} wei)`);
          }
        }
      }
    }
});

task('gv-newkp', 'Add a new KeyPair to gasless voting contract')
  .addPositionalParam('dao', 'DAO address')
  .addParam('n', 'Number of keypairs to create', '1')
  .addParam('amount', 'Amount to topup [each/the] new addresses')
  .setAction(async (args, hre) => {
    const n = Number(args.n);
    if( n < 1 ) {
      throw new Error(`Invalid number of accounts: ${n}`);
    }
    const gv = await getGaslessProxy(hre, args.dao);
    const value = hre.ethers.parseEther(args.amount);
    console.log(`Creating ${n} keypairs, with ${args.amount} ROSE each`);
    for( let i = 0; i < n; i++ ) {
      const tx = await gv.addKeypair({value: value});
      const receipt = await tx.wait();
      const frag = gv.interface.getEvent('KeypairCreated');
      const eventArgs = gv.interface.decodeEventLog(frag, receipt!.logs[0].data);
      const addr = eventArgs.addr;
      console.log(` - ${addr}`, hre.ethers.formatEther(await gv.runner!.provider!.getBalance(addr)), 'ROSE');
    }
});

task('whitelist-voters', 'Whitelist the poll voters for DAOs using WhitelistVotersACLv1. PRIVATE_KEY env variable should hold the private key of the poll manager.')
  .addPositionalParam('dao', 'DAO address')
  .addPositionalParam('pollId', 'poll ID')
  .addPositionalParam('votersFile', 'file with eligible voters addresses, one per line')
  .setAction(async (args, hre) => {
    await hre.run('compile');

    const dao = await hre.ethers.getContractAt('DAOv1', args.dao);
    const signer = new hre.ethers.Wallet(process.env.PRIVATE_KEY!, hre.ethers.provider);
    const acl = (await hre.ethers.getContractAt('WhitelistVotersACLv1', await dao.getACL())).connect(signer);

    let file = await fs.readFile(args.voters_file);
    const addrRaw = file.toString().split("\n");
    let addresses: string[] = [];
    for(const i in addrRaw) {
      if (hre.ethers.isAddress(addrRaw[i])) {
        addresses.push(addrRaw[i]);
      }
    }
    await (await acl.setEligibleVoters(await dao.getAddress(), (args.poll_id.startsWith("0x")?"":"0x")+args.poll_id, addresses)).wait();
  });

const TEST_HDWALLET = {
  mnemonic: "test test test test test test test test test test test junk",
  path: "m/44'/60'/0'/0",
  initialIndex: 0,
  count: 20,
  passphrase: "",
};

const accounts = process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : TEST_HDWALLET;

const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      chainId: 1337, // @see https://hardhat.org/metamask-issue.html
    },
    hardhat_local: {
      url: 'http://127.0.0.1:8545/',
    },
    'sapphire': {
      url: 'https://sapphire.oasis.io',
      chainId: 0x5afe,
      accounts,
    },
    'sapphire-testnet': {
      url: 'https://testnet.sapphire.oasis.dev',
      chainId: 0x5aff,
      accounts,
    },
    'sapphire-localnet': {
      url: 'http://127.0.0.1:8545',
      chainId: 0x5afd,
      accounts,
    },
  },
  solidity: {
    version: '0.8.16',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  typechain: {
    target: 'ethers-v6',
    outDir: 'src/contracts'
  },
  watcher: {
    compile: {
      tasks: ['compile'],
      files: ['./contracts/'],
    },
    test: {
      tasks: ['test'],
      files: ['./contracts/', './test'],
    },
    coverage: {
      tasks: ['coverage'],
      files: ['./contracts/', './test'],
    },
  },
  mocha: {
    require: ['ts-node/register/files'],
    timeout: 50_000,
  },
};

export default config;
