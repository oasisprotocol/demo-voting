<script setup lang="ts">
import { ethers, getBytes } from 'ethers';
import { computed, onMounted, ref } from 'vue';

import type { Poll } from '../types';
import type { PollManager } from '@oasisprotocol/demo-voting-contracts';
import { IPollACL__factory } from '@oasisprotocol/demo-voting-contracts';
import {
  usePollManager,
  useGaslessVoting,
  usePollACL,
  usePollManagerWithSigner
} from '../contracts';
import { Network, useEthereumStore } from '../stores/ethereum';
import AppButton from '@/components/AppButton.vue';
import AppBadge from '@/components/AppBadge.vue';
import CheckedIcon from '@/components/CheckedIcon.vue';
import UncheckedIcon from '@/components/UncheckedIcon.vue';
import SuccessInfo from '@/components/SuccessInfo.vue';
import CheckIcon from '@/components/CheckIcon.vue';
import PollDetailsLoader from '@/components/PollDetailsLoader.vue';
import { PinataApi, decryptJSON } from '@/utils';

const props = defineProps<{ id: string }>();
const proposalId = `0x${props.id}`;

const dao = usePollManager();
const eth = useEthereumStore();
const gaslessVoting = useGaslessVoting();

type GetVotesReturnT = {
  out_count: bigint;
  out_voters: string[];
  out_choices: PollManager.ChoiceStructOutput[];
};

const error = ref('');
const isLoading = ref(false);
const hasVoted = ref(false);
const isClosing = ref(false);
const isClosed = ref(false);
const poll = ref<PollManager.ProposalWithIdStructOutput & { ipfsParams: Poll }>();
const winningChoice = ref<bigint | undefined>(undefined);
const selectedChoice = ref<bigint | undefined>();
const existingVote = ref<bigint | undefined>(undefined);
const voteCounts = ref<bigint[]>([]);
const votes = ref<GetVotesReturnT>({out_count: 0n, out_voters: [], out_choices: []});
let canClosePoll = ref<Boolean>(false);
let canAclVote = ref<Boolean>(false);

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
  await eth.switchNetwork();  // ensure we're on the correct network first!
  const signerDao = usePollManagerWithSigner();
  const tx = await signerDao.close(proposalId);
  console.log('Close proposal tx', tx);
  isClosing.value = true;
  try {
    const receipt = await tx.wait();

    if (receipt!.status != 1) throw new Error('close ballot tx failed');
    else {
      isClosed.value = true;
    }
  }
  finally {
    isClosing.value = false;
  }
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
  if (selectedChoice.value === undefined) throw new Error('no choice selected');

  const choice = selectedChoice.value;

  const gv = (await gaslessVoting).value;

  if (gv)
  {
    if (!eth.signer) {
      throw new Error('No signer!');
    }

    const request = {
      dao: import.meta.env.VITE_CONTRACT_POLLMANAGER,
      voter: await eth.signer.getAddress(),
      proposalId: proposalId,
      choiceId: choice,
    };

    // Sign voting request
    const signature = await eth.signer.signTypedData(
      {
        name: 'DAOv1.GaslessVoting',
        version: '1',
        chainId: import.meta.env.VITE_NETWORK,
        verifyingContract: await gv.getAddress(),
      },
      {
        VotingRequest: [
          { name: 'voter', type: 'address' },
          { name: 'proposalId', type: 'bytes32' },
          { name: 'choiceId', type: 'uint256' },
        ],
      },
      request,
    );
    const rsv = ethers.Signature.from(signature);

    // Submit voting request to get signed transaction
    const feeData = await eth.provider.getFeeData();
    console.log('doVote.gasless: constructing tx', 'gasPrice', feeData.gasPrice);
    const tx = await gv.makeVoteTransaction(feeData.gasPrice!, request, new Uint8Array([]), rsv);

    // Submit signed transaction via plain JSON-RPC provider (avoiding saphire.wrap)
    let plain_resp = await eth.provider.broadcastTransaction(tx);
    console.log('doVote.gasless: waiting for tx', plain_resp.hash);
    const receipt = await eth.provider.waitForTransaction(plain_resp.hash);

    if (receipt!.status != 1) throw new Error('cast vote tx failed');

    console.log('doVote.gasless: success');
  }
  else {
    console.log('doVote: casting vote using normal tx');
    await eth.switchNetwork(Network.FromConfig);
    const tx = await dao.value.vote(proposalId, choice, new Uint8Array([]));
    const receipt = await tx.wait();

    if (receipt!.status != 1) throw new Error('cast vote tx failed');
  }

  existingVote.value = choice;
}

onMounted(async () => {
  const {active, params, topChoice} = await dao.value.PROPOSALS(proposalId);
  const proposal = { id: proposalId, active, topChoice, params };
  const ipfsParamsRes = await PinataApi.fetch(params.ipfsHash);
  const ipfsData = new Uint8Array(await ipfsParamsRes.arrayBuffer());
  const ipfsParams: Poll = decryptJSON(getBytes(proposal.params.ipfsSecret), ipfsData);
  console.log('Retrieved poll JSON', ipfsParams);
  poll.value = { proposal, ipfsParams } as unknown as PollManager.ProposalWithIdStructOutput & {
    ipfsParams: Poll;
  };
  if (!proposal.active) {
    voteCounts.value = await dao.value.getVoteCounts(proposalId);
    selectedChoice.value = winningChoice.value = proposal.topChoice;
    if (proposal.params.publishVotes) {
      votes.value = await dao.value.getVotes(proposalId, 0, 10);
    }
  }

  const acl = IPollACL__factory.connect(params.acl, eth.provider);
  const userAddress = eth.signer ? await eth.signer.getAddress() : ethers.ZeroAddress;

  // TODO: replace with multicall?
  await Promise.all([
    acl
      .canManagePoll(await dao.value.getAddress(), proposalId, userAddress)
      .then((status) => {
        canClosePoll.value = status;
      }),
    acl
      .canVoteOnPoll(await dao.value.getAddress(), proposalId, userAddress, new Uint8Array([]))
      .then((status) => {
        canAclVote.value = status != 0n;
      }),
  ]);
});
</script>

