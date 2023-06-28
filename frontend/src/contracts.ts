import { ethers } from 'ethers';
import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import type { BallotBoxV1, DAOv1 } from '@oasisprotocol/demo-voting-backend';
import { BallotBoxV1__factory, DAOv1__factory } from '@oasisprotocol/demo-voting-backend';

import { Network, useEthereumStore } from './stores/ethereum';

export type { BallotBoxV1, DAOv1 } from '@oasisprotocol/demo-voting-backend';

const provider = new ethers.providers.JsonRpcProvider(
  import.meta.env.VITE_WEB3_GATEWAY,
  'any',
);

export const staticBallotBox = BallotBoxV1__factory.connect(
  import.meta.env.VITE_BALLOT_BOX_V1_ADDR!,
  provider,
);
export const staticDAOv1 = DAOv1__factory.connect(import.meta.env.VITE_DAO_V1_ADDR!, provider);

export function useBallotBoxV1(): ComputedRef<{
  read: BallotBoxV1;
  write?: BallotBoxV1;
}> {
  const eth = useEthereumStore();
  const addr = import.meta.env.VITE_BALLOT_BOX_V1_ADDR!;
  return computed(() => {
    const read = BallotBoxV1__factory.connect(addr, provider);
    const write =
      eth.network === Network.FromConfig && eth.signer
        ? BallotBoxV1__factory.connect(addr, eth.signer)
        : undefined;
    return { read, write };
  });
}

export function useDAOv1(): ComputedRef<DAOv1> {
  const eth = useEthereumStore();
  const addr = import.meta.env.VITE_DAO_V1_ADDR!;
  return computed(() => {
    return DAOv1__factory.connect(addr, eth.signer ?? eth.provider);
  });
}
