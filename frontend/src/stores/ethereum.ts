import detectEthereumProvider from '@metamask/detect-provider';
import * as sapphire from '@oasisprotocol/sapphire-paratime';
import { ethers } from 'ethers';
import { defineStore } from 'pinia';
import { markRaw, ref, shallowRef } from 'vue';
import type { EIP1193Provider } from './eip1193';

export enum Network {
  Unknown = 0,
  Ethereum = 1,
  Goerli = 10,
  BscMainnet = 56,
  BscTestnet = 97,
  EmeraldTestnet = 0xa515,
  EmeraldMainnet = 0xa516,
  SapphireTestnet = 0x5aff,
  SapphireMainnet = 0x5afe,
  SapphireLocalnet = 0x5afd,
  Local = 1337,

  FromConfig = parseInt(import.meta.env.VITE_NETWORK),
}


export enum ConnectionStatus {
  Unknown,
  Disconnected,
  Connected,
}


const networkNameMap: Record<Network, string> = {
  [Network.Unknown]: 'Unknown Network',
  [Network.Ethereum]: 'Ethereum',
  [Network.Local]: 'Local Network',
  [Network.Goerli]: 'Goerli',
  [Network.EmeraldTestnet]: 'Emerald Testnet',
  [Network.EmeraldMainnet]: 'Emerald Mainnet',
  [Network.SapphireTestnet]: 'Sapphire Testnet',
  [Network.SapphireMainnet]: 'Sapphire Mainnet',
  [Network.SapphireLocalnet]: 'Sapphire Localnet',
  [Network.BscMainnet]: 'BSC',
  [Network.BscTestnet]: 'BSC Testnet',
} as const;


function networkFromChainId(chainId: number | string): Network {
  const id = typeof chainId === 'string' ? parseInt(chainId, 16) : chainId;
  if (Network[id]) return id as Network;
  return Network.Unknown;
}


export function networkName(network?: Network) : string {
  if (network && networkNameMap[network]) {
    return networkNameMap[network];
  }
  return networkNameMap[Network.Unknown];
}


declare global {
  interface Window {
    ethereum: EIP1193Provider;
  }
}


