<script setup lang="ts">
import type { Character } from '~/types/character'

const props = defineProps<{
  character: Character
  firstImpression: string
  currentImpression: string
  exportMode?: boolean
}>()

const emit = defineEmits<{
  'update:firstImpression': [value: string]
  'update:currentImpression': [value: string]
}>()

const { currentSrc, imageError, handleImageError } = useImageFallback(() => props.character.image)
const firstTextarea = ref<HTMLTextAreaElement | null>(null)
const currentTextarea = ref<HTMLTextAreaElement | null>(null)

function resizeTextarea(textarea: HTMLTextAreaElement | null) {
  if (!textarea) return
  textarea.style.height = 'auto'
  textarea.style.height = `${Math.max(textarea.scrollHeight, 112)}px`
}

function updateFirstImpression(event: Event) {
  const textarea = event.target as HTMLTextAreaElement
  resizeTextarea(textarea)
  emit('update:firstImpression', textarea.value)
}

function updateCurrentImpression(event: Event) {
  const textarea = event.target as HTMLTextAreaElement
  resizeTextarea(textarea)
  emit('update:currentImpression', textarea.value)
}

onMounted(() => {
  nextTick(() => {
    resizeTextarea(firstTextarea.value)
    resizeTextarea(currentTextarea.value)
  })
})

watch(() => props.firstImpression, () => nextTick(() => resizeTextarea(firstTextarea.value)))
watch(() => props.currentImpression, () => nextTick(() => resizeTextarea(currentTextarea.value)))
</script>

<template>
  <article class="grid min-h-36 grid-cols-[150px_minmax(0,1fr)_minmax(0,1fr)] items-center gap-4 bg-white p-4">
    <div class="flex min-w-0 flex-col items-center text-center">
      <div class="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100">
        <img v-if="!imageError" :src="currentSrc" :alt="character.name" class="h-full w-full object-cover" @error="handleImageError">
        <span v-else class="text-3xl font-bold text-gray-400">{{ character.name.charAt(0) }}</span>
      </div>
      <p class="mt-1 w-full break-words text-lg font-black leading-tight text-gray-800">{{ character.name }}</p>
    </div>
    <textarea ref="firstTextarea" :value="firstImpression" rows="4" aria-label="初印象" class="min-h-28 w-full resize-none overflow-hidden rounded-xl border border-gray-200 p-3 text-xl font-medium text-gray-800 outline-none placeholder:text-gray-400 focus:border-primary-500" :placeholder="exportMode ? '' : '寫下第一印象'" @input="updateFirstImpression" />
    <textarea ref="currentTextarea" :value="currentImpression" rows="4" aria-label="現在" class="min-h-28 w-full resize-none overflow-hidden rounded-xl border border-gray-200 p-3 text-xl font-medium text-gray-800 outline-none placeholder:text-gray-400 focus:border-primary-500" :placeholder="exportMode ? '' : '現在的想法'" @input="updateCurrentImpression" />
  </article>
</template>
