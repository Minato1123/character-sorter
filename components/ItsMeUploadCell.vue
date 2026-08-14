<script setup lang="ts">
const props = defineProps<{
  label: string
  image?: string
}>()

const emit = defineEmits<{
  upload: [file: File]
}>()

const input = ref<HTMLInputElement | null>(null)

function selectImage() {
  input.value?.click()
}

function handleChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) emit('upload', file)
}
</script>

<template>
  <button type="button" class="group relative h-full w-full overflow-hidden border-2 border-gray-700 bg-white text-center" @click="selectImage">
    <input ref="input" type="file" accept="image/jpeg,image/png,image/webp" class="hidden" @change="handleChange">
    <img v-if="image" :src="image" :alt="label" class="h-full w-full object-cover">
    <span v-else class="flex h-full items-center justify-center px-2 text-base font-bold leading-tight text-gray-800">{{ label }}</span>
    <span class="absolute inset-0 flex items-center justify-center bg-black/55 px-2 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100">上傳圖片</span>
  </button>
</template>
