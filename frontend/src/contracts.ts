import { ethers } from 'ethers';
import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import type { DAOv1 } from '@oasisprotocol/demo-voting-backend';
import { DAOv1__factory } from '@oasisprotocol/demo-voting-backend';

import { useEthereumStore } from './stores/ethereum';

export type { DAOv1 } from '@oasisprotocol/demo-voting-backend';

const provider = new ethers.providers.JsonRpcProvider(
  import.meta.env.VITE_WEB3_GATEWAY,
  'any',
);


export const staticDAOv1 = DAOv1__factory.connect(import.meta.env.VITE_DAO_V1_ADDR!, provider);

export function useDAOv1(): ComputedRef<DAOv1> {
  const eth = useEthereumStore();
  const addr = import.meta.env.VITE_DAO_V1_ADDR!;
  return computed(() => {
    return DAOv1__factory.connect(addr, eth.signer ?? eth.provider);
  });
}
