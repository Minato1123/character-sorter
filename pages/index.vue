<script setup lang="ts">
import { characters } from '~/utils/characters'
import { useSorter } from '~/composables/useSorter'
import { changelogEntries } from '~/utils/changelog'
import { seriesColorMap, seriesLabelMap } from '~/utils/series'
import packageJson from '../package.json'

const { startSorting, setSelectedSeries } = useSorter()
const appVersion = packageJson.version

const seriesOptions = Object.entries(seriesLabelMap).map(([value, label]) => ({ value, label }))
const createSeriesSelection = () => Object.fromEntries(seriesOptions.map(({ value }) => [value, true])) as Record<string, boolean>
// 本地狀態管理系列選擇
const seriesSelection = ref(createSeriesSelection())
const randomSeriesSelection = ref(createSeriesSelection())
const visibleSeriesSelection = ref(createSeriesSelection())
const draftVisibleSeriesSelection = ref(createSeriesSelection())
const sorterExcludedCharacterIds = ref<string[]>([])
const randomExcludedCharacterIds = ref<string[]>([])
const isChangelogOpen = ref(false)
const isSettingsOpen = ref(false)

// 計算屬性
const visibleSeriesOptions = computed(() => seriesOptions.filter(({ value }) => visibleSeriesSelection.value[value]))
const hasDraftVisibleSeries = computed(() => Object.values(draftVisibleSeriesSelection.value).some(Boolean))
const selectedSeriesList = computed(() => visibleSeriesOptions.value.map(({ value }) => value).filter(series => seriesSelection.value[series]))
const hasSelection = computed(() => selectedSeriesList.value.length > 0)

const filteredCharacters = computed(() => 
  characters.filter(c => selectedSeriesList.value.includes(c.series) && !sorterExcludedCharacterIds.value.includes(c.id))
)

const selectedCount = computed(() => selectedSeriesList.value.length)

const randomSelectedSeriesList = computed(() => visibleSeriesOptions.value.map(({ value }) => value).filter(series => randomSeriesSelection.value[series]))

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