export const useEthereumStore = defineStore('ethereum', () => {
  const signer = shallowRef<ethers.providers.JsonRpcSigner | undefined>(undefined);
  const provider = shallowRef<ethers.providers.JsonRpcProvider>(
    markRaw(sapphire.wrap(new ethers.providers.JsonRpcProvider(import.meta.env.VITE_WEB3_GATEWAY, 'any'))),
  );
  const network = ref(Network.FromConfig);
  const address = ref<string | undefined>();
  const status = ref(ConnectionStatus.Unknown);
  const isSapphire = ref<boolean>(false);

  async function _changeAccounts(accounts:string[])
  {
    if( accounts.length ) {
      status.value = ConnectionStatus.Connected;
    }
    else {
      status.value = ConnectionStatus.Disconnected;
      signer.value = undefined;
      network.value = Network.Unknown;
      address.value = undefined;
    }
  }


  detectEthereumProvider<EIP1193Provider>().then(async (ethProvider) => {
    if( !ethProvider ) {
      console.log('No EIP-1193 provider discovered using detectEthereumProvider');
      return;
    }

    console.log('detchEthereumProvider');
    await getSigner();

    ethProvider.on('accountsChanged', async (accounts) => {
      //await getSigner();
      console.log('accountsChanged')
      await _changeAccounts(accounts);
    });
    ethProvider.on('chainChanged', async (chainId) => {
      await getSigner();
      console.log('chainChanged', chainId);
    });
    ethProvider.on('connect', (info) => {
      network.value = networkFromChainId(info.chainId);
      status.value = ConnectionStatus.Connected;
      console.log('connect');
      // TODO: request accounts?
    });
    ethProvider.on('disconnect', () => {
      console.log('disconnect');
      _changeAccounts([]);
    });
    _changeAccounts(await ethProvider.request({method:'eth_accounts'}));
  });


  async function getSigner (in_doConnect?:boolean, in_doSwitch?:boolean, in_account?:string) {
    let l_signer;
    console.log('getSigner Start!');
    if( ! signer.value || (in_account && await signer.value.getAddress() != in_account) ) {
      const ethProvider = await detectEthereumProvider<EIP1193Provider>();
      if( ! ethProvider ) {
        throw new Error("Can't connect! No window.ethereum!");
      }
      console.log('getSigner assign new l_signer');
      l_signer = new ethers.providers.Web3Provider(ethProvider).getSigner(in_account);
    }
    else {
      l_signer = signer.value;
    }

    let l_accounts = await l_signer.provider.send('eth_accounts', [])

    // Check if we are already connecting before requesting accounts again
    if( in_doConnect ) {
      console.log('getSigner doConnect');
      if( ! l_accounts.length ) {
        console.log('getSigner request accounts');
        l_accounts = await l_signer.provider.send('eth_requestAccounts', []);
        await _changeAccounts(l_accounts);
      }
      console.log('getSigner, already have accounts', l_accounts)
    }

    // Check if we're requested to switch networks
    let l_network = networkFromChainId(await l_signer.provider.send('eth_chainId', []));
    console.log('getSigner, network is', l_network, network.value, in_doSwitch);
    if( in_doSwitch && (l_network != network.value || l_network != Network.FromConfig) ) {
      console.log('Need to switch');
      try {
        await l_signer.provider.send('wallet_switchEthereumChain', [{ chainId: ethers.utils.hexlify(Network.FromConfig).replace('0x0', '0x') }]);
        l_network = Network.FromConfig;
      } catch (e: any) {
        // This error code indicates that the chain has not been added to MetaMask.
        if ((e as any).code !== 4902) throw e;
        addNetwork(l_network);
        throw e;
      }
    }

    // Sapphire signers are always wrapped
    const l_isSapphire = l_network in sapphire.NETWORKS;
    if( l_isSapphire ) {
      l_signer = sapphire.wrap(l_signer);
    }

    signer.value = l_signer;
    network.value = l_network;
    isSapphire.value = l_isSapphire;
    if( l_accounts.length ) {
      address.value = l_accounts[0];
      status.value = ConnectionStatus.Connected;
    }

    return l_signer;
  }


  // Request that window.ethereum be connected to an account
  // Only sets `signer` value upon successful connection
  async function connect()
  {
    await getSigner(true,true);
  }


  async function addNetwork(network: Network = Network.FromConfig) {
    const eth = await detectEthereumProvider<EIP1193Provider>();;
    if( ! eth ) {
      console.log('addNetwork detectEthereumProvider = null');
      return;
    }

    if (network == Network.SapphireTestnet) {
      await eth.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0x5aff',
            chainName: 'Sapphire Testnet',
            nativeCurrency: { name: 'TEST', symbol: 'TEST', decimals: 18 },
            rpcUrls: ['https://testnet.sapphire.oasis.dev/', 'wss://testnet.sapphire.oasis.dev/ws'],
            blockExplorerUrls: ['https://explorer.stg.oasis.io/testnet/sapphire'],
          },
        ],
      });
    } else if (network === Network.SapphireMainnet) {
      await eth.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0x5afe',
            chainName: 'Sapphire Mainnet',
            nativeCurrency: {
              name: 'ROSE',
              symbol: 'ROSE',
              decimals: 18,
            },
            rpcUrls: ['https://sapphire.oasis.io/', 'wss://sapphire.oasis.io/ws'],
            blockExplorerUrls: ['https://explorer.oasis.io/mainnet/sapphire'],
          },
        ],
      });
    } else if (network === Network.SapphireLocalnet) {
      await eth.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0x5afd',
            chainName: 'Sapphire Localnet',
            rpcUrls: ['http://localhost:8545'],
          },
        ],
      });
    }
  }


  async function switchNetwork(network: Network=Network.FromConfig) {
    await getSigner(true,true);
  }


  return {
    signer,
    provider,
    address,
    network,
    connect,
    addNetwork,
    switchNetwork,
    isSapphire
  };

});
