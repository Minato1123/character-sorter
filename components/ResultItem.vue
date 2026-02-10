<script setup lang="ts">
import type { Character } from '~/types/character'

const props = defineProps<{
  character: Character
  index: number
}>()

const { currentSrc, imageError, handleImageError } = useImageFallback(() => props.character.image)

const getRankColor = (index: number) => {
  if (index === 0) return 'text-yellow-500'
  if (index === 1) return 'text-gray-400'
  if (index === 2) return 'text-orange-600'
  return 'text-gray-600 dark:text-gray-300'
}

const seriesColor = computed(() => {
  switch (props.character.series) {
    case 'WindBreaker': return 'blue'
    case 'Haikyu': return 'orange'
    case 'MHA': return 'red'
    default: return 'gray'
  }
})

const seriesLabel = computed(() => {
  switch (props.character.series) {
    case 'WindBreaker': return '防風少年'
    case 'Haikyu': return '排球少年'
    case 'MHA': return '我的英雄學院'
    default: return props.character.series
  }
})
</script>

<template>
  <div
    class="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 select-none"
    :class="{ 'ring-2 ring-yellow-400 dark:ring-yellow-500': index === 0 }"
  >
    <div class="text-3xl font-black w-16 text-center" :class="getRankColor(index)">
      #{{ index + 1 }}
    </div>
    
    <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 mr-4 flex items-center justify-center">
      <img
        v-if="!imageError"
        :src="currentSrc"
        :alt="character.name"
        class="w-full h-full object-cover"
        @error="handleImageError"
      />
      <div v-else class="text-2xl font-bold text-gray-400">
        {{ character.name.charAt(0) }}
      </div>
    </div>
    
    <div class="flex-1">
      <h3 class="text-xl font-bold">
        {{ character.name }}
      </h3>
      <UBadge :color="seriesColor" variant="solid" class="mt-1">
        {{ seriesLabel }}
      </UBadge>
    </div>

    <div v-if="index === 0" class="text-3xl">
      👑
    </div>
  </div>
</template>
