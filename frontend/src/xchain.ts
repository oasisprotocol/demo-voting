import { Contract, ContractRunner, JsonRpcProvider, Provider } from "ethers"

import { randomchoice } from './utils'

export const chain_info: Record<number,any> = {
    1: {
        "name": "Ethereum Mainnet",
        "chain": "ETH",
        "icon": "ethereum",
        "rpc": [
          "https://mainnet.infura.io/v3/${INFURA_API_KEY}",
          "wss://mainnet.infura.io/ws/v3/${INFURA_API_KEY}",
          "https://api.mycryptoapi.com/eth",
          "https://cloudflare-eth.com",
          "https://ethereum.publicnode.com",
          "wss://ethereum.publicnode.com",
          "https://mainnet.gateway.tenderly.co",
          "wss://mainnet.gateway.tenderly.co",
          "https://rpc.blocknative.com/boost",
          "https://rpc.flashbots.net",
          "https://rpc.flashbots.net/fast",
          "https://rpc.mevblocker.io",
          "https://rpc.mevblocker.io/fast",
          "https://rpc.mevblocker.io/noreverts",
          "https://rpc.mevblocker.io/fullprivacy"
        ],
        "features": [{ "name": "EIP155" }, { "name": "EIP1559" }],
        "faucets": [],
        "nativeCurrency": {
          "name": "Ether",
          "symbol": "ETH",
          "decimals": 18
        },
        "infoURL": "https://ethereum.org",
        "shortName": "eth",
        "chainId": 1,
        "networkId": 1,
        "slip44": 60,
        "ens": {
          "registry": "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e"
        },
        "explorers": [
          {
            "name": "etherscan",
            "url": "https://etherscan.io",
            "standard": "EIP3091"
          },
          {
            "name": "blockscout",
            "url": "https://eth.blockscout.com",
            "icon": "blockscout",
            "standard": "EIP3091"
          },
          {
            "name": "dexguru",
            "url": "https://ethereum.dex.guru",
            "icon": "dexguru",
            "standard": "EIP3091"
          }
        ]
    },
    56: {
        "name": "BNB Smart Chain Mainnet",
        "chain": "BSC",
        "rpc": [
          "https://bsc-dataseed1.bnbchain.org",
          "https://bsc-dataseed2.bnbchain.org",
          "https://bsc-dataseed3.bnbchain.org",
          "https://bsc-dataseed4.bnbchain.org",
          "https://bsc-dataseed1.defibit.io",
          "https://bsc-dataseed2.defibit.io",
          "https://bsc-dataseed3.defibit.io",
          "https://bsc-dataseed4.defibit.io",
          "https://bsc-dataseed1.ninicoin.io",
          "https://bsc-dataseed2.ninicoin.io",
          "https://bsc-dataseed3.ninicoin.io",
          "https://bsc-dataseed4.ninicoin.io",
          "https://bsc.publicnode.com",
          "wss://bsc.publicnode.com",
          "wss://bsc-ws-node.nariox.org"
        ],
        "faucets": [],
        "nativeCurrency": {
          "name": "BNB Chain Native Token",
          "symbol": "BNB",
          "decimals": 18
        },
        "infoURL": "https://www.bnbchain.org/en",
        "shortName": "bnb",
        "chainId": 56,
        "networkId": 56,
        "slip44": 714,
        "explorers": [
          {
            "name": "bscscan",
            "url": "https://bscscan.com",
            "standard": "EIP3091"
          },
          {
            "name": "dexguru",
            "url": "https://bnb.dex.guru",
            "icon": "dexguru",
            "standard": "EIP3091"
          }
        ]
    },
    42161: {
        "name": "Arbitrum One",
        "chainId": 42161,
        "shortName": "arb1",
        "chain": "ETH",
        "networkId": 42161,
        "nativeCurrency": {
          "name": "Ether",
          "symbol": "ETH",
          "decimals": 18
        },
        "rpc": [
          "https://arbitrum-mainnet.infura.io/v3/${INFURA_API_KEY}",
          "https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}",
          "https://arb1.arbitrum.io/rpc",
          "https://arbitrum-one.publicnode.com",
          "wss://arbitrum-one.publicnode.com"
        ],
        "faucets": [],
        "explorers": [
          {
            "name": "Arbiscan",
            "url": "https://arbiscan.io",
            "standard": "EIP3091"
          },
          {
            "name": "Arbitrum Explorer",
            "url": "https://explorer.arbitrum.io",
            "standard": "EIP3091"
          },
          {
            "name": "dexguru",
            "url": "https://arbitrum.dex.guru",
            "icon": "dexguru",
            "standard": "EIP3091"
          }
        ],
        "infoURL": "https://arbitrum.io",
        "parent": {
          "type": "L2",
          "chain": "eip155-1",
          "bridges": [{ "url": "https://bridge.arbitrum.io" }]
        }
    },
    10: {
        "name": "OP Mainnet",
        "chain": "ETH",
        "rpc": [
          "https://mainnet.optimism.io",
          "https://optimism.publicnode.com",
          "wss://optimism.publicnode.com",
          "https://optimism.gateway.tenderly.co",
          "wss://optimism.gateway.tenderly.co"
        ],
        "faucets": [],
        "nativeCurrency": {
          "name": "Ether",
          "symbol": "ETH",
          "decimals": 18
        },
        "infoURL": "https://optimism.io",
        "shortName": "oeth",
        "chainId": 10,
        "networkId": 10,

        "explorers": [
          {
            "name": "etherscan",
            "url": "https://optimistic.etherscan.io",
            "standard": "EIP3091"
          },
          {
            "name": "blockscout",
            "url": "https://optimism.blockscout.com",
            "icon": "blockscout",
            "standard": "EIP3091"
          },
          {
            "name": "dexguru",
            "url": "https://optimism.dex.guru",
            "icon": "dexguru",
            "standard": "EIP3091"
          }
        ]
    },
    137: {
        "name": "Polygon Mainnet",
        "chain": "Polygon",
        "icon": "polygon",
        "rpc": [
          "https://polygon-rpc.com/",
          "https://rpc-mainnet.matic.network",
          "https://matic-mainnet.chainstacklabs.com",
          "https://rpc-mainnet.maticvigil.com",
          "https://rpc-mainnet.matic.quiknode.pro",
          "https://matic-mainnet-full-rpc.bwarelabs.com",
          "https://polygon-bor.publicnode.com",
          "wss://polygon-bor.publicnode.com",
          "https://polygon.gateway.tenderly.co",
          "wss://polygon.gateway.tenderly.co"
        ],
        "faucets": [],
        "nativeCurrency": {
          "name": "MATIC",
          "symbol": "MATIC",
          "decimals": 18
        },
        "infoURL": "https://polygon.technology/",
        "shortName": "matic",
        "chainId": 137,
        "networkId": 137,
        "slip44": 966,
        "explorers": [
          {
            "name": "polygonscan",
            "url": "https://polygonscan.com",
            "standard": "EIP3091"
          },
          {
            "name": "dexguru",
            "url": "https://polygon.dex.guru",
            "icon": "dexguru",
            "standard": "EIP3091"
          }
        ]
    }
} as const;

function _getNameAndChainidMap() {
  const res: Record<number,string> = {};
  for( const x in chain_info ) {
    const y = chain_info[x];
    res[y.name] = y.chainId;
  }
  return res;
}

export const xchain_ChainNamesToChainId = _getNameAndChainidMap();

export function xchainRPC(chainId:number)
{
    if( ! (chainId in chain_info) ) {
        throw new Error(`Unknown chain: ${chainId}`);
    }

    const info = chain_info[chainId];
    const rpc_url = randomchoice(info.rpc as string[]);
    return new JsonRpcProvider(rpc_url);
}

export async function tokenDetailsFromProvider(addr:string, provider:ContractRunner)
{
  const abi = [
    "function name() public view returns (string)",
    "function symbol() public view returns (string)",
    "function decimals() public view returns (uint8)",
    "function totalSupply() public view returns (uint256)",
  ];
  const c = new Contract(addr, abi, provider);
  try {
    return {
      name: await c.name(),
      symbol: await c.symbol(),
      decimals: await c.decimals(),
      totalSupply: await c.totalSupply(),
    }
  }
  catch(e:any) {
    return {
      error: e
    }
  }
}