<template>
  <section v-if="!hasVoted && !isClosed">
    <div v-if="poll">
      <div class="flex justify-between items-center mb-4">
        <h2 class="capitalize text-white text-2xl font-bold">{{ poll.ipfsParams.name }}</h2>
        <AppBadge :variant="poll.proposal.active ? 'active' : 'closed'">
          {{ poll.proposal.active ? 'Active' : 'Closed' }}
        </AppBadge>
      </div>
      <p class="text-white text-base mb-10">{{ poll.ipfsParams.description }}</p>
      <form @submit="vote">
        <div v-if="poll?.ipfsParams.choices">
          <AppButton
            v-for="(choice, choiceId) in poll.ipfsParams.choices"
            :key="choiceId"
            :class="{
              selected: Number(selectedChoice) === choiceId || choiceId === Number(winningChoice),
              'pointer-events-none': isLoading || !poll.proposal.active,
            }"
            class="choice-btn mb-2 w-full"
            variant="choice"
            @click="selectedChoice = selectedChoice == BigInt(choiceId) ? undefined : BigInt(choiceId)"
            :disabled="!canSelect && winningChoice !== undefined && BigInt(choiceId) !== winningChoice"
          >
            <span class="flex gap-2">
              <CheckedIcon v-if="selectedChoice === BigInt(choiceId) || BigInt(choiceId) === winningChoice" />
              <UncheckedIcon v-else />
              <span class="leading-6">{{ choice }}</span>
              <span class="leading-6" v-if="!poll.proposal.active"
                >({{ voteCounts[choiceId] }})</span
              >
            </span>
          </AppButton>
        </div>
        <p
          v-if="poll?.ipfsParams.options.publishVotes && poll.proposal.active"
          class="text-white text-base mt-10"
        >
          Votes will be made public after voting has ended.
        </p>
        <div
          v-if="poll?.ipfsParams.options.publishVotes && !poll.proposal.active"
          class="capitalize text-white text-2xl font-bold mt-10"
        >
          <label class="inline-block mb-5">Individual votes</label>
          <p v-for="(addr, i) in votes.out_voters[0]" :key="i" class="text-white text-base" variant="addr">
            {{ addr }}: {{ poll.ipfsParams.choices[Number(votes.out_choices[i])] }}
          </p>
        </div>

        <div v-if="poll?.proposal?.active && eth.signer && eth.isSapphire" class="flex justify-between items-start mt-6">
          <AppButton
            type="submit"
            variant="primary"
            :disabled="!canVote || isLoading"
            @click="vote"
          >
            <span v-if="isLoading">Submitting Vote…</span>
            <span v-else-if="!isLoading">Submit vote</span>
          </AppButton>

          <div v-if="canClosePoll">
            <AppButton
              variant="secondary"
              @click="closeBallot"
              :disabled="isClosing"
            >
              <span v-if="isClosing">Closing...</span>
              <span v-else>Close poll</span>
            </AppButton>
          </div>
        </div>
        <div v-else-if="poll?.proposal?.active">
          <br /><br />
          <section class="pt-5" v-if="!eth.signer">
            <h2 class="capitalize text-white text-2xl font-bold mb-4">Web3 Wallet Required to Vote</h2>
            <p class="text-white text-base mb-10">
              In order to continue to use the app and vote on a poll, please connect your Web3 wallet by clicking on the
              "Connect" button below.
            </p>

            <div class="flex justify-center">
              <AppButton variant="secondary" @click="eth.connect">Connect</AppButton>
            </div>
          </section>
          <section class="pt-5" v-else-if="!eth.isSapphire">
            <h2 class="capitalize text-white text-2xl font-bold mb-4">Please Connect to Sapphire</h2>
            <p class="text-white text-base mb-10">
              In order to continue to use the app and vote on a poll, please switch your Web3 wallet to Oasis Sapphire by clicking on the "Switch" button below.
            </p>

            <div class="flex justify-center">
              <AppButton variant="secondary" @click="eth.connect">Switch</AppButton>
            </div>
          </section>

        </div>

        <p v-if="error" class="error mt-2 text-center">
          <span class="font-bold">{{ error }}</span>
        </p>
      </form>
    </div>

    <PollDetailsLoader v-else />
  </section>
  <section v-else-if="hasVoted">
    <SuccessInfo>
      <h3 class="text-white text-3xl mb-10">Thank you</h3>

      <AppButton
        v-if="poll?.ipfsParams?.choices && selectedChoice"
        class="mb-4 pointer-events-none cursor-not-allowed w-full voted"
        variant="choice"
      >
        <span class="flex gap-2">
          <CheckIcon class="w-7" />
          {{ poll.ipfsParams.choices[Number(selectedChoice)] }}
        </span>
      </AppButton>

      <p
        v-if="poll?.ipfsParams.options.publishVotes"
        class="text-white text-center text-base mb-24"
      >
        Your vote will be published after voting has ended.
      </p>

      <RouterLink to="/">
        <AppButton variant="secondary">Go to overview</AppButton>
      </RouterLink>
    </SuccessInfo>
  </section>
  <section v-else-if="isClosed">
    <SuccessInfo>
      <p class="text-white text-base mb-4">The poll has been closed.</p>

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
