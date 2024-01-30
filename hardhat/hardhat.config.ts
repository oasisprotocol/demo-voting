import '@oasisprotocol/sapphire-hardhat';
import "@nomicfoundation/hardhat-ethers"
import 'hardhat-tracer';
import { existsSync, promises as fs } from 'fs';
import path from 'path';

import canonicalize from 'canonicalize';
import { TASK_COMPILE } from 'hardhat/builtin-tasks/task-names';
import { HardhatUserConfig, task } from 'hardhat/config';

import '@typechain/hardhat';

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
      const { abi, bytecode, contractName, sourceName } = await hre.artifacts.readArtifact(fqn);
      if (abi.length === 0 || !sourceName.startsWith(srcDir) || contractName.endsWith('Test')) {
        return;
      }
      await fs.writeFile(`${path.join(outDir, contractName)}.json`, `${canonicalize(abi)}\n`);
      await fs.writeFile(`${path.join(outDir, contractName)}.bin`, bytecode);
    }),
  );
}).setDescription('Saves ABI and bytecode to the "abis" directory');

async function tee(filename?:string, line?:string) {
  if( line !== undefined ) {
    console.log(line);
    if( filename ) {
      await fs.appendFile(filename, line + "\n");
    }
  }
}

interface DeployArgs {
  viteenv: string | undefined;
}

// Default DAO deployment, no permissions.
task('deploy')
  .addParam('viteenv', 'Output contract addresses to environment file', '')
  .setAction(async (args:DeployArgs, hre) => {
    await hre.run('compile', {quiet:true});

    if( args.viteenv ) {
      console.log(`# Saving environment to ${args.viteenv}`);
      if( existsSync(args.viteenv) )
      {
        await fs.unlink(args.viteenv);
      }
    }

    // Export RPC info etc. from current hardhat config
    const currentNetwork = Object.values(hre.config.networks).find((x) => x.chainId === hre.network.config.chainId);
    const currentNetworkUrl = (currentNetwork as any).url;
    tee(args.viteenv, `VITE_NETWORK=${hre.network.config.chainId}`);
    if( ! currentNetworkUrl ) {
      tee(args.viteenv, 'VITE_WEB3_GATEWAY=http://localhost:8545');
    }
    else {
      tee(args.viteenv, `VITE_WEB3_GATEWAY=${currentNetworkUrl}`);
    }

    const factory_AllowAllACL = await hre.ethers.getContractFactory('AllowAllACL');
    const contract_AllowAllACL = await factory_AllowAllACL.deploy();
    await tee(args.viteenv, '');
    await tee(args.viteenv, `# AllowAllACL tx ${contract_AllowAllACL.deploymentTransaction()?.hash}`);
    await contract_AllowAllACL.waitForDeployment();
    await tee(args.viteenv, `VITE_CONTRACT_ACL_ALLOWALL=${await contract_AllowAllACL.getAddress()}`);

    const factory_VoterAllowListACL = await hre.ethers.getContractFactory('VoterAllowListACL');
    const contract_VoterAllowListACL = await factory_VoterAllowListACL.deploy();
    await tee(args.viteenv, '');
    await tee(args.viteenv, `# VoterAllowListACL tx ${contract_VoterAllowListACL.deploymentTransaction()?.hash}`);
    await contract_VoterAllowListACL.waitForDeployment();
    await tee(args.viteenv, `VITE_CONTRACT_ACL_VOTERALLOWLIST=${await contract_VoterAllowListACL.getAddress()}`);

    const factory_TokenHolderACL = await hre.ethers.getContractFactory('TokenHolderACL');
    const contract_TokenHolderACL = await factory_TokenHolderACL.deploy();
    await tee(args.viteenv, '');
    await tee(args.viteenv, `# TokenHolderACL tx ${contract_TokenHolderACL.deploymentTransaction()?.hash}`);
    await contract_TokenHolderACL.waitForDeployment();
    await tee(args.viteenv, `VITE_CONTRACT_ACL_TOKENHOLDER=${await contract_TokenHolderACL.getAddress()}`);

    const factory_GaslessVoting = await hre.ethers.getContractFactory('GaslessVoting');
    const contract_GaslessVoting = await factory_GaslessVoting.deploy();
    await tee(args.viteenv, '');
    await tee(args.viteenv, `# GaslessVoting tx ${contract_GaslessVoting.deploymentTransaction()?.hash}`);
    await contract_GaslessVoting.waitForDeployment();
    await tee(args.viteenv, `VITE_CONTRACT_GASLESSVOTING=${await contract_GaslessVoting.getAddress()}`);

    const pollmanager_acl = await contract_AllowAllACL.getAddress();
    const factory_PollManager = await hre.ethers.getContractFactory('PollManager');
    const contract_PollManager = await factory_PollManager.deploy(
      pollmanager_acl,
      await contract_GaslessVoting.getAddress()
    );
    await tee(args.viteenv, '');
    await tee(args.viteenv, `# PollManager tx ${contract_PollManager.deploymentTransaction()?.hash}`);
    await contract_PollManager.waitForDeployment();
    await tee(args.viteenv, `VITE_CONTRACT_POLLMANAGER=${await contract_PollManager.getAddress()}`);

    await tee(args.viteenv, '# IPollManagerACL used by PollManager');
    await tee(args.viteenv, `VITE_CONTRACT_POLLMANAGER_ACL=${pollmanager_acl}`)
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
    version: '0.8.23',
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
  mocha: {
    require: ['ts-node/register/files'],
    timeout: 50_000,
  },
};

export default config;
