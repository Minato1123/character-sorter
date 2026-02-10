<script setup lang="ts">
import type { Character } from '~/types/character'

const props = defineProps<{
  character: Character
  selected?: boolean
}>()

const { currentSrc, imageError, handleImageError } = useImageFallback(() => props.character.image)

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
  <UCard
    class="cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-primary-500 hover:scale-[1.02] select-none"
    :class="{ 'ring-2 ring-primary-500 scale-[1.02]': selected }"
  >
    <div class="flex flex-col items-center gap-4">
      <div class="relative w-32 h-32 sm:w-48 sm:h-48 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <img
          v-if="!imageError"
          :src="currentSrc"
          :alt="character.name"
          class="w-full h-full object-cover"
          @error="handleImageError"
        >
        <div v-else class="text-4xl font-bold text-gray-400">
          {{ character.name.charAt(0) }}
        </div>
      </div>
      
      <div class="text-center">
        <h3 class="text-2xl font-bold truncate w-full">
          {{ character.name }}
        </h3>
        <UBadge :color="seriesColor" variant="solid" class="mt-3 opacity-80">
          {{ seriesLabel }}
        </UBadge>
      </div>
    </div>
  </UCard>
</template>
