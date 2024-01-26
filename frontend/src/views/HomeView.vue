<script setup lang="ts">
import { ethers } from 'ethers';
import { onMounted, ref, shallowRef } from 'vue';

import type { Poll } from '../types';
import type { DAOv1 } from '../contracts';
import { useDAOv1, usePollACLv1 } from '../contracts';
import { useEthereumStore } from '../stores/ethereum';
import AppButton from '@/components/AppButton.vue';
import AppPoll from '@/components/AppPoll.vue';
import PollLoader from '@/components/PollLoader.vue';

const eth = useEthereumStore();
const dao = useDAOv1();

type FullProposal = DAOv1.ProposalWithIdStructOutput & { params: Poll };
const activePolls = shallowRef<Record<string, FullProposal>>({});
const pastPolls = shallowRef<Record<string, FullProposal>>({});
const canCreatePoll = ref<Boolean>(false);
const isLoadingActive = ref<Boolean>(true);
const isLoadingPast = ref<Boolean>(true);

async function fetchProposals(
  fetcher: (offset: number, batchSize: number) => Promise<DAOv1.ProposalWithIdStructOutput[]>,
): Promise<Record<string, FullProposal>> {
  const proposalsMap: Record<string, FullProposal> = {};

  const batchSize = 100;
  for (let offset = 0; ; offset += batchSize) {
    let proposals: DAOv1.ProposalWithIdStructOutput[] = [];
    try {
      proposals = await fetcher(offset, batchSize);
    } catch (e: any) {
      console.error('failed to fetch proposals', e);
      break;
    }
    await Promise.all(
      proposals.map(({ id, proposal }) => {
        const ipfsHash = proposal.params.ipfsHash;
        id = id.slice(2);

        return fetch(`https://w3s.link/ipfs/${ipfsHash}`)
          .then((res) => res.json())
          .then((params) => {
            proposalsMap[id] = { id, params, proposal } as FullProposal;
          })
          .catch((e) => console.error('failed to fetch proposal params from IPFS', e));
      }),
    );

    if (proposals.length < batchSize) return proposalsMap;
  }

  return proposalsMap;
}

onMounted(async () => {

  const acl = await usePollACLv1();
  const userAddress = eth.signer ? await eth.signer.getAddress() : ethers.ZeroAddress;
  canCreatePoll.value = await acl.value.canCreatePoll(await dao.value.getAddress(), userAddress);

  const { number: blockTag } = (await eth.provider.getBlock('latest'))!;

  await Promise.all([
    fetchProposals((offset, batchSize) =>
      dao.value.getActiveProposals(offset, batchSize, {
        blockTag,
      }),
    ).then((proposalsMap) => {
      activePolls.value = { ...proposalsMap };
      isLoadingActive.value = false;
    }),
    fetchProposals((offset, batchSize) => {
      return dao.value.getPastProposals(offset, batchSize, {
        blockTag,
      });
    }).then((proposalsMap) => {
      pastPolls.value = { ...proposalsMap };
      isLoadingPast.value = false;
    }),
  ]);
});
</script>

<template>
  <section class="pt-5">
    <div v-if="canCreatePoll" class="flex justify-center mb-6">
      <RouterLink to="polls">
        <AppButton variant="secondary">&plus;&nbsp;&nbsp;Create a new poll</AppButton>
      </RouterLink>
    </div>

    <h2 class="capitalize text-white text-2xl font-bold mb-6">Active Polls</h2>

    <div v-if="!isLoadingActive">
      <AppPoll
        v-for="[pollId, poll] in Object.entries(activePolls)"
        :key="pollId"
        :poll-id="pollId"
        :name="poll.params.name"
        :description="poll.params.description"
        :creator-address="poll.params.creator"
        active
      />
    </div>
    <div v-else>
      <PollLoader />
      <PollLoader />
      <PollLoader />
    </div>

    <p
      v-if="!isLoadingActive && Object.keys(activePolls).length <= 0"
      class="text-white text-center mb-6 font-normal"
    >
      There are no active polls
    </p>

    <h2 class="capitalize text-white text-2xl font-bold mb-6">Past Polls</h2>

    <div v-if="!isLoadingPast">
      <AppPoll
        v-for="[pollId, poll] in Object.entries(pastPolls)"
        :key="pollId"
        :poll-id="pollId"
        :name="poll.params.name"
        :description="poll.params.description"
        :creator-address="poll.params.creator"
        :choices="poll.params.choices"
        :outcome="Number(poll.proposal.topChoice)"
      />
    </div>
    <div v-else>
      <PollLoader />
      <PollLoader />
      <PollLoader />
    </div>

    <p
      v-if="!isLoadingPast && Object.keys(pastPolls).length <= 0"
      class="text-white text-center font-normal"
    >
      You currently have no past polls
    </p>
  </section>
</template>

<style scoped lang="postcss">
form {
  @apply text-center;
}

input {
  @apply block my-4 p-1 mx-auto text-3xl text-center border border-gray-400 rounded-xl;
}

h2 {
  @apply font-bold text-2xl my-2;
}
</style>
