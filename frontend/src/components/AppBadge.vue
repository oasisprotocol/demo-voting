<template>
  <span
    class="badge"
    :class="{ 'badge-active': variant === 'active', 'badge-closed': variant === 'closed' }"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
defineProps<{
  variant: 'active' | 'closed';
}>();
</script>

<style scoped lang="postcss">
.badge {
  @apply text-white py-1 px-2 rounded;
}

.badge-active {
  @apply bg-green-500;
}

.badge-closed {
  @apply bg-gray-500;
}
</style>
