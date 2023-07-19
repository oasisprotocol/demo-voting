//import '@oasisprotocol/sapphire-hardhat';
import "@nomiclabs/hardhat-ethers"
import { promises as fs } from 'fs';
import path from 'path';

import canonicalize from 'canonicalize';
import { TASK_COMPILE } from 'hardhat/builtin-tasks/task-names';
import { HardhatUserConfig, task } from 'hardhat/config';

import '@typechain/hardhat';
import 'hardhat-watcher';
import 'solidity-coverage';
import { EthereumUtils, GaslessVoting } from './typechain-types';
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

    let gv : GaslessVoting | undefined;
    let gv_address : string | undefined;

    let acl: EthereumUtils | undefined;
    if (args.acl) {
      console.log('Deploying ACL')
      const ACLv1 = await hre.ethers.getContractFactory(args.acl);
      acl = await ACLv1.deploy();
      await acl.deployed();
      console.log(`Deployed ACL to ${acl.address}`);
    }

    if( args.gasless ) {
      console.log('Deploying GaslessVoting');
      const GaslessVoting_factory = await hre.ethers.getContractFactory('GaslessVoting');
      const funds = hre.ethers.utils.parseEther(args.gaslessFunds);

      gv = await GaslessVoting_factory.deploy(hre.ethers.constants.AddressZero, {value: funds});
      await gv.deployed();
      gv_address = gv.address;
      console.log(`Deployed GaslessVoting proxy to ${gv_address}`);
    }

    const DAOv1 = await hre.ethers.getContractFactory('DAOv1');
    const dao = await DAOv1.deploy(acl ? acl.address : hre.ethers.constants.AddressZero, gv_address ?? hre.ethers.constants.AddressZero);
    await dao.deployed();

    if( gv ) {
      await gv.setDAO(dao.address);

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
    }

    console.log(`VITE_DAO_V1_ADDR=${dao.address}`);
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
    const min = hre.ethers.utils.parseEther(args.min);
    const dryrun = args.dryrun;
    const mintop = hre.ethers.utils.parseEther(args.minimumTopup);

    for( const addr of await gv.listAddresses() )
    {
      const bal = await gv.provider.getBalance(addr);
      console.log(addr, 'has', hre.ethers.utils.formatEther(bal), `ROSE (${bal} wei)`);

      if( bal.lt(min) )
      {
        const diff = min.sub(bal);
        if( diff.gte(mintop) )
        {
          console.log(' - needs', hre.ethers.utils.formatEther(diff), 'ROSE');
          if( ! dryrun )
          {
            const tx = await gv.signer.sendTransaction({
              to: addr,
              data: "0x",
              value: diff
            });
            console.log(' -', tx.hash);
            tx.wait();
            const newBal = await gv.provider.getBalance(addr);
            console.log(' - new balance', hre.ethers.utils.formatEther(newBal), `ROSE (${newBal} wei)`);
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
    const value = hre.ethers.utils.parseEther(args.amount);
    console.log(`Creating ${n} keypairs, with ${args.amount} ROSE each`);
    for( let i = 0; i < n; i++ ) {
      const tx = await gv.addKeypair({value: value});
      const receipt = await tx.wait();
      const frag = gv.interface.getEvent('KeypairCreated');
      const eventArgs = gv.interface.decodeEventLog(frag, receipt.logs[0].data);
      const addr = eventArgs.addr;
      console.log(` - ${addr}`, hre.ethers.utils.formatEther(await gv.provider.getBalance(addr)), 'ROSE');
    }
});

// Whitelist the voters for the poll in DAO using SimpleWhitelistACL.
// Required env variables:
// - PRIVATE_KEY: private key of the poll manager
// - VITE_DAO_V1_ADDR: address of the DAO contract
// - PROPOSAL_ID: ID of the poll
// - VOTERS_FILE: path to the file containing eligible voters, one address per line
task('whitelist-voters')
  .setAction(async (args, hre) => {
    await hre.run('compile');

    const DAOv1 = await hre.ethers.getContractFactory('DAOv1');
    const dao = DAOv1.attach(process.env.VITE_DAO_V1_ADDR!);
    const signer = new hre.ethers.Wallet(process.env.PRIVATE_KEY!, hre.ethers.provider);
    const ACLv1 = await hre.ethers.getContractFactory('SimpleWhitelistACLv1');
    const acl = ACLv1.attach(await dao.getACL()).connect(signer);

    let file = await fs.readFile(process.env.VOTERS_FILE!);
    const addrRaw = file.toString().split("\n");
    let addresses: string[] = [];
    for(const i in addrRaw) {
      if (hre.ethers.utils.isAddress(addrRaw[i])) {
        addresses.push(addrRaw[i]);
      }
    }
    await (await acl.setEligibleVoters(dao.address, (process.env.PROPOSAL_ID!.startsWith("0x")?"":"0x")+process.env.PROPOSAL_ID!, addresses)).wait();
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
      url: 'http://localhost:8545',
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
