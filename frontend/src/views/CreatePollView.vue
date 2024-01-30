<script setup lang="ts">
import { ref } from 'vue';

import { usePollManager, usePollManagerWithSigner } from '../contracts';
import { useEthereumStore } from '../stores/ethereum';
import type { Poll } from '../types';
import AppButton from '@/components/AppButton.vue';
import RemoveIcon from '@/components/RemoveIcon.vue';
import AddIcon from '@/components/AddIcon.vue';
import SuccessInfo from '@/components/SuccessInfo.vue';
import { PinataApi } from '@/utils/pinata-api';
import { retry } from '@/utils/promise';
import type { PollManager } from '@oasisprotocol/demo-voting-contracts';

const eth = useEthereumStore();
const dao = usePollManager();

const errors = ref<string[]>([]);
const pollName = ref('');
const pollDesc = ref('');
const choices = ref<Array<{ key: number; value: string }>>(
  Array.from({ length: 3 }, (_, key) => ({
    key,
    value: '',
  })),
);
const publishVotes = ref(false);
const isLoading = ref(false);
const proposalId = ref('');

let choiceCount = 3;
const removeChoice = (i: number) => choices.value.splice(i, 1);
const addChoice = () => {
  choices.value.push({ key: choiceCount, value: '' });
  choiceCount++;
};

async function createPoll(e: Event): Promise<void> {
  if (e.target instanceof HTMLFormElement) {
    e.target.checkValidity();
    if (!e.target.reportValidity()) return;
  }
  e.preventDefault();
  try {
    errors.value.splice(0, errors.value.length);
    isLoading.value = true;
    proposalId.value = await doCreatePoll();
  } catch (e: any) {
    errors.value.push(`Failed to create poll: ${e.message ?? JSON.stringify(e)}`);
    console.error(e);
  } finally {
    isLoading.value = false;
  }
}

async function doCreatePoll(): Promise<string> {
  if (errors.value.length > 0) return '';

  const poll: Poll = {
    creator: eth.address!,
    name: pollName.value,
    description: pollDesc.value,
    choices: choices.value.map((c) => c.value),
    options: {
      publishVotes: publishVotes.value,
    },
  };

  const res = await PinataApi.pinBody(poll);
  const resJson = await res.json();
  if (res.status !== 201) throw new Error(resJson.error);
  const ipfsHash = resJson.ipfsHash;

  const proposalParams: PollManager.ProposalParamsStruct = {
    ipfsHash,
    numChoices: choices.value.length,
    publishVotes: poll.options.publishVotes,
    closeTimestamp: 0,
    acl: import.meta.env.VITE_CONTRACT_ACL_ALLOWALL
  };

  console.log('doCreatePoll: Using direct transaction to create proposal');

  // TODO: check if proposal already exists on the host chain and continue if so (idempotence)
  //proposalId = await dao.value.callStatic.createProposal(proposalParams);
  //console.log('doCreatePoll: creating proposal', proposalId);

  const daoSigner = usePollManagerWithSigner();
  const createProposalTx = await daoSigner.create(proposalParams, new Uint8Array([]));
  console.log('doCreatePoll: creating proposal tx', createProposalTx.hash);

  const receipt = (await createProposalTx.wait())!;
  if (receipt.status !== 1) {
    throw new Error('createProposal tx receipt reported failure.');
  }
  const proposalId = receipt.logs[0].data;

  console.log('doCreatePoll: Proposal ID', proposalId);

  return retry<ReturnType<typeof dao.value.ballotIsActive>>(
    dao.value.ballotIsActive(proposalId),
    (isActive) => {
      if (!isActive) {
        throw new Error('Unable to determine the status of proposal.');
      }
      return isActive;
    },
  )
    .then(() => proposalId.replace('0x', ''))
    .catch((err) => {
      errors.value.push(`Failed to create poll: ${err.message ?? JSON.stringify(err)}`);
      return '';
    });
}
</script>

