<script setup lang="ts">
import { characters } from '~/utils/characters'
import { snapdom } from '@zumer/snapdom'
import { getSeriesColor, getSeriesLabel } from '~/utils/series'

const { sortedList, startSorting, selectedSeries, comparisonCount, startTime, endTime } = useSorter()

// 動態計算 Top N
const topCount = computed(() => Math.min(10, sortedList.value.length))
const top10 = computed(() => sortedList.value.slice(0, topCount.value))
const remaining = computed(() => sortedList.value.slice(topCount.value))
const exportRef = ref<HTMLElement | null>(null)
const isGeneratingImage = ref(false)

// 標題
const titleText = computed(() => `你的 Top ${topCount.value} 排名`)

// 統計資訊
const totalComparisons = computed(() => comparisonCount.value)

const totalTimeSeconds = computed(() => {
  if (!startTime.value || !endTime.value) return 0
  return Math.floor((endTime.value - startTime.value) / 1000) // 轉換為秒
})

const formattedTime = computed(() => {
  const seconds = totalTimeSeconds.value
  
  if (seconds < 60) {
    // 小於 1 分鐘：顯示為 00:XX
    return `00:${seconds.toString().padStart(2, '0')}`
  } else if (seconds < 3600) {
    // 小於 1 小時：顯示為 MM:SS
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  } else {
    // 超過 1 小時：顯示為 HH:MM:SS
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }
})

const restart = () => {
  navigateTo({ name: 'index' })
}

const downloadScreenshot = async () => {
  if (!exportRef.value) return
  isGeneratingImage.value = true

  try {
    const image = await snapdom(exportRef.value, {
      scale: 2,
      reconcile: true,
      embedFonts: true
    })
    await image.download({
      format: 'png',
      filename: `我的Top${topCount.value}角色排名_${Date.now()}.png`
    })
  } catch (error) {
    console.error('生成圖片失敗:', error)
  } finally {
    isGeneratingImage.value = false
  }
}

// Redirect if empty
onMounted(() => {
  if (sortedList.value.length === 0) {
    navigateTo({ name: 'index' })
  }
})

</script>

<template>
  <UContainer class="min-h-screen py-10">
    <!-- 標題與按鈕區 -->
    <div class="text-center mb-6">
      <h1 class="text-4xl font-bold mb-2">
        {{ titleText }}
      </h1>
      
      <!-- 本次包含作品（新增） -->
      <div class="flex items-center justify-center gap-2 mb-2 text-sm text-gray-500 dark:text-gray-400">
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
      
      <!-- 統計資訊（新增） -->
      <p class="text-xs text-gray-400 dark:text-gray-500 mb-4">
        測驗用時 {{ formattedTime }} ｜ 總對決次數 {{ totalComparisons }} 次
      </p>
      
      <div class="flex justify-center gap-4">
        <UButton icon="i-heroicons-home" color="gray" @click="restart">
          返回首頁
        </UButton>
        <UButton icon="i-heroicons-arrow-down-tray" :loading="isGeneratingImage" @click="downloadScreenshot">
          下載圖片
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

    <div ref="exportRef" class="fixed left-[-10000px] top-0 w-[1000px] bg-white p-10 text-gray-900">
      <div class="mb-7 flex items-start justify-between border-b-2 border-gray-100 pb-5">
        <div class="shrink-0">
          <p class="text-sm font-bold tracking-widest text-primary-500">ANIME TOOLS</p>
          <h2 class="mt-1 whitespace-nowrap text-4xl font-black">{{ titleText }}</h2>
        </div>
        <div class="flex max-w-md flex-wrap justify-end gap-2">
          <span v-for="series in selectedSeries" :key="series" class="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-600">
            {{ getSeriesLabel(series) }}
          </span>
        </div>
      </div>
      <div class="grid grid-flow-col grid-rows-5 gap-4">
        <ResultItem v-for="(char, index) in top10" :key="char.id" :character="char" :index="index" />
      </div>
    </div>
  </UContainer>
</template>
