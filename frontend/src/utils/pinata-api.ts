import type { Poll } from '../types';

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

  static async fetch (ipfsHash:string) {
    const gw = PinataApi.GATEWAY_URL ?? 'https://w3s.link/ipfs';
    const url = `${gw}/${ipfsHash}`;
    console.log('IPFS Retrieve', url);
    return await fetch(url);
  };
}