function loadSeriesSelection(key: string, target: Ref<Record<string, boolean>>) {
  const saved = localStorage.getItem(key)
  if (!saved) return

  try {
    const parsed = JSON.parse(saved)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return

    target.value = Object.fromEntries(seriesOptions.map(({ value }) => [
      value,
      typeof parsed[value] === 'boolean' ? parsed[value] : true
    ]))
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

function openSettings() {
  draftVisibleSeriesSelection.value = { ...visibleSeriesSelection.value }
  isSettingsOpen.value = true
}

function toggleDraftVisibleSeries(series: string) {
  draftVisibleSeriesSelection.value = {
    ...draftVisibleSeriesSelection.value,
    [series]: !draftVisibleSeriesSelection.value[series]
  }
}

function updateAllDraftVisibleSeries(checked: boolean) {
  draftVisibleSeriesSelection.value = Object.fromEntries(seriesOptions.map(({ value }) => [value, checked]))
}

function cancelSettings() {
  isSettingsOpen.value = false
}

function saveSettings() {
  if (!hasDraftVisibleSeries.value) return
  visibleSeriesSelection.value = { ...draftVisibleSeriesSelection.value }
  isSettingsOpen.value = false
}

function settingSeriesClasses(series: string) {
  const color = seriesColorMap[series as keyof typeof seriesColorMap]
  if (color === 'blue') return 'border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/30'
  if (color === 'orange') return 'border-orange-400 bg-orange-50 dark:border-orange-500 dark:bg-orange-950/30'
  if (color === 'red') return 'border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-950/30'
  if (color === 'sky') return 'border-sky-400 bg-sky-50 dark:border-sky-500 dark:bg-sky-950/30'
  if (color === 'green') return 'border-green-400 bg-green-50 dark:border-green-500 dark:bg-green-950/30'
  return 'border-gray-500 bg-gray-100 dark:border-gray-400 dark:bg-gray-800'
}

function isFeatureRelease(version: string) {
  return version.endsWith('.0')
}

onMounted(() => {
  loadSeriesSelection('character-sorter-sorter-series-selection', seriesSelection)
  loadSeriesSelection('character-sorter-random-series-selection', randomSeriesSelection)
  loadSeriesSelection('character-sorter-visible-series-selection', visibleSeriesSelection)
  loadExcludedCharacters('character-sorter-sorter-excluded-characters', sorterExcludedCharacterIds)
  loadExcludedCharacters('character-sorter-random-excluded-characters', randomExcludedCharacterIds)
})

watch(seriesSelection, value => localStorage.setItem('character-sorter-sorter-series-selection', JSON.stringify(value)), { deep: true })
watch(randomSeriesSelection, value => localStorage.setItem('character-sorter-random-series-selection', JSON.stringify(value)), { deep: true })
watch(visibleSeriesSelection, value => localStorage.setItem('character-sorter-visible-series-selection', JSON.stringify(value)), { deep: true })
watch(sorterExcludedCharacterIds, value => localStorage.setItem('character-sorter-sorter-excluded-characters', JSON.stringify(value)), { deep: true })
watch(randomExcludedCharacterIds, value => localStorage.setItem('character-sorter-random-excluded-characters', JSON.stringify(value)), { deep: true })
</script>

<template>
  <UContainer class="min-h-screen py-12 sm:py-20">
    <div class="fixed right-4 top-4 z-20 flex gap-2 sm:right-6 sm:top-6">
      <UButton
        color="gray"
        variant="soft"
        size="sm"
        square
        icon="i-heroicons-clock"
        aria-label="更新紀錄"
        title="更新紀錄"
        @click="isChangelogOpen = true"
      />
      <UButton
        color="gray"
        variant="soft"
        size="sm"
        square
        icon="i-heroicons-cog-6-tooth"
        aria-label="設定"
        title="設定"
        @click="openSettings"
      />
    </div>

    <div class="mx-auto max-w-3xl text-center">
      <p class="mb-3 text-sm font-semibold tracking-widest text-primary-500">ANIME TOOLS</p>
      <div class="relative inline-block">
        <div>
          <h1 class="text-4xl font-extrabold text-gray-900 sm:text-6xl dark:text-white">
            動漫小工具箱
            <span class="text-xs font-medium text-gray-300 dark:text-gray-600">v{{ appVersion }}</span>
          </h1>
        </div>
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
          <SeriesCharacterSelector v-model="seriesSelection" v-model:excluded-ids="sorterExcludedCharacterIds" :series-options="visibleSeriesOptions" />
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
          <SeriesCharacterSelector v-model="randomSeriesSelection" v-model:excluded-ids="randomExcludedCharacterIds" :series-options="visibleSeriesOptions" />
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
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">建立角色喜好表與我推年度回顧，下載圖片分享。</p>
            </div>
          </div>
        </template>

        <div class="flex flex-1 flex-col justify-center py-5 text-center text-gray-500 dark:text-gray-400">
          <UIcon name="i-heroicons-sparkles" class="mx-auto mb-3 h-10 w-10 text-amber-500" />
          <p>選擇角色、填寫內容，完成你的專屬表格。</p>
        </div>

        <template #footer>
          <UButton block size="lg" color="amber" icon="i-heroicons-table-cells" @click="navigateTo({ name: 'table-generator' })">
            開始建立表格
          </UButton>
        </template>
      </UCard>

      
    </div>

    <UModal v-model="isChangelogOpen">
      <UCard>
        <template #header>
          <div class="flex items-center gap-3">
            <UIcon name="i-heroicons-clock" class="h-6 w-6 text-primary-500" />
            <div>
              <h2 class="text-lg font-bold">更新紀錄</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">目前版本 v{{ appVersion }}</p>
            </div>
          </div>
        </template>

        <div class="max-h-[55vh] space-y-5 overflow-y-auto pr-1">
          <section
            v-for="entry in changelogEntries"
            :key="entry.version"
            :class="isFeatureRelease(entry.version) ? '' : 'ml-5'"
          >
            <div class="flex items-center gap-2">
              <UIcon
                :name="isFeatureRelease(entry.version) ? 'i-heroicons-sparkles' : 'i-heroicons-wrench-screwdriver'"
                :class="isFeatureRelease(entry.version) ? 'h-5 w-5 text-primary-500' : 'h-4 w-4 text-gray-400'"
              />
              <h3 :class="isFeatureRelease(entry.version) ? 'text-xl font-bold text-primary-600 dark:text-primary-400' : 'text-sm font-semibold text-gray-700 dark:text-gray-200'">
                v{{ entry.version }}
              </h3>
            </div>
            <ul :class="isFeatureRelease(entry.version) ? 'mt-2 list-disc space-y-1 pl-7 text-sm text-gray-600 dark:text-gray-300' : 'mt-1.5 list-disc space-y-1 pl-6 text-sm text-gray-500 dark:text-gray-400'">
              <li v-for="change in entry.changes" :key="change">{{ change }}</li>
            </ul>
          </section>
        </div>

        <template #footer>
          <div class="space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <p>發現 Bug，或希望新增作品、角色嗎？歡迎到 Issue 告訴我！</p>
            <div class="flex flex-wrap gap-2">
              <UButton to="https://github.com/Minato1123/character-sorter" target="_blank" color="gray" variant="soft" icon="i-simple-icons-github">
                GitHub Repo
              </UButton>
              <UButton to="https://github.com/Minato1123/character-sorter/issues" target="_blank" color="primary" variant="soft" icon="i-heroicons-bug-ant">
                回報 Issue
              </UButton>
            </div>
          </div>
        </template>
      </UCard>
    </UModal>

    <UModal v-model="isSettingsOpen">
      <UCard>
        <template #header>
          <div class="flex items-center gap-3">
            <UIcon name="i-heroicons-cog-6-tooth" class="h-6 w-6 text-primary-500" />
            <div>
              <h2 class="text-lg font-bold">設定</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">選擇你看過的作品，才會顯示在首頁的工具中。</p>
            </div>
          </div>
        </template>

        <div class="mb-4 flex justify-end gap-2">
          <UButton size="xs" color="gray" variant="ghost" @click="updateAllDraftVisibleSeries(true)">全部顯示</UButton>
          <UButton size="xs" color="gray" variant="ghost" @click="updateAllDraftVisibleSeries(false)">全部隱藏</UButton>
        </div>
        <div class="space-y-2">
          <button
            v-for="series in seriesOptions"
            :key="series.value"
            type="button"
            class="flex w-full items-center rounded-lg border px-3 py-2 text-left transition-colors"
            :class="draftVisibleSeriesSelection[series.value] ? settingSeriesClasses(series.value) : 'border-gray-200 dark:border-gray-800'"
            @click="toggleDraftVisibleSeries(series.value)"
          >
            <UCheckbox
              class="pointer-events-none"
              :model-value="draftVisibleSeriesSelection[series.value]"
              :label="series.label"
              :color="seriesColorMap[series.value as keyof typeof seriesColorMap] || 'gray'"
            />
          </button>
        </div>

        <template #footer>
          <div class="flex items-center justify-between gap-3">
            <p class="text-sm text-gray-500 dark:text-gray-400">至少選擇一部作品。設定會記在這台裝置中，並同時套用到兩個排名工具。</p>
            <div class="flex shrink-0 gap-2">
              <UButton color="gray" variant="ghost" @click="cancelSettings">取消</UButton>
              <UButton :disabled="!hasDraftVisibleSeries" @click="saveSettings">儲存</UButton>
            </div>
          </div>
        </template>
      </UCard>
    </UModal>
  </UContainer>
</template>
