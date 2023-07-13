<script setup lang="ts">
import { ethers } from 'ethers';
import { reactive, ref } from 'vue';
import { ContentLoader } from 'vue-content-loader';

import type { Poll } from '../../../functions/api/types';
import type { DAOv1 } from '../contracts';
import { useDAOv1, usePollACLv1 } from '../contracts';
import { Network, useEthereumStore } from '../stores/ethereum';
import AppButton from '@/components/AppButton.vue';
import AppPoll from '@/components/AppPoll.vue';

const eth = useEthereumStore();
const dao = useDAOv1();

type FullProposal = DAOv1.ProposalWithIdStructOutput & { params: Poll };
const activePolls = reactive<Record<string, FullProposal>>({});
const pastPolls = reactive<Record<string, FullProposal>>({});
let canCreatePoll = ref<Boolean>(false);

async function fetchProposals(
  fetcher: (offset: number, batchSize: number) => Promise<DAOv1.ProposalWithIdStructOutput[]>,
  destination: Record<string, FullProposal>,
): Promise<void> {
  await eth.switchNetwork(Network.FromConfig);
  const batchSize = 100;
  for (let offset = 0; ; offset += batchSize) {
    let proposals: DAOv1.ProposalWithIdStructOutput[] = [];
    try {
      proposals = await fetcher(offset, batchSize);
    } catch (e: any) {
      console.error('failed to fetch proposals', e);
      break;
    }
    proposals.forEach(async ({ id, proposal }) => {
      const ipfsHash = proposal.params.ipfsHash;
      id = id.slice(2);
      try {
        const ipfsParamsRes = await fetch(`https://w3s.link/ipfs/${ipfsHash}`);
        const params: Poll = await ipfsParamsRes.json();
        destination[id] = { id, params, proposal } as any;
      } catch (e) {
        console.error('failed to fetch proposal params from IPFS', e);
      }
    });
    if (proposals.length < batchSize) return;
  }
}

(async () => {
  const acl = await usePollACLv1();
  const userAddress = eth.signer ? await eth.signer.getAddress() : ethers.constants.AddressZero;
  canCreatePoll.value = await acl.value.callStatic.canCreatePoll(dao.value.address, userAddress);

  const { number: blockTag } = await eth.provider.getBlock('latest');
  fetchProposals(
    (offset, batchSize) =>
      dao.value.callStatic.getActiveProposals(offset, batchSize, {
        blockTag,
      }),
    activePolls,
  );
  fetchProposals((offset, batchSize) => {
    return dao.value.callStatic.getPastProposals(offset, batchSize, {
      blockTag,
    });
  }, pastPolls);
})();
</script>

<template>
  <RouterLink class="fixed bottom-10 left-1/2 -translate-x-1/2" v-if="canCreatePoll" to="polls">
    <AppButton variant="secondary">Add a new Poll</AppButton>
  </RouterLink>
  <section
    class="pt-5"
    v-if="Object.keys(activePolls).length > 0 || Object.keys(pastPolls).length > 0"
  >
    <AppPoll
      v-for="[pollId, poll] in Object.entries(activePolls)"
      :key="pollId"
      :poll-id="pollId"
      :name="poll.params.name"
      :description="poll.params.description"
      :creator-address="poll.params.creator"
      active
    />
    <AppPoll
      v-for="[pollId, poll] in Object.entries(pastPolls)"
      :key="pollId"
      :poll-id="pollId"
      :name="poll.params.name"
      :description="poll.params.description"
      :creator-address="poll.params.creator"
      :choices="poll.params.choices"
      :outcome="poll.proposal.topChoice"
    />
  </section>
  <section v-else>
    <ContentLoader class="inline" width="1" height="1">
      <rect x="0" y="0" rx="3" ry="3" width="5" height="5" />
    </ContentLoader>
  </section>
</template>

<style scoped lang="postcss">
form {
  @apply text-center;
}

input {
  @apply block my-4 p-1 mx-auto text-3xl text-center border border-gray-400 rounded-md;
}

h2 {
  @apply font-bold text-2xl my-2;
}
</style>
