<script setup lang="ts">
import { characters } from '~/utils/characters'
import { generateTop10Image } from '~/utils/imageGenerator'

const { sortedList, startSorting, selectedSeries } = useSorter()

// 動態計算 Top N
const topCount = computed(() => Math.min(10, sortedList.value.length))
const top10 = computed(() => sortedList.value.slice(0, topCount.value))
const remaining = computed(() => sortedList.value.slice(topCount.value))

// 標題
const titleText = computed(() => `你的 Top ${topCount.value} 排名`)

const restart = () => {
  navigateTo({ name: 'index' })
}

// 下載圖片功能（使用 Canvas 生成，傳入 selectedSeries）
const downloadScreenshot = async () => {
  try {
    // 使用 Canvas API 生成圖片
    const blob = await generateTop10Image(top10.value, selectedSeries.value)
    
    // 下載
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = `我的Top${topCount.value}角色排名_${new Date().getTime()}.png`
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
const seriesLabelMap: Record<string, string> = {
  WindBreaker: '防風少年',
  Haikyu: '排球少年',
  MHA: '我的英雄學院'
}

const getSeriesLabel = (series: string) => {
  return seriesLabelMap[series] || series
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
    <div class="text-center mb-6">
      <h1 class="text-4xl font-bold mb-2">
        {{ titleText }}
      </h1>
      
      <!-- 本次包含作品（新增） -->
      <div class="flex items-center justify-center gap-2 mb-4 text-sm text-gray-500 dark:text-gray-400">
        <span>本次包含作品：</span>
        <UBadge 
          v-for="series in selectedSeries" 
          :key="series"
          :color="getSeriesColor(series)"
          variant="subtle"
          size="xs"
        >
          {{ getSeriesLabel(series) }}
        </UBadge>
      </div>
      
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
        <span class="w-12 text-center font-mono text-gray-400 dark:text-gray-500">#{{ idx + topCount + 1 }}</span>
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
