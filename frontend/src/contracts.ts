import { computed, type ComputedRef } from 'vue';

import { DAOv1__factory, PollACLv1__factory, GaslessVoting__factory } from '@oasisprotocol/demo-voting-contracts/factories';
import type { DAOv1, GaslessVoting, PollACLv1 } from '@oasisprotocol/demo-voting-contracts/contracts'
export type { DAOv1 };
import { useEthereumStore } from './stores/ethereum';

export function useDAOv1(): ComputedRef<DAOv1> {
  const eth = useEthereumStore();
  const addr = import.meta.env.VITE_DAO_V1_ADDR!;
  return computed(() => {
    return DAOv1__factory.connect(addr, eth.provider);
  });
}

export function useDAOv1WithSigner(): DAOv1 {
  const eth = useEthereumStore();
  const addr = import.meta.env.VITE_DAO_V1_ADDR!;
  if( ! eth.signer ) {
    throw new Error('useDAOv1WithSigner, !eth.signer');
  }
  return DAOv1__factory.connect(addr, eth.signer);
}

export async function usePollACLv1(): Promise<ComputedRef<PollACLv1>> {
  const eth = useEthereumStore();
  const dao = useDAOv1().value;

  const ref = PollACLv1__factory.connect(await dao.getACL(), eth.provider);

  return computed(() => {
    return ref;
  });
}

export async function useGaslessVoting(): Promise<ComputedRef<GaslessVoting>> {
  const eth = useEthereumStore();
  const dao = useDAOv1().value;
  const proxyVoter = await dao.proxyVoter();

  const ref = GaslessVoting__factory.connect(proxyVoter, eth.provider);

  return computed(() => { return ref });
}

