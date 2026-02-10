<script setup lang="ts">
import { characters } from '~/utils/characters'

const { sortedList, startSorting } = useSorter()
const top10 = computed(() => sortedList.value.slice(0, 10))

const restart = () => {
  startSorting(characters)
  navigateTo({ name: 'battle' })
}

const copyResults = () => {
  const text = top10.value.map((c, i) => `${i + 1}. ${c.name}`).join('\n')
  navigator.clipboard.writeText(`我的動漫角色 Top 10 排名：\n${text}`)
}

// Redirect if empty
onMounted(() => {
  if (sortedList.value.length === 0) {
    navigateTo({ name: 'index' })
  }
})

const getRankColor = (index: number) => {
  if (index === 0) return 'text-yellow-500'
  if (index === 1) return 'text-gray-400'
  if (index === 2) return 'text-orange-600'
  return 'text-gray-600 dark:text-gray-300'
}

// Result Item Component to handle individual image logic
// Using a local component logic or simple v-for
// Since we need useImageFallback per item, better to extract a small component or just use the composable in loop?
// Composable cannot be called inside v-for. We need a small component.
</script>

<template>
  <UContainer class="min-h-screen py-10">
    <div class="text-center mb-10">
      <h1 class="text-4xl font-bold mb-4">
        你的 Top 10 排名
      </h1>
      <div class="flex justify-center gap-4">
        <UButton icon="i-heroicons-arrow-path" color="gray" @click="restart">
          重新開始
        </UButton>
        <UButton icon="i-heroicons-clipboard" @click="copyResults">
          分享結果
        </UButton>
      </div>
    </div>

    <div class="max-w-2xl mx-auto space-y-4">
      <ResultItem
        v-for="(char, index) in top10"
        :key="char.id"
        :character="char"
        :index="index"
      />
    </div>
  </UContainer>
</template>
