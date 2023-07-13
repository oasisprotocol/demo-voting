<template>
  <RouterLink :to="{ name: 'poll', params: { id: pollId } }">
    <div class="p-3 mb-6 rounded border-2 border-gray-300">
      <div class="flex justify-between items-center mb-2">
        <div class="flex items-center">
          <JazzIcon class="mr-2" :size="20" :address="creatorAddress" />
          <abbr :title="creatorAddress" class="font-mono block no-underline">{{
            abbrAddr(creatorAddress)
          }}</abbr>
        </div>
        <AppBadge :variant="active ? 'active' : 'closed'">
          {{ active ? 'Active' : 'Closed' }}
        </AppBadge>
      </div>
      <h2 class="text-lg lg:text-2xl mb-1">{{ name }}</h2>
      <p class="text-gray-600">{{ description }}</p>
      <div v-if="choices?.length">
        <hr class="my-2" />
        <p class="text-lg text-center text-gray-700 mb-2">Outcome</p>
        <AppButton
          v-for="(choice, choiceId) in choices"
          :class="{
            selected: choiceId === outcome,
          }"
          class="choice-btn mb-2 pointer-events-none cursor-not-allowed"
          :key="choice"
          variant="choice"
          :disabled="choiceId !== outcome"
        >
          {{ choice }}
        </AppButton>
      </div>
    </div>
  </RouterLink>
</template>

<script setup lang="ts">
import JazzIcon from '@/components/JazzIcon.vue';
import { abbrAddr } from '@/utils/utils';
import AppBadge from '@/components/AppBadge.vue';
import AppButton from '@/components/AppButton.vue';

defineProps<{
  pollId?: string;
  creatorAddress: string;
  name: string;
  description: string;
  choices?: string[];
  outcome?: number;
  active?: boolean;
}>();
</script>

<style scoped lang="postcss">
.choice-btn:not(.selected) {
  @apply border-gray-300 text-gray-300;
}
</style>
