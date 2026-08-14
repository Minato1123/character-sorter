<script setup lang="ts">
import type { Character } from '~/types/character'
import { getSeriesLabel } from '~/utils/series'

const props = defineProps<{
  label: string
  character?: Character
  rank?: string
  editableLabel?: boolean
}>()

const emit = defineEmits<{
  select: []
  'update:label': [value: string]
}>()

const { currentSrc, imageError, handleImageError } = useImageFallback(() => props.character?.image || '')
</script>

<template>
  <div class="group w-full text-left">
    <p v-if="rank" class="mb-1 text-lg font-black text-gray-700">{{ rank }}</p>
    <label v-else-if="editableLabel" class="mb-1 flex items-center text-lg font-black text-gray-700">
      <span>#</span>
      <input
        :value="label"
        type="text"
        class="min-w-0 flex-1 bg-transparent font-black outline-none placeholder:text-gray-400"
        placeholder="自填項目"
        @input="emit('update:label', ($event.target as HTMLInputElement).value)"
      >
    </label>
    <p v-else class="mb-1 truncate text-lg font-black text-gray-700">#{{ label }}</p>
    <button type="button" class="flex w-full gap-3 rounded-2xl border-2 border-gray-300 bg-white p-2 text-left transition group-hover:border-primary-500 group-hover:ring-2 group-hover:ring-primary-200" @click="emit('select')">
      <div class="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-50">
        <img v-if="character && !imageError" :src="currentSrc" :alt="character.name" class="h-full w-full object-cover" @error="handleImageError">
        <span v-else-if="character" class="text-3xl font-bold text-gray-400">{{ character.name.charAt(0) }}</span>
        <span v-else class="px-2 text-center text-xs text-gray-400 group-hover:text-primary-500">點擊選擇角色</span>
      </div>
      <div class="min-w-0 flex-1 self-center text-sm font-bold text-gray-500">
        <p class="truncate border-b-2 border-gray-300 pb-1 text-gray-700">本名：<span class="text-primary-600">{{ character?.name || '' }}</span></p>
        <p class="mt-3 truncate border-b-2 border-gray-300 pb-1">來自：<span>{{ character ? getSeriesLabel(character.series) : '' }}</span></p>
      </div>
    </button>
  </div>
</template>
