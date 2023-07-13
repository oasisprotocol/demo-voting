<template>
  <button
    class="btn"
    type="button"
    :class="{
      'btn-primary': variant === 'primary',
      'btn-secondary': variant === 'secondary',
      'btn-tertiary': variant === 'tertiary',
      'btn-danger': variant === 'danger',
      'btn-choice': variant === 'choice',
      'btn-small': size === 'small',
    }"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  variant: 'primary' | 'secondary' | 'danger' | 'choice' | 'tertiary';
  size?: 'default' | 'small';
}>();
</script>

<style scoped lang="postcss">
.btn {
  @apply font-bold py-2 px-4 rounded;
}

.btn:not(.btn-choice):disabled {
  @apply cursor-not-allowed bg-gray-500;
}

.btn-primary {
  @apply bg-white text-primary;
}

.btn-secondary {
  @apply bg-primary text-white;
}

.btn-danger {
  @apply bg-red-500 text-white;
}

.btn-tertiary {
  @apply bg-secondary text-white;
}

.btn-choice {
  @apply border-2 text-gray-600 border-gray-600 w-full;
}

.btn-choice:disabled {
  @apply border-gray-300 text-gray-300;
}

.btn-small {
  @apply font-normal py-1 px-2 text-sm;
}
</style>
