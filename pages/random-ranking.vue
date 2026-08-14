<script setup lang="ts">
import type { Character } from '~/types/character'
import { characters } from '~/utils/characters'
import { snapdom } from '@zumer/snapdom'
import { getSeriesColor, getSeriesLabel, seriesLabelMap } from '~/utils/series'

const route = useRoute()
const selectedCharacters = ref<Character[]>([])
const currentIndex = ref(0)
const rankings = ref<Record<number, Character>>({})
const isGeneratingImage = ref(false)
const downloadError = ref('')
const exportRef = ref<HTMLElement | null>(null)
const resultOrder = ref<'rank' | 'appearance'>('rank')
const resultOrderOptions = [
  { label: '依名次排序', value: 'rank' },
  { label: '依出場順序排序', value: 'appearance' }
]

const selectedSeries = computed(() => {
  const queryValue = route.query.series
  const rawSeries = typeof queryValue === 'string' ? queryValue.split(',') : []
  const validSeries = Object.keys(seriesLabelMap)
  return rawSeries.filter(series => validSeries.includes(series))
})

const selectedCharacterIds = computed(() => {
  const queryValue = route.query.characters
  return typeof queryValue === 'string' ? queryValue.split(',').filter(Boolean) : []
})

const currentCharacter = computed(() => selectedCharacters.value[currentIndex.value])
const usedRanks = computed(() => Object.keys(rankings.value).map(Number))
const isFinished = computed(() => currentIndex.value === 10)
const sortedResults = computed(() =>
  Object.entries(rankings.value)
    .map(([rank, character]) => ({ rank: Number(rank), character }))
    .sort((a, b) => a.rank - b.rank)
)
const appearanceOrderById = computed(() =>
  new Map(selectedCharacters.value.map((character, index) => [character.id, index + 1]))
)
const displayResults = computed(() => {
  if (resultOrder.value === 'rank') return sortedResults.value

  return [...sortedResults.value].sort((a, b) =>
    (appearanceOrderById.value.get(a.character.id) || 0) - (appearanceOrderById.value.get(b.character.id) || 0)
  )
})


function randomInt(max: number) {
  if (max <= 0) return 0

  if (globalThis.crypto?.getRandomValues) {
    const maxUint32 = 0x1_0000_0000
    const limit = Math.floor(maxUint32 / max) * max
    const buffer = new Uint32Array(1)

    do {
      globalThis.crypto.getRandomValues(buffer)
    } while (buffer[0] >= limit)

    return buffer[0] % max
  }

  return Math.floor(Math.random() * max)
}

function shuffle(list: Character[]) {
  const shuffled = [...list]
  for (let index = shuffled.length - 1; index > 0; index--) {
    const randomIndex = randomInt(index + 1)
    ;[shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]]
  }
  return shuffled
}

function startGame() {
  const candidates = characters.filter(character =>
    selectedSeries.value.includes(character.series) &&
    (selectedCharacterIds.value.length === 0 || selectedCharacterIds.value.includes(character.id))
  )
  selectedCharacters.value = shuffle(candidates).slice(0, 10)
  currentIndex.value = 0
  rankings.value = {}
  resultOrder.value = 'rank'
}

function selectRank(rank: number) {
  if (!currentCharacter.value || usedRanks.value.includes(rank)) return

  rankings.value[rank] = currentCharacter.value
  currentIndex.value++
}

async function downloadResultImage() {
  if (!exportRef.value) return
  isGeneratingImage.value = true
  downloadError.value = ''

  try {
    const image = await snapdom(exportRef.value, {
      scale: 2,
      reconcile: true,
      embedFonts: true
    })
    await image.download({
      format: 'png',
      filename: `隨機Top10角色排名_${Date.now()}.png`
    })
  } catch (error) {
    console.error('生成隨機排名圖片失敗:', error)
    downloadError.value = '圖片產生失敗，請再試一次。'
  } finally {
    isGeneratingImage.value = false
  }
}

onMounted(() => {
  if (selectedSeries.value.length === 0) {
    navigateTo({ name: 'index' })
    return
  }

  if (characters.filter(character =>
    selectedSeries.value.includes(character.series) &&
    (selectedCharacterIds.value.length === 0 || selectedCharacterIds.value.includes(character.id))
  ).length < 10) {
    navigateTo({ name: 'index' })
    return
  }

  startGame()
})
</script>

