<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { useDAOv1 } from '../contracts';
import { Network, useEthereumStore } from '../stores/ethereum';
import type { Poll } from '../../../functions/api/types';
import AppButton from '@/components/AppButton.vue';

const router = useRouter();
const eth = useEthereumStore();
const dao = useDAOv1();

const pinBody = async (jwt: string, poll: Poll) => {
  const res = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({
      pinataContent: poll,
    }),
  });
  const resBody: any = await res.json();
  if (res.status !== 200) throw new Error('failed to pin');
  const resp = { ipfsHash: resBody.IpfsHash };
  return new Response(JSON.stringify(resp), {
    status: 201,
    headers: { 'content-type': 'application/json' },
  });
};

const errors = ref<string[]>([]);
const pollName = ref('');
const pollDesc = ref('');
const choices = ref<Array<{ key: number; value: string }>>([]);
const publishVotes = ref(false);
const creating = ref(false);

let choiceCount = 0; // a monotonic counter for use as :key
const removeChoice = (i: number) => choices.value.splice(i, 1);
const addChoice = () => {
  choices.value.push({ key: choiceCount, value: '' });
  choiceCount++;
};
addChoice();
addChoice();
addChoice();

async function createPoll(e: Event): Promise<void> {
  if (e.target instanceof HTMLFormElement) {
    e.target.checkValidity();
    if (!e.target.reportValidity()) return;
  }
  e.preventDefault();
  try {
    errors.value.splice(0, errors.value.length);
    creating.value = true;
    const proposalId = await doCreatePoll();
    if (!proposalId) return;
    router.push({ name: 'poll', params: { id: proposalId } });
  } catch (e: any) {
    errors.value.push(`Failed to create poll: ${e.message ?? JSON.stringify(e)}`);
    console.error(e);
  } finally {
    creating.value = false;
  }
}

async function doCreatePoll(): Promise<string> {
  await eth.connect();
  await eth.switchNetwork(Network.FromConfig);
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

  const res = await pinBody(import.meta.env.VITE_PINATA_JWT!, poll);
  const resJson = await res.json();
  if (res.status !== 201) throw new Error(resJson.error);
  const ipfsHash = resJson.ipfsHash;
  const proposalParams = {
    ipfsHash,
    numChoices: choices.value.length,
    publishVotes: poll.options.publishVotes,
  };
  // TODO: check if proposal already exists on the host chain and continue if so (idempotence)
  const proposalId = await dao.value.callStatic.createProposal(proposalParams);
  console.log('creating proposal');
  const createProposalTx = await dao.value.createProposal(proposalParams);
  console.log('creating proposal in', createProposalTx.hash);
  if ((await createProposalTx.wait()).status !== 1)
    throw new Error('createProposal tx receipt reported failure.');
  let isActive = false;
  while (!isActive) {
    console.log('checking if ballot has been created on Sapphire');
    isActive = await dao.value.callStatic.ballotIsActive(proposalId);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return proposalId.replace('0x', '');
}
</script>

<template>
  <h2 class="text-lg lg:text-2xl text-center mb-1">Create a new poll</h2>

  <form @submit="createPoll">
    <div class="mb-4">
      <label for="name" class="block mb-2 text-sm font-medium text-gray-900">Name</label>
      <input type="text" id="name" placeholder="Name" v-model="pollName" required />
    </div>

    <div class="mb-4">
      <label for="description" class="block mb-2 text-sm font-medium text-gray-900"
        >Description</label
      >
      <textarea id="description" placeholder="Description" v-model="pollDesc" required />
    </div>

    <div class="mb-4">
      <label class="block mb-2 text-sm font-medium text-gray-900">Choices</label>
      <div
        class="flex justify-between items-center mb-4 gap-3"
        v-for="(choice, i) in choices"
        :key="choice.key"
      >
        <input
          type="text"
          id="name"
          :placeholder="`${i + 1}. Choice`"
          v-model="choices[i].value"
          required
        />

        <AppButton
          size="small"
          variant="danger"
          :disabled="creating"
          v-if="choices.length > 2"
          :data-ix="i"
          @click.prevent="removeChoice(i)"
        >
          &times;
        </AppButton>
      </div>
      <AppButton
        class="mt-0"
        size="small"
        variant="tertiary"
        :disabled="creating"
        @click.prevent="addChoice"
      >
        Add choice
      </AppButton>
    </div>

    <div class="mb-4">
      <label class="block mb-2 text-sm font-medium text-gray-900">Additional Options</label>
      <input id="publish-votes" type="checkbox" v-model="publishVotes" />
      <label class="ml-3 text-sm text-gray-500" for="publish-votes">
        Publish individual votes after voting has ended.
      </label>
    </div>

    <AppButton type="submit" variant="secondary" :disabled="creating">
      <span v-if="creating">Creating…</span>
      <span v-else>Create Poll</span>
    </AppButton>

    <div v-if="errors.length > 0" class="text-red-500 px-3 mt-5 rounded-sm">
      <span class="font-bold">Errors:</span>
      <ul class="list-disc px-8">
        <li v-for="error in errors" :key="error">{{ error }}</li>
      </ul>
    </div>
  </form>
</template>

<style scoped lang="postcss">
input:not([type='checkbox']),
textarea {
  @apply shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-600 focus:border-gray-600 block w-full p-2;
}
</style>
