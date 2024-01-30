import type { Poll } from './types';

import { AEAD, NonceSize, KeySize, TagSize } from '@oasisprotocol/deoxysii';
import { sha256 } from '@noble/hashes/sha256';

export abstract class PinataApi {
  static JWT_TOKEN = import.meta.env.VITE_PINATA_JWT;
  static GATEWAY_URL = import.meta.env.VITE_IPFS_GATEWAY;

  static pinBody = async (poll: Poll) => {
    const body = JSON.stringify({
      pinataContent: poll,
    });

    const res = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${PinataApi.JWT_TOKEN}`,
      },
      body,
    });
    const resBody = await res.json();
    if (res.status !== 200) throw new Error('failed to pin');
    const resp = { ipfsHash: resBody.IpfsHash };
    return new Response(JSON.stringify(resp), {
      status: 201,
      headers: { 'content-type': 'application/json' },
    });
  };

  static async pinData (data:Uint8Array) {
    const form = new FormData();
    form.append('file', new Blob([data], {type: "application/octet-stream"}), 'file.bin');

    const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        //'accept': 'application/json',
        //'content-type': `multipart/form-data; boundary=${boundaryValue}`,
        //'content-type': 'multipart/form-data',
        authorization: `Bearer ${PinataApi.JWT_TOKEN}`,
      },
      body: form,
    });
    const resBody = await res.json();
    if (res.status !== 200) {
      console.log(res, resBody);
      throw new Error('pinData: failed to pin');
    }
    const resp = { ipfsHash: resBody.IpfsHash };
    return new Response(JSON.stringify(resp), {
      status: 201,
      headers: { 'content-type': 'application/json' },
    });
  }

  static async fetch (ipfsHash:string) {
    const gw = PinataApi.GATEWAY_URL ?? 'https://w3s.link/ipfs';
    const url = `${gw}/${ipfsHash}`;
    console.log('IPFS Retrieve', url);
    return await fetch(url);
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

