<script setup lang="ts">
import { computed, ref } from 'vue';

import { Network, networkName, useEthereumStore } from '../stores/ethereum';
import JazzIcon from './JazzIcon.vue';
import { abbrAddr } from '@/utils/utils';

const eth = useEthereumStore();

const netName = computed(() => networkName(eth.network));
const unkNet = computed(() => eth.network === Network.Unknown);

const connecting = ref(false);
const showingConnecting = ref(false);

async function connectWallet() {
  if (connecting.value) return;
  connecting.value = true;
  try {
    setTimeout(() => {
      showingConnecting.value = connecting.value;
    }, 300);
    await eth.connect();
  } finally {
    connecting.value = false;
  }
}
</script>

<template>
  <div :class="{ 'cursor-default': !!eth.address }" class="account-picker" @click="connectWallet">
    <span class="account-picker-content" v-if="!connecting && eth.address">
      <JazzIcon :size="60" :address="eth.address" />
      <span class="font-mono font-bold">
        <abbr :title="eth.address" class="block no-underline">{{
          abbrAddr(eth.address)
        }}</abbr>
        <span class="font-normal" :class="{ 'unk-net': unkNet }">{{ netName }}</span>
      </span>
    </span>
    <span class="account-picker-content" v-else>
      <span>
        <span v-if="showingConnecting">Connecting…</span>
        <span v-else>Connect Wallet</span>
      </span>
    </span>
  </div>
</template>

<style lang="postcss" scoped>
.account-picker-content {
  @apply inline-flex items-center gap-6;
}

.account-picker {
  @apply inline-flex items-center border rounded-xl bg-white p-4 border-primaryDark;
  border-width: 3px;
  border-style: solid;
}

span {
  @apply text-xl text-primaryDark text-right;
}

.unk-net {
  @apply text-red-500 underline decoration-wavy decoration-1;
}
</style>