<template>
  <UContainer class="min-h-screen max-w-none py-10">
    <template v-if="!isFinished">
      <div class="mx-auto mb-8 max-w-2xl text-center">
        <div class="mb-5 text-left">
          <UButton color="gray" variant="ghost" icon="i-heroicons-arrow-left" @click="navigateTo({ name: 'index' })">
            返回首頁
          </UButton>
        </div>
        <p class="text-sm font-semibold text-violet-500">隨機排名</p>
        <h1 class="mt-2 text-3xl font-extrabold sm:text-4xl">這位角色該排第幾名？</h1>
        <p class="mt-3 text-gray-500 dark:text-gray-400">
          第 {{ currentIndex + 1 }} / 10 位，選過的名次不能重複。
        </p>
        <UProgress class="mt-5" :value="currentIndex * 10" color="violet" indicator />
      </div>

      <div v-if="currentCharacter" class="mx-auto max-w-3xl">
        <Transition name="character-switch" mode="out-in">
          <CharacterCard
            :key="currentCharacter.id"
            :character="currentCharacter"
            class="mx-auto w-full max-w-sm cursor-default hover:scale-100 hover:ring-0"
          />
        </Transition>

        <UCard class="mt-8">
          <template #header>
            <h2 class="text-center text-lg font-bold">選擇排名</h2>
          </template>

          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <SelectedRankingItem
              v-for="rank in 10"
              :key="rank"
              :rank="rank"
              :character="rankings[rank]"
              :series-label="rankings[rank] ? getSeriesLabel(rankings[rank].series) : ''"
              :series-color="rankings[rank] ? getSeriesColor(rankings[rank].series) : 'gray'"
              @select="selectRank(rank)"
            />
          </div>
        </UCard>
      </div>
    </template>

    <div v-else class="mx-auto max-w-2xl">
      <div class="mb-8 text-center">
        <p class="text-sm font-semibold text-violet-500">隨機排名完成</p>
        <h1 class="mt-2 text-3xl font-extrabold sm:text-4xl">你的隨機 Top 10</h1>
        <div class="mt-4 flex flex-wrap justify-center gap-2">
          <UBadge
            v-for="series in selectedSeries"
            :key="series"
            :color="getSeriesColor(series)"
            variant="subtle"
          >
            {{ getSeriesLabel(series) }}
          </UBadge>
        </div>
        <div class="mt-6 flex justify-center gap-3">
          <UButton color="gray" icon="i-heroicons-home" @click="navigateTo({ name: 'index' })">返回首頁</UButton>
          <UButton color="violet" icon="i-heroicons-arrow-path" @click="startGame">再玩一次</UButton>
          <USelect v-model="resultOrder" :options="resultOrderOptions" class="w-44" />
          <UButton icon="i-heroicons-arrow-down-tray" :loading="isGeneratingImage" @click="downloadResultImage">
            下載圖片
          </UButton>
        </div>
        <p v-if="downloadError" class="mt-3 text-sm text-red-500">{{ downloadError }}</p>
      </div>

      <div class="space-y-4">
        <ResultItem
          v-for="result in displayResults"
          :key="result.character.id"
          :character="result.character"
          :index="result.rank - 1"
          :appearance-order="appearanceOrderById.get(result.character.id)"
        />
      </div>

      <div ref="exportRef" class="fixed left-[-10000px] top-0 w-[1000px] bg-white p-10 text-gray-900">
        <div class="mb-7 flex items-start justify-between border-b-2 border-gray-100 pb-5">
          <div class="shrink-0">
            <p class="text-sm font-bold tracking-widest text-violet-500">ANIME TOOLS</p>
            <h2 class="mt-1 whitespace-nowrap text-4xl font-black">你的隨機 Top 10</h2>
          </div>
          <div class="flex max-w-md flex-wrap justify-end gap-2">
            <span v-for="series in selectedSeries" :key="series" class="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-600">
              {{ getSeriesLabel(series) }}
            </span>
          </div>
        </div>
        <div class="grid grid-flow-col grid-rows-5 gap-4">
          <ResultItem
            v-for="result in displayResults"
            :key="result.character.id"
            :character="result.character"
            :index="result.rank - 1"
            :appearance-order="appearanceOrderById.get(result.character.id)"
          />
        </div>
      </div>
    </div>
  </UContainer>
</template>

<style scoped>
.character-switch-enter-active,
.character-switch-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.character-switch-enter-from {
  opacity: 0;
  transform: translateY(16px);
}

.character-switch-leave-to {
  opacity: 0;
  transform: translateY(-16px);
}
</style>
