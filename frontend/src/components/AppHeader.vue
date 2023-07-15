<script setup lang="ts">
import AccountPicker from '@/components/AccountPicker.vue';
</script>

<template>
  <header class="sticky top-0">
    <nav class="bg-white border-gray-200 py-4">
      <div class="flex flex-wrap justify-between items-center mx-auto max-w-screen-md">
        <RouterLink to="/">
          <img src="@/assets/images/logo.svg" class="h-6 sm:h-9" alt="Oasis logo" />
        </RouterLink>
        <AccountPicker class="border border-gray-900 py-1 px-2 ml-3 fixed right-10 top-28" />
      </div>
    </nav>
  </header>
</template>

<style lang="postcss" scoped>
h2 {
  @apply font-bold text-2xl my-2;
}

.choice-item input {
  @apply inline-block my-1;
  width: 85%;
  border-bottom-width: 1px;
}
</style>
