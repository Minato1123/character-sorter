<script setup lang="ts">
import type { Character } from '~/types/character'

const props = defineProps<{ character: Character, checked: boolean, color: string }>()
const emit = defineEmits<{ 'update:checked': [checked: boolean] }>()
const { currentSrc, imageError, handleImageError } = useImageFallback(() => props.character.image)
</script>

<template>
  <label class="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-gray-50 dark:hover:bg-gray-800">
    <UCheckbox :model-value="checked" :color="color" @update:model-value="emit('update:checked', $event)" />
    <div class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
      <img v-if="!imageError" :src="currentSrc" :alt="character.name" class="h-full w-full object-cover" @error="handleImageError">
      <span v-else class="text-sm font-bold text-gray-400">{{ character.name.charAt(0) }}</span>
    </div>
    <span class="min-w-0 truncate text-sm font-medium">{{ character.name }}</span>
  </label>
</template>
