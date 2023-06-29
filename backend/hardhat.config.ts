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

task('deploy')
  .setAction(async (args, hre) => {
    await hre.run('compile');
    const DAOv1 = await hre.ethers.getContractFactory('DAOv1');
    const dao = await DAOv1.deploy();
    const receipt = await dao.deployed();
    console.log(`VITE_DAO_V1_ADDR=${dao.address}`);
    while( true ) {
      try{
        const bba = await dao.ballotBox();
        console.log(`VITE_BALLOT_BOX_V1_ADDR=${bba}`);
      }
      catch( e ) {
        await new Promise(r => setTimeout(r, 2000));
        console.log('.');
        continue;
      }
      break;
    }
    return dao;
  });

const accounts = process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [];

const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      chainId: 1337, // @see https://hardhat.org/metamask-issue.html
    },
    goerli: {
      url: 'https://goerli.infura.io/v3/813e377eac3a4e74b1f7262b3b20b3c6',
      chainId: 5,
      accounts,
    },
    sepolia: {
      url: 'https://rpc.sepolia.org',
      chainId: 11155111,
      accounts,
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
