<script setup lang="ts">
import { characters } from '~/utils/characters'
import { useSorter } from '~/composables/useSorter'

const { startSorting, setSelectedSeries } = useSorter()

// 本地狀態管理系列選擇
const seriesSelection = ref({
  WindBreaker: true,
  Haikyu: true,
  MHA: true
})

// 計算屬性
const hasSelection = computed(() => 
  seriesSelection.value.WindBreaker || 
  seriesSelection.value.Haikyu || 
  seriesSelection.value.MHA
)

const selectedSeriesList = computed(() => {
  const selected: string[] = []
  if (seriesSelection.value.WindBreaker) selected.push('WindBreaker')
  if (seriesSelection.value.Haikyu) selected.push('Haikyu')
  if (seriesSelection.value.MHA) selected.push('MHA')
  return selected
})

const filteredCharacters = computed(() => 
  characters.filter(c => selectedSeriesList.value.includes(c.series))
)

const selectedCount = computed(() => selectedSeriesList.value.length)

function handleStart() {
  setSelectedSeries(selectedSeriesList.value)
  startSorting(filteredCharacters.value)
  navigateTo({ name: 'battle' })
}
</script>

<template>
  <UContainer class="min-h-screen flex flex-col items-center justify-center py-10">
    <h1 class="text-4xl sm:text-6xl font-extrabold text-primary-500 mb-6 text-center">
      動漫角色二選一
    </h1>

    <p class="text-xl text-gray-500 dark:text-gray-400 mb-8 text-center max-w-2xl">
      找出你心目中的排名！<br>
      系統將會一次顯示兩名角色，請點擊你比較喜歡的那一位。
    </p>

    <!-- 系列選擇區（新增） -->
    <UCard class="mb-8 w-full max-w-md">
      <template #header>
        <h2 class="text-lg font-semibold">選擇要排序的作品</h2>
      </template>
      
      <div class="space-y-3">
        <UCheckbox 
          v-model="seriesSelection.WindBreaker" 
          label="防風少年"
          color="blue"
        />
        <UCheckbox 
          v-model="seriesSelection.Haikyu" 
          label="排球少年"
          color="orange"
        />
        <UCheckbox 
          v-model="seriesSelection.MHA" 
          label="我的英雄學院"
          color="red"
        />
      </div>
      
      <template #footer>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          已選擇 <span class="font-semibold text-primary-500">{{ selectedCount }}</span> 個作品，
          共 <span class="font-semibold text-primary-500">{{ filteredCharacters.length }}</span> 名角色
        </p>
      </template>
    </UCard>

    <UButton
      size="xl"
      icon="i-heroicons-play-circle"
      :disabled="!hasSelection"
      @click="handleStart"
    >
      開始排序
    </UButton>
  </UContainer>
</template>
