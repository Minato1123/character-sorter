<script setup lang="ts">
import type { Character } from '~/types/character'

const props = defineProps<{
  label: string
  character?: Character
}>()

const emit = defineEmits<{
  select: []
}>()

const { currentSrc, imageError, handleImageError } = useImageFallback(() => props.character?.image || '')
</script>

<template>
  <button
    type="button"
    class="group flex h-[235px] min-w-0 flex-col overflow-hidden border-2 border-gray-900 bg-white text-left transition hover:z-10 hover:border-primary-500 hover:ring-2 hover:ring-primary-300 dark:border-gray-300 dark:bg-gray-900"
    @click="emit('select')"
  >
    <div class="relative flex min-h-0 flex-1 items-center justify-center bg-gray-50 dark:bg-gray-800">
      <img
        v-if="character && !imageError"
        :src="currentSrc"
        :alt="character.name"
        class="h-full w-full object-cover"
        @error="handleImageError"
      >
      <span v-else-if="character" class="text-3xl font-bold text-gray-400">{{ character.name.charAt(0) }}</span>
      <span v-else class="text-center text-sm text-gray-400 transition group-hover:text-primary-500">點擊選擇角色</span>
      <span v-if="character" class="absolute inset-x-0 bottom-0 truncate bg-black/60 px-2 py-1 text-center text-xs font-semibold text-white">
        {{ character.name }}
      </span>
    </div>
    <div class="flex min-h-11 items-center justify-center border-t-2 border-gray-900 px-1 text-center text-sm font-bold dark:border-gray-300">
      {{ label }}
    </div>
  </button>
</template>
