<script setup lang="ts">

import '../polyfill'; // workaround for "XYZ not defined" errors in opengsn provider.

import { BigNumber, ethers } from 'ethers';
import { RelayProvider } from '@oasislabs/opengsn-provider';
//import { RelayProvider } from '@opengsn/provider';
import { computed, onMounted, ref } from 'vue';
import { ContentLoader } from 'vue-content-loader';
import Web3 from 'web3';
//import { wrap } from '@oasisprotocol/sapphire-paratime';

import type { Poll } from '../../../functions/api/types';
import type { DAOv1 } from '../contracts';
import { staticDAOv1, useDAOv1, usePollACLv1 } from '../contracts';
import { Network, useEthereumStore } from '../stores/ethereum';
import AppButton from '@/components/AppButton.vue';
import AppBadge from '@/components/AppBadge.vue';
import CheckedIcon from '@/components/CheckedIcon.vue';
import UncheckedIcon from '@/components/UncheckedIcon.vue';
import SuccessInfo from '@/components/SuccessInfo.vue';
import CheckIcon from '@/components/CheckIcon.vue';
import PollDetailsLoader from '@/components/PollDetailsLoader.vue';

const props = defineProps<{ id: string }>();
const proposalId = `0x${props.id}`;

const dao = useDAOv1();
const eth = useEthereumStore();

const error = ref('');
const isLoading = ref(false);
const hasVoted = ref(false);
const poll = ref<DAOv1.ProposalWithIdStructOutput & { ipfsParams: Poll }>();
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
  return canAclVote.value != false;
});

const canSelect = computed(() => {
  if (winningChoice.value !== undefined) return false;
  if (eth.address === undefined) return true;
  return existingVote.value === undefined;
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
    isLoading.value = true;
    await doVote();
    hasVoted.value = true;
  } catch (e: any) {
    error.value = e.reason ?? e.message;
  } finally {
    isLoading.value = false;
  }
}

async function doVote(): Promise<void> {
  await eth.connect();

  if (selectedChoice.value === undefined) throw new Error('no choice selected');

  const choice = selectedChoice.value;

  console.log('casting vote');
  await eth.switchNetwork(Network.FromConfig);

  // Set up GSN wrappers. GSN only supports web3, so we need some trickery.
  const paymasterAddress = "0xF9EDd58DFc9E1cEC59526a67eCfb819306825c9F";
  const config = {
    paymasterAddress,
  };

//  const gsnProvider = await RelayProvider.newProvider({ provider: wrap((window as any).web3.currentProvider), config }).init();
  const gsnProvider = await RelayProvider.newProvider({ provider: (window as any).web3.currentProvider, config }).init();
  const web3 = new Web3(gsnProvider);

// Sends the transaction via the GSN
  const gsnDao = new web3.eth.Contract([{"inputs":[{"internalType":"ProposalId","name":"proposalId","type":"bytes32"},{"internalType":"uint256","name":"choiceIdBig","type":"uint256"}],"name":"castVote","outputs":[],"stateMutability":"nonpayable","type":"function"}], dao.value.address);
  await gsnDao.methods.castVote(proposalId, choice).send({
    from: eth.address,
    gas: 300000,
    gasPrice: 100000000000,
  });

/*  const tx = await dao.value.castVote(proposalId, choice);
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
  }*/
}

onMounted(() => {
  eth.connect();
});
</script>

<template>
  <section v-if="!hasVoted">
    <div v-if="poll">
      <div class="flex justify-between items-center mb-4">
        <h2 class="capitalize text-white text-2xl font-bold">{{ poll.ipfsParams.name }}</h2>
        <AppBadge :variant="poll.proposal.active ? 'active' : 'closed'">
          {{ poll.proposal.active ? 'Active' : 'Closed' }}
        </AppBadge>
      </div>
      <p class="text-white text-base mb-20">{{ poll.ipfsParams.description }}</p>
      <div v-if="poll.proposal.active && canClosePoll" class="flex justify-end mb-6">
        <AppButton variant="secondary" @click="closeBallot">Close poll</AppButton>
      </div>
      <p v-if="poll.proposal.active" class="text-white text-base mb-10">
        Please choose your anwer bellow
      </p>
      <form @submit="vote">
        <div v-if="poll?.ipfsParams.choices">
          <AppButton
            v-for="(choice, choiceId) in poll.ipfsParams.choices"
            :key="choiceId"
            :class="{
              selected: selectedChoice === choiceId || choiceId === winningChoice,
              'pointer-events-none': isLoading || !poll.proposal.active,
            }"
            class="choice-btn mb-2 w-full"
            variant="choice"
            @click="selectedChoice = choiceId"
            :disabled="!canSelect && winningChoice !== undefined && choiceId !== winningChoice"
          >
            <span class="flex gap-2">
              <CheckedIcon v-if="selectedChoice === choiceId || choiceId === winningChoice" />
              <UncheckedIcon v-else />
              <span class="leading-6">{{ choice }}</span>
            </span>
          </AppButton>
        </div>
        <p v-if="poll?.ipfsParams.options.publishVotes" class="text-white text-base mt-10">
          Votes will be made public after voting has ended.
        </p>
        <AppButton
          v-if="poll?.proposal?.active"
          type="submit"
          variant="primary"
          class="mt-14"
          :disabled="!canVote || isLoading"
          @click="vote"
        >
          <span v-if="isLoading">Pushing…</span>
          <span v-else-if="!isLoading">Submit vote</span>
        </AppButton>
        <p v-if="error" class="error mt-2 text-center">
          <span class="font-bold">{{ error }}</span>
        </p>
      </form>
    </div>

    <PollDetailsLoader v-else />
  </section>
  <section v-else>
    <SuccessInfo>
      <h3 class="text-white text-3xl mb-4">Thank you</h3>
      <p class="text-white text-base mb-4">Your vote has been recorded.</p>

      <AppButton
        v-if="poll?.ipfsParams?.choices && selectedChoice"
        class="mb-4 pointer-events-none cursor-not-allowed w-full voted"
        variant="choice"
      >
        <span class="flex gap-2">
          <CheckIcon class="w-7" />
          {{ poll.ipfsParams.choices[selectedChoice] }}
        </span>
      </AppButton>

      <p class="text-white text-base mb-24">Your vote will be published after voting has ended.</p>

      <RouterLink to="/">
        <AppButton variant="secondary">Go to overview</AppButton>
      </RouterLink>
    </SuccessInfo>
  </section>
</template>

<style lang="postcss" scoped>
.error {
  @apply text-red-500;
}
</style>
