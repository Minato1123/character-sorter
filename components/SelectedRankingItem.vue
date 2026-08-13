<script setup lang="ts">
import type { Character } from '~/types/character'

const props = defineProps<{
  rank: number
  character?: Character
  seriesLabel?: string
  seriesColor?: string
}>()

const emit = defineEmits<{
  select: []
}>()

const { currentSrc, imageError, handleImageError } = useImageFallback(() => props.character?.image || '')
</script>

<template>
  <button
    v-if="!character"
    type="button"
    class="flex min-h-16 items-center gap-3 rounded-lg border border-dashed border-violet-300 bg-violet-50 px-3 py-2 text-left transition hover:border-violet-500 hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-950/30 dark:hover:bg-violet-950/60"
    @click="emit('select')"
  >
    <span class="w-8 text-center text-lg font-extrabold text-violet-500">#{{ rank }}</span>
    <span class="text-sm font-semibold text-violet-700 dark:text-violet-300">選擇這個名次</span>
  </button>
  <div v-else class="flex min-h-16 items-center gap-3 rounded-lg bg-gray-100 px-3 py-2 text-left opacity-75 dark:bg-gray-800/60">
    <span class="w-8 text-center text-lg font-extrabold text-violet-500">#{{ rank }}</span>
    <div class="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
      <img
        v-if="!imageError"
        :src="currentSrc"
        :alt="character.name"
        class="h-full w-full object-cover"
        @error="handleImageError"
      >
      <span v-else class="text-sm font-bold text-gray-400">{{ character.name.charAt(0) }}</span>
    </div>
    <div class="min-w-0 flex-1">
      <p class="truncate text-sm font-semibold">{{ character.name }}</p>
      <UBadge :color="seriesColor || 'gray'" size="xs" variant="subtle">
        {{ seriesLabel }}
      </UBadge>
    </div>
  </div>
</template>
