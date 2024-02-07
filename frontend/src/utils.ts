import type { Poll, GetProofResponse } from './types';
import { Alchemy, Network, Utils } from 'alchemy-sdk';
import { AEAD, NonceSize, KeySize, TagSize } from '@oasisprotocol/deoxysii';
import { solidityPackedKeccak256, zeroPadValue } from 'ethers';
import { sha256 } from '@noble/hashes/sha256';
import { LRUCache } from 'typescript-lru-cache';

export abstract class Pinata {
  static JWT_TOKEN = import.meta.env.VITE_PINATA_JWT;
  static GATEWAY_URL = import.meta.env.VITE_IPFS_GATEWAY;

  static #cache = new LRUCache<string,Uint8Array>();

  static async pinData (data:Uint8Array) {
    const form = new FormData();
    form.append('file', new Blob([data], {type: "application/octet-stream"}), 'file.bin');

    const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${Pinata.JWT_TOKEN}`,
      },
      body: form,
    });
    const resBody = await res.json();
    if (res.status !== 200) {
      console.log(res, resBody);
      throw new Error('pinData: failed to pin');
    }
    Pinata.#cache.set(resBody.IpfsHash, data);
    return resBody.IpfsHash as string;
  }

  static async fetchData (ipfsHash:string) {
    if( Pinata.#cache.has(ipfsHash) ) {
      return Pinata.#cache.get(ipfsHash)!;
    }
    const gw = Pinata.GATEWAY_URL ?? 'https://w3s.link/ipfs';
    const url = `${gw}/${ipfsHash}`;
    const resp = await fetch(url);
    const data = new Uint8Array(await resp.arrayBuffer())
    Pinata.#cache.set(ipfsHash, data);
    return data;
  };
}


/// XXX: Seriously JavaScript... can't compare Uint8Arrays???
function areBytewiseEqual(a:Uint8Array, b:Uint8Array) {
  return indexedDB.cmp(a, b) === 0;
}


export function decrypt(key:Uint8Array, cipherbytes:Uint8Array) {
  if( cipherbytes.length <= (NonceSize + TagSize) ) {
    throw new Error('decrypt: invalid cipherbytes length');
  }
  if( key.length != KeySize ) {
    throw new Error('decrypt: invalid key length');
  }
  const nonce = cipherbytes.slice(0, NonceSize);
  const plainbytes = new AEAD(new Uint8Array(key)).decrypt(nonce, cipherbytes.slice(NonceSize));
  const keyedDigest = sha256.create().update(key).update(plainbytes).digest();
  if( ! areBytewiseEqual(keyedDigest.slice(0,NonceSize),nonce) ) {
    throw new Error('decrypt: invalid nonce');
  }
  return new TextDecoder().decode(plainbytes);
}


export function decryptJSON(key:Uint8Array, cipherbytes:Uint8Array) {
  const plaintext = decrypt(key, cipherbytes);
  return JSON.parse(plaintext);
}


export function encrypt(plaintext:string) {
  const plainbytes = new TextEncoder().encode(plaintext);
  const key = window.crypto.getRandomValues(new Uint8Array(KeySize));
  const nonce = sha256.create().update(key).update(plainbytes).digest().slice(0, NonceSize);
  const cipherbytes = new Uint8Array([...nonce, ...new AEAD(new Uint8Array(key)).encrypt(nonce, plainbytes)]);
  return {key, cipherbytes};
}


export function encryptJSON(plain:any) {
  return encrypt(JSON.stringify(plain));
}


export const abbrAddr = (address: string): string => {
    if (!address) return '';
    const addr = address.replace('0x', '');
    return `${addr.slice(0, 5)}…${addr.slice(-5)}`;
};


function rejectDelay(reason: string) {
  return new Promise(function (resolve, reject) {
    setTimeout(reject.bind(null, reason), 5000);
  });
}

export async function retry<T extends Promise<any>>(
    attempt: T,
    tryCb: (value: Awaited<T>) => void = () => {},
    maxAttempts = 10,
): Promise<Awaited<T>> {
    let p: Promise<Awaited<typeof attempt>> = Promise.reject();

    for (let i = 0; i < maxAttempts; i++) {
      p = p
        .catch(() => attempt)
        .then((value) => {
          return tryCb(value);
        })
        .catch(rejectDelay) as Promise<Awaited<typeof attempt>>;
    }

    return p;
}

export function getMapSlot(holderAddress: string, mappingPosition: number): string {
  return solidityPackedKeccak256(
    ["bytes", "uint256"],
    [zeroPadValue(holderAddress, 32), mappingPosition]
  );
}

export abstract class AlchemyClient {
  static API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY;

  static async isERCTokenContract(network: keyof typeof Network, address: string): Promise<boolean> {
    const client = new Alchemy({
      apiKey: this.API_KEY,
      network: Network[network]
    });

    // Apply heuristic based on token function
    const abi = ["function totalSupply()"];
    const iface = new Utils.Interface(abi);
    const totalSupplyData = iface.encodeFunctionData("totalSupply");

    try {
      await client.core.call({
        to: address,
        data: totalSupplyData,
      })
    } catch (e) {
      return false
    }

    return true;
  }

  static async guessStorageSlots(network: keyof typeof Network, blockHash: string, account: string, holder: string): Promise<number | null> {
    const client = new Alchemy({
      apiKey: this.API_KEY,
      network: Network[network]
    });

    const abi = ["function balanceOf(address account)"];
    const iface = new Utils.Interface(abi);
    const balanceData = iface.encodeFunctionData("balanceOf", [holder]);

    // Get balance for the wallet address in hex format -- usage of eth_call
    const balanceInHex = await client.core.call({
      to: account,
      data: balanceData,
    });

    // Query most likely range of slots
    for (let i = 0; i < 256; i++) {
      const result = await client.core.send('eth_getStorageAt', [
        account,
        getMapSlot(holder, i),
        blockHash,
      ]);

      if (result == balanceInHex && result != '0x0000000000000000000000000000000000000000000000000000000000000000') {
        return i;
      }
    }

    return null;
  }

  static async fetchStorageProof(network: keyof typeof Network, blockHash: string, address: string, slot: number, holder: string): Promise<GetProofResponse> {
    const client = new Alchemy({
      apiKey: this.API_KEY,
      network: Network[network]
    });

    // TODO Probably unpack and verify
    return client.core.send('eth_getProof', [
      address,
      getMapSlot(holder, slot),
      blockHash,
    ]);
  }
}
