<script setup lang="ts">
import { BigNumber, ethers } from 'ethers';
import { computed, ref } from 'vue';
import { ContentLoader } from 'vue-content-loader';

import type { Poll } from '../../../functions/api/types';
import type { DAOv1 } from '../contracts';
import { staticDAOv1, useDAOv1, usePollACLv1 } from '../contracts';
import { Network, useEthereumStore } from '../stores/ethereum';
import AppButton from '@/components/AppButton.vue';
import AppBadge from '@/components/AppBadge.vue';

const props = defineProps<{ id: string }>();
const proposalId = `0x${props.id}`;

const dao = useDAOv1();
const eth = useEthereumStore();

const error = ref('');
const isTransacting = ref(false);
const poll = ref<{ proposal: DAOv1.ProposalWithIdStructOutput; ipfsParams: Poll } | undefined>(
  undefined,
);
const winningChoice = ref<number | undefined>(undefined);
const selectedChoice = ref<number | undefined>();
const existingVote = ref<number | undefined>(undefined);
let canClosePoll = ref<Boolean>(false);
let canAclVote = ref<Boolean>(false);

(async () => {
  const [active, params, topChoice] = await dao.value.callStatic.proposals(proposalId);
  const proposal = { id: proposalId, active, topChoice, params };
  const ipfsParamsRes = await fetch(`https://w3s.link/ipfs/${params.ipfsHash}`);
  const ipfsParams = await ipfsParamsRes.json();
  // TODO: redirect to 404
  poll.value = { proposal, ipfsParams } as any;
  if (!proposal.active) {
    selectedChoice.value = winningChoice.value = proposal.topChoice;
  }

  const acl = await usePollACLv1();
  const userAddress = eth.signer ? await eth.signer.getAddress() : ethers.constants.AddressZero;
  canClosePoll.value = await acl.value.callStatic.canManagePoll(
    dao.value.address,
    proposalId,
    userAddress,
  );
  canAclVote.value = await acl.value.callStatic.canVoteOnPoll(
    dao.value.address,
    proposalId,
    userAddress,
  );
})();

const canVote = computed(() => {
  if (!eth.address) return false;
  if (winningChoice.value !== undefined) return false;
  if (selectedChoice.value === undefined) return false;
  if (existingVote.value !== undefined) return false;
  if (canAclVote.value == false) return false;
  return true;
});

const canSelect = computed(() => {
  if (winningChoice.value !== undefined) return false;
  if (eth.address === undefined) return true;
  if (existingVote.value !== undefined) return false;
  return true;
});

async function closeBallot(): Promise<void> {
  await eth.connect();
  await eth.switchNetwork(Network.FromConfig);
  const tx = await dao.value.closeProposal(proposalId);
  const receipt = await tx.wait();

  if (receipt.status != 1) throw new Error('close ballot tx failed');
}

async function vote(e: Event): Promise<void> {
  e.preventDefault();
  try {
    error.value = '';
    isTransacting.value = true;
    await doVote();
  } catch (e: any) {
    error.value = e.reason ?? e.message;
  } finally {
    isTransacting.value = false;
  }
}

async function doVote(): Promise<void> {
  await eth.connect();

  if (selectedChoice.value === undefined) throw new Error('no choice selected');

  const choice = selectedChoice.value;

  console.log('casting vote');
  await eth.switchNetwork(Network.FromConfig);
  const tx = await dao.value.castVote(proposalId, choice);
  const receipt = await tx.wait();

  if (receipt.status != 1) throw new Error('cast vote tx failed');
  existingVote.value = choice;

  // Check if the ballot has closed by examining the events (logs).
  let topChoice = undefined;
  for (const event of receipt.events ?? []) {
    if (
      event.address == import.meta.env.VITE_BALLOT_BOX_V1_ADDR &&
      event.event === 'BallotClosed'
    ) {
      topChoice = BigNumber.from(event.data).toNumber();
    }
  }
  if (topChoice === undefined) return;
  winningChoice.value = topChoice;
  let hasClosed = false;
  while (!hasClosed) {
    console.log('checking if ballot has been closed on BSC');
    hasClosed = !(await staticDAOv1.callStatic.proposals(proposalId)).active;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

eth.connect();
</script>

<template>
  <div v-if="poll?.proposal?.active & canClosePoll" class="flex justify-end fixed bottom-10 left-1/2 -translate-x-1/2">
    <AppButton variant="danger" @click="closeBallot">Close Ballot</AppButton>
  </div>

  <div v-if="poll">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2lg lg:text-3xl">
        {{ poll.ipfsParams.name }}
      </h1>
      <AppBadge :variant="poll.proposal.active ? 'active' : 'closed'">
        {{ poll.proposal.active ? 'Active' : 'Closed' }}
      </AppBadge>
    </div>
    <p class="text-gray-600 mb-10">
      {{ poll.ipfsParams.description }}
    </p>
    <div class="rounded border-2 border-gray-300 p-3">
      <h2 class="text-lg text-center text-gray-700 mb-2">
        {{ poll.proposal.active ? 'Cast your vote' : 'Outcome' }}
      </h2>
      <p v-if="poll?.ipfsParams.options.publishVotes" class="text-orange-600 my-2">
        Votes will be made public after voting has ended.
      </p>
      <form @submit="vote">
        <div v-if="poll?.ipfsParams.choices">
          <AppButton
            :class="{
              selected: selectedChoice === choiceId || choiceId === winningChoice,
              'pointer-events-none': isTransacting || !poll.proposal.active,
            }"
            class="choice-btn mb-2"
            v-for="(choice, choiceId) in poll.ipfsParams.choices"
            :key="choice"
            variant="choice"
            @click="selectedChoice = choiceId"
            :disabled="(winningChoice !== undefined && choiceId !== winningChoice)"
          >
            {{ choice }}
          </AppButton>
        </div>
        <AppButton v-if="poll.proposal.active" type="submit" variant="secondary" class="mt-2 w-full" :disabled="!canVote || isTransacting" @click="vote">
          <span v-if="isTransacting">Pushing…</span>
          <span v-else-if="!isTransacting">Vote</span>
        </AppButton>
        <p v-if="error" class="error mt-2 text-center">
          <span class="font-bold">{{ error }}</span>
        </p>
      </form>
    </div>
  </div>
  <ContentLoader v-else width="50" height="6">
    <rect x="0" y="0.1em" rx="3" ry="3" width="26ch" height="1.1em" />
    <rect x="0" y="1.4em" rx="3" ry="3" width="33ch" height="1.1em" />
    <rect x="0" y="2.7em" rx="3" ry="3" width="37ch" height="1.1em" />
    <rect x="0" y="4.0em" rx="3" ry="3" width="10ch" height="1.1em" />
  </ContentLoader>
</template>

<style lang="postcss" scoped>
.choice-btn:not(.selected) {
  @apply border-gray-300 text-gray-300;
}

.choice-btn:hover {
  @apply text-gray-600 border-gray-600;
}

.error {
  @apply text-red-500;
}
</style>
