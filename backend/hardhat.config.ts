import '@oasisprotocol/sapphire-hardhat';
import "@nomiclabs/hardhat-ethers"
import { promises as fs } from 'fs';
import path from 'path';

import canonicalize from 'canonicalize';
import { TASK_COMPILE } from 'hardhat/builtin-tasks/task-names';
import { HardhatUserConfig, task } from 'hardhat/config';

import '@typechain/hardhat';
import 'hardhat-watcher';
import 'solidity-coverage';

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
  .setAction(async (args, hre) => {
    await hre.run('compile');
    const DAOv1 = await hre.ethers.getContractFactory('DAOv1');
    const dao = await DAOv1.deploy(hre.ethers.constants.AddressZero);
    await dao.deployed();

    console.log(`VITE_DAO_V1_ADDR=${dao.address}`);
    return dao;
});

// DAO deployment using SimpleWhitelistACL.
task('deploy-simplewhitelist')
  .setAction(async (args, hre) => {
    await hre.run('compile');
    const ACLv1 = await hre.ethers.getContractFactory('SimpleWhitelistACLv1');
    const acl = await ACLv1.deploy();
    await acl.deployed();
    const DAOv1 = await hre.ethers.getContractFactory('DAOv1');
    const dao = await DAOv1.deploy(acl.address);
    await dao.deployed();

    console.log(`VITE_DAO_V1_ADDR=${dao.address}`);
    return dao;
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
    const acl = ACLv1.attach(await dao.acl()).connect(signer);

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

const accounts = process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [];

const TEST_HDWALLET = {
  mnemonic: "test test test test test test test test test test test junk",
  path: "m/44'/60'/0'/0",
  initialIndex: 0,
  count: 20,
  passphrase: "",
};

const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      chainId: 1337, // @see https://hardhat.org/metamask-issue.html
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
      accounts: TEST_HDWALLET,
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
    timeout: 20_000,
  },
};

export default config;
