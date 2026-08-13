<script setup lang="ts">
import type { Character } from '~/types/character'
import { characters } from '~/utils/characters'
import { generateTop10Image } from '~/utils/imageGenerator'
import { getSeriesColor, getSeriesLabel, seriesLabelMap } from '~/utils/series'

const route = useRoute()
const selectedCharacters = ref<Character[]>([])
const currentIndex = ref(0)
const rankings = ref<Record<number, Character>>({})
const isGeneratingImage = ref(false)
const downloadError = ref('')

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
}

function selectRank(rank: number) {
  if (!currentCharacter.value || usedRanks.value.includes(rank)) return

  rankings.value[rank] = currentCharacter.value
  currentIndex.value++
}

async function downloadResultImage() {
  isGeneratingImage.value = true
  downloadError.value = ''

  try {
    const blob = await generateTop10Image(
      sortedResults.value.map(result => result.character),
      selectedSeries.value,
      true
    )
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `隨機Top10角色排名_${Date.now()}.png`
    link.click()
    URL.revokeObjectURL(url)
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
          <UButton icon="i-heroicons-arrow-down-tray" :loading="isGeneratingImage" @click="downloadResultImage">
            下載圖片
          </UButton>
        </div>
        <p v-if="downloadError" class="mt-3 text-sm text-red-500">{{ downloadError }}</p>
      </div>

      <div class="space-y-4">
        <ResultItem
          v-for="result in sortedResults"
          :key="result.character.id"
          :character="result.character"
          :index="result.rank - 1"
        />
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
