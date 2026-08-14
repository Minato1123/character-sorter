<script setup lang="ts">
import { characters } from '~/utils/characters'
import { useSorter } from '~/composables/useSorter'
import { seriesLabelMap } from '~/utils/series'

const { startSorting, setSelectedSeries } = useSorter()

const seriesOptions = Object.entries(seriesLabelMap).map(([value, label]) => ({ value, label }))
const createSeriesSelection = () => Object.fromEntries(seriesOptions.map(({ value }) => [value, true])) as Record<string, boolean>

// 本地狀態管理系列選擇
const seriesSelection = ref(createSeriesSelection())
const randomSeriesSelection = ref(createSeriesSelection())
const sorterExcludedCharacterIds = ref<string[]>([])
const randomExcludedCharacterIds = ref<string[]>([])

// 計算屬性
const hasSelection = computed(() => Object.values(seriesSelection.value).some(Boolean))

const selectedSeriesList = computed(() => Object.keys(seriesSelection.value).filter(series => seriesSelection.value[series]))

const filteredCharacters = computed(() => 
  characters.filter(c => selectedSeriesList.value.includes(c.series) && !sorterExcludedCharacterIds.value.includes(c.id))
)

const selectedCount = computed(() => selectedSeriesList.value.length)

const randomSelectedSeriesList = computed(() => Object.keys(randomSeriesSelection.value).filter(series => randomSeriesSelection.value[series]))

const randomCharacterCount = computed(() =>
  characters.filter(c => randomSelectedSeriesList.value.includes(c.series) && !randomExcludedCharacterIds.value.includes(c.id)).length
)

const canStartRandomRanking = computed(() => randomCharacterCount.value >= 10)

function handleStart() {
  setSelectedSeries(selectedSeriesList.value)
  startSorting(filteredCharacters.value)
  navigateTo({ name: 'battle' })
}

function handleRandomRankingStart() {
  navigateTo({
    name: 'random-ranking',
    query: {
      series: randomSelectedSeriesList.value.join(','),
      characters: characters
        .filter(c => randomSelectedSeriesList.value.includes(c.series) && !randomExcludedCharacterIds.value.includes(c.id))
        .map(c => c.id)
        .join(',')
    }
  })
}

function loadExcludedCharacters(key: string, target: Ref<string[]>) {
  const saved = localStorage.getItem(key)
  if (!saved) return
  try {
    const parsed = JSON.parse(saved)
    if (Array.isArray(parsed)) target.value = parsed.filter(id => typeof id === 'string')
  } catch {
    localStorage.removeItem(key)
  }
}

function syncToRandomRanking() {
  randomSeriesSelection.value = { ...seriesSelection.value }
  randomExcludedCharacterIds.value = [...sorterExcludedCharacterIds.value]
}

function syncToSorter() {
  seriesSelection.value = { ...randomSeriesSelection.value }
  sorterExcludedCharacterIds.value = [...randomExcludedCharacterIds.value]
}

onMounted(() => {
  loadExcludedCharacters('character-sorter-sorter-excluded-characters', sorterExcludedCharacterIds)
  loadExcludedCharacters('character-sorter-random-excluded-characters', randomExcludedCharacterIds)
})

watch(sorterExcludedCharacterIds, value => localStorage.setItem('character-sorter-sorter-excluded-characters', JSON.stringify(value)), { deep: true })
watch(randomExcludedCharacterIds, value => localStorage.setItem('character-sorter-random-excluded-characters', JSON.stringify(value)), { deep: true })
</script>

