<script setup lang="ts">
import { characters } from '~/utils/characters'
import { generateTop10Image } from '~/utils/imageGenerator'

const { sortedList, startSorting } = useSorter()

// 分成兩組：前 10 名 & 其他
const top10 = computed(() => sortedList.value.slice(0, 10))
const remaining = computed(() => sortedList.value.slice(10))

const restart = () => {
  startSorting(characters)
  navigateTo({ name: 'battle' })
}

// 下載圖片功能（使用 Canvas 生成）
const downloadScreenshot = async () => {
  try {
    // 使用 Canvas API 生成圖片
    const blob = await generateTop10Image(top10.value)
    
    // 下載
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = `我的Top10角色排名_${new Date().getTime()}.png`
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('生成圖片失敗:', error)
  }
}

// Redirect if empty
onMounted(() => {
  if (sortedList.value.length === 0) {
    navigateTo({ name: 'index' })
  }
})

// Helper functions for series labels (用於第 11 名之後的顯示)
const getSeriesLabel = (series: string) => {
  switch (series) {
    case 'WindBreaker': return '防風少年'
    case 'Haikyu': return '排球少年'
    case 'MHA': return '我的英雄學院'
    default: return series
  }
}

const getSeriesColor = (series: string) => {
  switch (series) {
    case 'WindBreaker': return 'blue'
    case 'Haikyu': return 'orange'
    case 'MHA': return 'red'
    default: return 'gray'
  }
}
</script>

<template>
  <UContainer class="min-h-screen py-10">
    <!-- 標題與按鈕區 -->
    <div class="text-center mb-10">
      <h1 class="text-4xl font-bold mb-4">
        你的 Top 10 排名
      </h1>
      <div class="flex justify-center gap-4">
        <UButton icon="i-heroicons-arrow-path" color="gray" @click="restart">
          重新開始
        </UButton>
        <UButton icon="i-heroicons-arrow-down-tray" @click="downloadScreenshot">
          下載截圖
        </UButton>
      </div>
    </div>

    <!-- 前 10 名區域 -->
    <div class="max-w-2xl mx-auto space-y-4">
      <ResultItem
        v-for="(char, index) in top10"
        :key="char.id"
        :character="char"
        :index="index"
      />
    </div>

    <!-- 第 11 名之後（使用極簡樣式） -->
    <div v-if="remaining.length > 0" class="max-w-2xl mx-auto mt-12 space-y-2">
      <div
        v-for="(char, idx) in remaining"
        :key="char.id"
        class="flex items-center gap-3 p-2 text-sm opacity-60 hover:opacity-100 transition-opacity"
      >
        <span class="w-12 text-center font-mono text-gray-400 dark:text-gray-500">#{{ idx + 11 }}</span>
        <span class="flex-1 text-gray-400 dark:text-gray-500">{{ char.name }}</span>
        <UBadge 
          size="xs" 
          variant="solid"
          :color="getSeriesColor(char.series)"
          class="opacity-60"
        >
          {{ getSeriesLabel(char.series) }}
        </UBadge>
      </div>
    </div>
  </UContainer>
</template>