<template>
  <div v-if="eth.signer">
    <section v-if="!proposalId">
      <p class="text-white text-base mb-5 text-center">
        Once created, your poll will be live immediately and responses will start being recorded.
      </p>

      <form @submit="createPoll">
        <div class="form-group">
          <input type="text" id="question" class="peer" placeholder=" " v-model="pollName" required />
          <label
            for="question"
            class="peer-focus:text-primaryDark peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-5"
          >
            Question
            <span class="text-red-500">*</span>
          </label>
        </div>

        <div class="form-group form-group-textarea">
          <textarea id="description" class="peer" placeholder=" " v-model="pollDesc" rows="3" />
          <label
            for="description"
            class="peer-focus:text-primaryDark peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-5"
          >
            Description
          </label>
        </div>

        <div class="form-group-extended">
          <label class="inline-block mb-5"
            >Answers
            <span class="text-red-500">*</span>
          </label>
          <div
            class="relative flex justify-between items-center mb-4 gap-3 px-5"
            v-for="(choice, i) in choices"
            :key="choice.key"
          >
            <input
              class="focus:outline-none focus:ring-0 pb-2 text-primaryDark"
              type="text"
              id="name"
              :placeholder="`${i + 1}. Answer`"
              v-model="choices[i].value"
              required
            />

            <RemoveIcon
              class="cursor-pointer absolute right-5 bottom-2"
              :class="{
                'cursor-default': isLoading,
              }"
              :disabled="isLoading"
              v-if="choices.length > 2"
              :data-ix="i"
              @click.prevent="removeChoice(i)"
            ></RemoveIcon>
          </div>
          <AppButton
            class="ml-5"
            size="small"
            variant="tertiary"
            :disabled="isLoading"
            @click.prevent="addChoice"
          >
            <span class="flex gap-2">
              <AddIcon />
              <span class="leading-6">Add answer</span>
            </span>
          </AppButton>
        </div>

        <div class="form-group-extended">
          <label class="inline-block mb-5">Additional options</label>
          <div class="flex pl-4">
            <input
              id="publish-votes"
              class="w-5 h-5 border-2 border-gray-500"
              type="checkbox"
              v-model="publishVotes"
            />
            <label class="ml-3 text-base text-gray-900" for="publish-votes">
              Publish individual votes after voting has ended.
            </label>
          </div>
        </div>

        <div class="flex justify-center">
          <div v-if="eth.isSapphire">
            <AppButton type="submit" variant="primary" :disabled="isLoading">
              <span v-if="isLoading">Creating…</span>
              <span v-else>
                Create Poll
              </span>
            </AppButton>
          </div>
          <div v-else>
            <section class="pt-5">
              <h2 class="capitalize text-white text-2xl font-bold mb-4">Wrong Web3 Chain!</h2>
              <p class="text-white text-base mb-10">
                In order to continue to use the app, please switch your Web3 wallet to the correct chain, by clicking on the
                "Connect" button below.
              </p>

              <div class="flex justify-center">
                <AppButton variant="secondary" @click="eth.connect">Switch Chain</AppButton>
              </div>
            </section>
          </div>
        </div>

        <div v-if="errors.length > 0" class="text-red-500 px-3 mt-5 rounded-xl-sm">
          <span class="font-bold">Errors:</span>
          <ul class="list-disc px-8">
            <li v-for="error in errors" :key="error">{{ error }}</li>
          </ul>
        </div>
      </form>
    </section>
    <section v-else>
      <SuccessInfo>
        <h3 class="text-white text-3xl mb-4">Success</h3>
        <p class="text-white text-base">Your poll is live.</p>
        <p class="text-white text-base mb-24">Votes will be recorded from now on.</p>

        <RouterLink :to="{ name: 'poll', params: { id: proposalId } }">
          <AppButton variant="secondary">View poll</AppButton>
        </RouterLink>
      </SuccessInfo>
    </section>
  </div>
  <div v-else>
    <section class="pt-5">
      <h2 class="capitalize text-white text-2xl font-bold mb-4">No Web3 Wallet Connected!</h2>
      <p class="text-white text-base mb-10">
        In order to continue to use the app, please connect your Web3 wallet and switch to the correct chain, by clicking on the
        "Connect" button below.
      </p>

      <div class="flex justify-center">
        <AppButton variant="secondary" @click="eth.connect">Connect</AppButton>
      </div>
    </section>
  </div>
</template>

<style scoped lang="postcss">
.form-group,
.form-group-extended {
  @apply relative mb-6;
}

.form-group input,
textarea {
  @apply block rounded-xl py-6 px-5 w-full text-base text-black appearance-none focus:outline-none focus:ring-0 bg-white;
}

.form-group label {
  @apply absolute text-base text-primaryDark duration-300 transform -translate-y-5 scale-75 top-6 z-10 origin-[0] left-5;
}

.form-group-textarea {
  @apply overflow-hidden;
}

.form-group-textarea textarea {
  @apply pt-6;
}

.form-group-textarea label {
  @apply top-6 h-10;
  width: calc(130% - 14px);
}

.form-group-textarea label::before {
  @apply h-10 -top-3 absolute bg-white;
  z-index: -1;
  content: ' ';
  width: calc(100% - 14px); /* scrollbar */
}

.form-group-extended {
  @apply block rounded-xl py-6 px-5 w-full appearance-none focus:outline-none focus:ring-0 bg-white;
}

.form-group-extended > label {
  @apply text-base text-primaryDark;
}

.form-group-extended input:not([type='checkbox']) {
  @apply w-full;
  border-bottom: 1px solid rgba(0, 0, 0, 0.42);
}
</style>