<template>
  <UContainer class="min-h-screen py-12 sm:py-20">
    <div class="mx-auto max-w-3xl text-center">
      <p class="mb-3 text-sm font-semibold tracking-widest text-primary-500">ANIME TOOLS</p>
      <div class="relative inline-block">
        <h1 class="text-4xl font-extrabold text-gray-900 sm:text-6xl dark:text-white">
          動漫小工具箱
        </h1>
        <span class="absolute left-full top-1/2 ml-2 -translate-y-1/2 whitespace-nowrap text-xs font-medium text-gray-300 dark:text-gray-600">v1.1.0</span>
      </div>
      <p class="mx-auto mt-5 max-w-xl text-lg text-gray-500 dark:text-gray-400">
        選擇你想使用的工具，整理喜愛的角色與作品。
      </p>
    </div>

    <div class="mx-auto mt-12 grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
      <UCard class="flex h-full flex-col" :ui="{ body: { base: 'flex flex-1 flex-col' } }">
        <template #header>
          <div class="flex items-start gap-4">
            <div class="rounded-xl bg-primary-100 p-3 text-primary-600 dark:bg-primary-950 dark:text-primary-300">
              <UIcon name="i-heroicons-arrows-right-left" class="h-7 w-7" />
            </div>
            <div>
              <h2 class="text-xl font-bold">角色二選一</h2>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">透過一輪輪選擇，排出你的角色喜好排名。</p>
            </div>
          </div>
        </template>

        <div class="space-y-3">
          <p class="text-sm font-semibold">選擇要排序的作品</p>
          <SeriesCharacterSelector v-model="seriesSelection" v-model:excluded-ids="sorterExcludedCharacterIds" />
          <UButton block color="gray" variant="ghost" size="sm" icon="i-heroicons-arrow-left" @click="syncToSorter">
            從隨機排名同步名單
          </UButton>
        </div>

        <template #footer>
          <div class="space-y-4">
            <p class="text-sm text-gray-500 dark:text-gray-400">
              已選擇 <span class="font-semibold text-primary-500">{{ selectedCount }}</span> 個作品，
              共 <span class="font-semibold text-primary-500">{{ filteredCharacters.length }}</span> 名角色
            </p>
            <UButton block size="lg" icon="i-heroicons-play-circle" :disabled="!hasSelection" @click="handleStart">
              開始二選一
            </UButton>
          </div>
        </template>
      </UCard>
      <UCard class="flex h-full flex-col" :ui="{ body: { base: 'flex flex-1 flex-col' } }">
        <template #header>
          <div class="flex items-start gap-4">
            <div class="rounded-xl bg-violet-100 p-3 text-violet-600 dark:bg-violet-950 dark:text-violet-300">
              <UIcon name="i-heroicons-arrow-path" class="h-7 w-7" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-xl font-bold">隨機排名</h2>
                <UBadge color="violet" variant="subtle">測試中</UBadge>
              </div>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">隨機抽 10 位角色，在無法得知未來會抽到哪些角色的情況下進行排名。</p>
            </div>
          </div>
        </template>

        <div class="space-y-3">
          <p class="text-sm font-semibold">選擇要加入排名的作品</p>
          <SeriesCharacterSelector v-model="randomSeriesSelection" v-model:excluded-ids="randomExcludedCharacterIds" />
          <UButton block color="gray" variant="ghost" size="sm" icon="i-heroicons-arrow-right" @click="syncToRandomRanking">
            從角色二選一同步名單
          </UButton>
        </div>

        <template #footer>
          <div class="space-y-4">
            <p class="text-sm text-gray-500 dark:text-gray-400">
              已選擇 <span class="font-semibold text-violet-500">{{ randomSelectedSeriesList.length }}</span> 個作品，
              共 <span class="font-semibold text-violet-500">{{ randomCharacterCount }}</span> 名角色
            </p>
            <p v-if="!canStartRandomRanking" class="text-xs text-red-500">
              請至少選擇 10 名角色才能開始排名。
            </p>
            <UButton
              block
              size="lg"
              color="violet"
              icon="i-heroicons-arrow-path"
              :disabled="!canStartRandomRanking"
              @click="handleRandomRankingStart"
            >
              開始隨機排名
            </UButton>
          </div>
        </template>
      </UCard>
      <UCard class="flex h-full flex-col" :ui="{ body: { base: 'flex flex-1 flex-col' } }">
        <template #header>
          <div class="flex items-start gap-4">
            <div class="rounded-xl bg-amber-100 p-3 text-amber-600 dark:bg-amber-950 dark:text-amber-300">
              <UIcon name="i-heroicons-table-cells" class="h-7 w-7" />
            </div>
            <div>
              <h2 class="text-xl font-bold">表格產生器</h2>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">快速建立好看又方便分享的表格。</p>
            </div>
          </div>
        </template>

        <div class="flex flex-1 flex-col justify-center py-5 text-center text-gray-500 dark:text-gray-400">
          <UIcon name="i-heroicons-sparkles" class="mx-auto mb-3 h-10 w-10 text-amber-500" />
          <p>表格產生功能正在製作中，敬請期待！</p>
        </div>

        <template #footer>
          <UButton block size="lg" color="amber" icon="i-heroicons-table-cells" @click="navigateTo({ name: 'table-generator' })">
            開始建立表格
          </UButton>
        </template>
      </UCard>

      
    </div>
  </UContainer>
</template>
