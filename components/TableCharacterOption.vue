<script setup lang="ts">
import type { Character } from '~/types/character'
import { getSeriesLabel } from '~/utils/series'

const props = defineProps<{
  character: Character
}>()

const emit = defineEmits<{
  select: [character: Character]
}>()

const { currentSrc, imageError, handleImageError } = useImageFallback(() => props.character.image)

</script>

<template>
  <button
    type="button"
    class="flex w-full items-center gap-3 rounded-lg p-2 text-left transition hover:bg-primary-50 dark:hover:bg-primary-950/40"
    @click="emit('select', character)"
  >
    <div class="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
      <img v-if="!imageError" :src="currentSrc" :alt="character.name" class="h-full w-full object-cover" @error="handleImageError">
      <span v-else class="text-lg font-bold text-gray-400">{{ character.name.charAt(0) }}</span>
    </div>
    <div class="min-w-0">
      <p class="truncate font-semibold">{{ character.name }}</p>
      <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{{ character.id.startsWith('custom-') ? '自訂角色' : getSeriesLabel(character.series) }}</p>
    </div>
  </button>
</template>
