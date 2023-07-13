<script setup lang="ts">
import { RouterView } from 'vue-router';

import AppHeader from '@/components/AppHeader.vue';
</script>

<template>
  <AppHeader />

  <main class="py-5 m-auto max-w-screen-md">
    <RouterView el="main" />
  </main>
</template>

<style lang="postcss"></style>
