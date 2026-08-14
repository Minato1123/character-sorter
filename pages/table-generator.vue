<script setup lang="ts">
import { snapdom } from '@zumer/snapdom'
import type { Character } from '~/types/character'
import { characters } from '~/utils/characters'
import { getSeriesLabel } from '~/utils/series'

const categories = [
  '本命', '初戀',  '最佳個性', '最強戰力', '智商最高',
  '最想當家人', '最想當朋友', '最想談戀愛', '最想結婚', '婚外首選',
  '難以釋懷', '心理陰影', '此生宿敵', '無法理解', '只有臉好看'
]

const annualCategories = [
  '綜合排名冠軍', '綜合排名亞軍', '綜合排名季軍', '綜合排名殿軍',
  '花最多錢', '衝著入坑', '愛最久的', '沒遇過推', '漸忘容顏', '自填項目',
]
const annualRanks = ['冠軍', '亞軍', '季軍', '殿軍']

const tableTypeOptions = [
  { label: '經典角色喜好表', value: 'classic' },
  { label: '我推的年度回顧', value: 'annual' }
]
const selectedTableType = ref('classic')
const tableTitle = ref(tableTypeOptions[0].label)
const tableAuthor = ref('')
const annualMessage = ref('')
const annualCustomCategory = ref('')
const selections = ref<Record<number, Character | undefined>>({})
const customCharacters = ref<Character[]>([])
const activeCell = ref<number | null>(null)
const searchTerm = ref('')
const customCharacterName = ref('')
const customCharacterImage = ref<File | null>(null)
const customCharacterImageUrl = ref('')
const customUploadPreviewUrl = ref('')
const customImageSource = ref<'upload' | 'url'>('upload')
const pickerTab = ref<'select' | 'custom'>('select')
const isPickerOpen = ref(false)
const isExporting = ref(false)
const tableRef = ref<HTMLElement | null>(null)
const customImageInput = ref<HTMLInputElement | null>(null)

const isAnnualTable = computed(() => selectedTableType.value === 'annual')
const currentCategories = computed(() => isAnnualTable.value ? annualCategories : categories)
const activeCategoryLabel = computed(() => {
  if (isAnnualTable.value && activeCell.value !== null && activeCell.value >= 10) return '年度西批'
  if (isAnnualTable.value && activeCell.value === 9) return annualCustomCategory.value.trim() || '自填項目'
  return activeCell.value === null ? '' : currentCategories.value[activeCell.value]
})
const customImagePreviewUrl = computed(() => customImageSource.value === 'upload' ? customUploadPreviewUrl.value : customCharacterImageUrl.value.trim())
const hasCustomCharacterImage = computed(() => Boolean(customImagePreviewUrl.value))

watch(selectedTableType, (tableType) => {
  tableTitle.value = tableTypeOptions.find(option => option.value === tableType)?.label || ''
})

const {
  currentSrc: annualPairingFirstSrc,
  imageError: annualPairingFirstError,
  handleImageError: handleAnnualPairingFirstError
} = useImageFallback(() => selections.value[10]?.image || '')
const {
  currentSrc: annualPairingSecondSrc,
  imageError: annualPairingSecondError,
  handleImageError: handleAnnualPairingSecondError
} = useImageFallback(() => selections.value[11]?.image || '')

const filteredCharacters = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  const allCharacters = [...characters, ...customCharacters.value]
  const availableCharacters = isAnnualTable.value && activeCell.value === 11 && selections.value[10]
    ? allCharacters.filter(character => character.series === selections.value[10]?.series && character.id !== selections.value[10]?.id)
    : allCharacters
  const matchedCharacters = !term ? availableCharacters : availableCharacters.filter(character =>
    character.name.toLowerCase().includes(term) ||
    getSeriesLabel(character.series).toLowerCase().includes(term)
  )

  return matchedCharacters.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant'))
})

function openPicker(index: number) {
  activeCell.value = index
  searchTerm.value = ''
  resetCustomCharacterForm()
  pickerTab.value = 'select'
  isPickerOpen.value = true
}

function closePicker() {
  isPickerOpen.value = false
  resetCustomCharacterForm()
}

function selectCharacter(character: Character) {
  if (activeCell.value === null) return
  const selectedIndex = activeCell.value
  selections.value[selectedIndex] = character

  if (selectedIndex === 10 && selections.value[11]?.series !== character.series) {
    delete selections.value[11]
  }

  closePicker()
}

function handleAnnualMessageInput(event: Event) {
  const textarea = event.target as HTMLTextAreaElement
  const previousValue = annualMessage.value
  const nextValue = textarea.value

  if (nextValue.split('\n').length > 4) {
    textarea.value = previousValue
    return
  }

  annualMessage.value = nextValue
  nextTick(() => {
    if (textarea.scrollHeight > textarea.clientHeight) {
      annualMessage.value = previousValue
      textarea.value = previousValue
    }
  })
}

function clearCell() {
  if (activeCell.value === null) return
  if (activeCell.value === 10) delete selections.value[11]
  delete selections.value[activeCell.value]
  closePicker()
}

function handleCustomImageChange(event: Event) {
  const input = event.target as HTMLInputElement
  customCharacterImage.value = input.files?.[0] || null
  if (!customCharacterImage.value) return
  customImageSource.value = 'upload'
  customUploadPreviewUrl.value = URL.createObjectURL(customCharacterImage.value)
}

function openImagePicker() {
  customImageInput.value?.click()
}

function selectImageSource(source: 'upload' | 'url') {
  customImageSource.value = source
}

function handleImageUrlInput(value: string) {
  customImageSource.value = 'url'
  customCharacterImageUrl.value = value
}

function removeCustomImage() {
  if (customImageSource.value === 'upload') {
    customCharacterImage.value = null
    customUploadPreviewUrl.value = ''
    if (customImageInput.value) customImageInput.value.value = ''
  } else {
    customCharacterImageUrl.value = ''
  }
}

function resetCustomCharacterForm() {
  customCharacterName.value = ''
  customCharacterImage.value = null
  customCharacterImageUrl.value = ''
  customUploadPreviewUrl.value = ''
  customImageSource.value = 'upload'
  if (customImageInput.value) customImageInput.value.value = ''
}

function addCustomCharacter() {
  const name = customCharacterName.value.trim()
  if (!name || !hasCustomCharacterImage.value) return

  const character: Character = {
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name,
    series: activeCell.value === 11 && selections.value[10] ? selections.value[10].series : 'MHA',
    image: customImageSource.value === 'url' ? customCharacterImageUrl.value.trim() : customUploadPreviewUrl.value
  }

  customCharacters.value.push(character)
  customCharacterName.value = ''
  selectCharacter(character)
}

async function exportTable() {
  if (!tableRef.value) return
  isExporting.value = true

  try {
    const image = await snapdom(tableRef.value, {
      scale: 2,
      reconcile: true,
      embedFonts: true
    })
    await image.download({
      format: 'png',
      filename: `${tableTitle.value || '動漫角色喜好表'}_${Date.now()}.png`
    })
  } catch (error) {
    console.error('表格圖片產生失敗:', error)
  } finally {
    isExporting.value = false
  }
}
</script>

<template>
  <UContainer class="min-h-screen max-w-none py-10">
    <div class="mx-auto mb-8 max-w-3xl text-center">
      <div class="mb-5 text-left">
        <UButton color="gray" variant="ghost" icon="i-heroicons-arrow-left" @click="navigateTo({ name: 'index' })">
          返回首頁
        </UButton>
      </div>
      <p class="text-sm font-semibold text-amber-500">表格產生器</p>
      <h1 class="mt-2 text-3xl font-extrabold sm:text-4xl">建立你的角色喜好表</h1>
      <!-- <p class="mt-3 text-gray-500 dark:text-gray-400">點選任一格搜尋角色，完成後可下載圖片分享。</p> -->
    </div>

    <div class="mx-auto mb-6 flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div class="grid w-full gap-3 sm:max-w-3xl sm:grid-cols-3">
        <UFormGroup label="表格類型">
          <USelect v-model="selectedTableType" :options="tableTypeOptions" />
        </UFormGroup>
        <UFormGroup label="表格標題">
          <UInput v-model="tableTitle" placeholder="輸入表格標題" />
        </UFormGroup>
        <UFormGroup label="填表人">
          <UInput v-model="tableAuthor" placeholder="輸入你的名字" />
        </UFormGroup>
      </div>
      <UButton icon="i-heroicons-arrow-down-tray" color="amber" :loading="isExporting" @click="exportTable">
        下載圖片
      </UButton>
    </div>
    <div class="overflow-hidden pb-4">
      <div class="overflow-x-auto">
        <div ref="tableRef" class="mx-auto w-[1000px] bg-white p-7 text-gray-900">
          <template v-if="isAnnualTable">
            <div class="mb-6 flex items-end justify-between border-b-4 border-gray-700 pb-3">
              <div class="flex items-end gap-3">
                <h2 class="text-4xl font-black tracking-tight text-gray-800">{{ tableTitle }}</h2>
              </div>
              <p v-if="tableAuthor.trim()" class="text-lg font-bold text-gray-600">填表人：<span class="text-primary-600">{{ tableAuthor.trim() }}</span></p>
            </div>
            <div class="grid grid-cols-[1fr_1fr_1fr] gap-x-5">
              <section class="row-span-2">
                <h3 class="mb-3 text-2xl font-black text-gray-700">#綜合排名</h3>
                <div class="space-y-3">
                  <AnnualReviewCell
                    v-for="(rank, index) in annualRanks"
                    :key="rank"
                    :label="annualCategories[index]"
                    :rank="rank"
                    :character="selections[index]"
                    @select="openPicker(index)"
                  />
                </div>
              </section>
              <section class="space-y-4">
                <AnnualReviewCell
                  v-for="(label, index) in annualCategories.slice(4, 7)"
                  :key="label"
                  :label="label"
                  :character="selections[index + 4]"
                  @select="openPicker(index + 4)"
                />
              </section>
              <section class="space-y-4">
                <AnnualReviewCell
                  v-for="(label, index) in annualCategories.slice(7)"
                  :key="label"
                  :label="index === 2 ? annualCustomCategory : label"
                  :editable-label="index === 2"
                  :character="selections[index + 7]"
                  @update:label="annualCustomCategory = $event"
                  @select="openPicker(index + 7)"
                />
              </section>
              <section class="col-span-2 mt-5 grid grid-cols-2 gap-5">
                <div>
                  <div class="mb-2 flex items-baseline justify-between gap-2">
                    <h3 class="text-2xl font-black text-gray-700">#年度西批</h3>
                    <p v-if="selections[10]" class="truncate text-sm font-bold text-gray-500">來自：{{ getSeriesLabel(selections[10].series) }}</p>
                  </div>
                  <div class="flex h-[132px] w-full items-center justify-center gap-3 rounded-2xl border-2 border-gray-300 p-3">
                    <button type="button" class="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl text-sm font-bold text-primary-600 transition hover:bg-primary-50" @click="openPicker(10)">
                      <img v-if="selections[10] && !annualPairingFirstError" :src="annualPairingFirstSrc" :alt="selections[10]?.name" class="h-20 w-20 rounded-lg object-cover" @error="handleAnnualPairingFirstError">
                      <span v-else-if="selections[10]" class="flex h-20 w-20 items-center justify-center rounded-lg bg-gray-100 text-2xl text-gray-400">{{ selections[10]?.name.charAt(0) }}</span>
                      <span v-else class="flex h-14 w-14 items-center justify-center rounded-lg bg-gray-100 text-xl text-gray-400">+</span>
                      <span class="w-full truncate">{{ selections[10]?.name || '選擇角色' }}</span>
                    </button>
                    <UIcon name="i-heroicons-x-mark" class="shrink-0 text-xl text-gray-400" />
                    <button type="button" class="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl text-sm font-bold text-primary-600 transition hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent" :disabled="!selections[10]" @click="openPicker(11)">
                      <img v-if="selections[11] && !annualPairingSecondError" :src="annualPairingSecondSrc" :alt="selections[11]?.name" class="h-20 w-20 rounded-lg object-cover" @error="handleAnnualPairingSecondError">
                      <span v-else-if="selections[11]" class="flex h-20 w-20 items-center justify-center rounded-lg bg-gray-100 text-2xl text-gray-400">{{ selections[11]?.name.charAt(0) }}</span>
                      <span v-else class="flex h-14 w-14 items-center justify-center rounded-lg bg-gray-100 text-xl text-gray-400">+</span>
                      <span class="w-full truncate">{{ selections[11]?.name || '選擇角色' }}</span>
                    </button>
                  </div>
                </div>
                <div>
                  <h3 class="mb-2 text-2xl font-black text-gray-700">#自由留言</h3>
                  <textarea :value="annualMessage" rows="4" class="h-[132px] w-full resize-none overflow-hidden rounded-2xl border-2 border-gray-300 p-4 text-base leading-6 text-gray-700 outline-none placeholder:text-gray-400 focus:border-primary-500" placeholder="寫下今年想留下的話吧。" @input="handleAnnualMessageInput" />
                </div>
              </section>
            </div>
          </template>
          <template v-else>
            <div class="mb-6 grid grid-cols-[1fr_auto_1fr] items-end border-b-2 border-gray-100 pb-4">
              <span />
              <h2 class="text-center text-3xl font-extrabold text-gray-700">
                {{ tableTitle }}
              </h2>
              <p v-if="tableAuthor.trim()" class="justify-self-end text-sm font-medium text-gray-500">
                填表人：{{ tableAuthor.trim() }}
              </p>
            </div>
            <div class="grid grid-cols-5">
              <CharacterTableCell
                v-for="(label, index) in categories"
                :key="label"
                :label="label"
                :character="selections[index]"
                @select="openPicker(index)"
              />
            </div>
          </template>
        </div>
      </div>
    </div>

    <div class="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
      已填寫 {{ Object.keys(selections).length }} / {{ currentCategories.length }} 格
    </div>

    <UModal v-model="isPickerOpen">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between gap-4">
            <div>
              <h2 class="text-lg font-bold">選擇角色</h2>
              <p v-if="activeCell !== null" class="text-sm text-gray-500 dark:text-gray-400">要填入「{{ activeCategoryLabel }}」的角色</p>
            </div>
            <div class="flex items-center gap-2">
              <UButton v-if="activeCell !== null && selections[activeCell]" color="red" variant="ghost" size="sm" @click="clearCell">
                清除此格
              </UButton>
              <UButton color="gray" variant="ghost" size="sm" icon="i-heroicons-x-mark" aria-label="關閉" @click="closePicker" />
            </div>
          </div>
        </template>

        <div class="flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
          <button type="button" class="flex-1 rounded-md px-3 py-2 text-sm font-medium transition" :class="pickerTab === 'select' ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white' : 'text-gray-500'" @click="pickerTab = 'select'">選擇角色</button>
          <button type="button" class="flex-1 rounded-md px-3 py-2 text-sm font-medium transition" :class="pickerTab === 'custom' ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white' : 'text-gray-500'" @click="pickerTab = 'custom'">新增角色</button>
        </div>

        <div v-if="pickerTab === 'select'" class="mt-4">
          <UInput v-model="searchTerm" icon="i-heroicons-magnifying-glass" placeholder="搜尋角色名稱或作品" autofocus />
          <div class="mt-4 h-96 space-y-1 overflow-y-auto">
            <TableCharacterOption
              v-for="character in filteredCharacters"
              :key="character.id"
              :character="character"
              @select="selectCharacter"
            />
            <p v-if="filteredCharacters.length === 0" class="py-8 text-center text-sm text-gray-500">找不到符合的角色。</p>
          </div>
        </div>

        <div v-else class="mt-4">
          <div class="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
            <div class="grid gap-3">
              <UFormGroup label="角色名稱">
                <UInput v-model="customCharacterName" placeholder="例如：五條悟" />
              </UFormGroup>
            </div>
            <div class="mt-4">
              <div class="flex rounded-lg bg-gray-200 p-1 dark:bg-gray-800">
                <button type="button" class="flex-1 rounded-md px-3 py-2 text-sm font-medium transition" :class="customImageSource === 'upload' ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white' : 'text-gray-500'" @click="selectImageSource('upload')">上傳圖片</button>
                <button type="button" class="flex-1 rounded-md px-3 py-2 text-sm font-medium transition" :class="customImageSource === 'url' ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white' : 'text-gray-500'" @click="selectImageSource('url')">圖片連結</button>
              </div>

              <div class="mt-3">
                <template v-if="customImageSource === 'upload'">
                  <input ref="customImageInput" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" class="hidden" @change="handleCustomImageChange">
                  <UButton v-if="!customImagePreviewUrl" block color="gray" variant="soft" icon="i-heroicons-arrow-up-tray" @click="openImagePicker">選擇 JPG、JPEG、PNG 或 WEBP</UButton>
                </template>
                <UInput v-else :model-value="customCharacterImageUrl" placeholder="https://example.com/character.jpg" icon="i-heroicons-link" @update:model-value="handleImageUrlInput" />

                <div v-if="customImagePreviewUrl" class="mt-3 flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-800">
                  <img :src="customImagePreviewUrl" alt="自訂角色預覽" class="h-14 w-14 rounded-md object-cover" @error="removeCustomImage">
                  <span class="flex-1 text-sm text-gray-500">圖片預覽</span>
                  <UButton color="red" variant="ghost" size="sm" icon="i-heroicons-trash" @click="removeCustomImage">刪除</UButton>
                </div>
                <UButton block class="mt-3" color="primary" icon="i-heroicons-arrow-down-tray" :disabled="!customCharacterName.trim() || !hasCustomCharacterImage" @click="addCustomCharacter">
                  填入
                </UButton>
              </div>
            </div>
            <p class="mt-3 text-xs text-gray-500 dark:text-gray-400">上傳檔案與圖片連結擇一即可；請完成名稱與圖片後，再按「填入」。</p>
          </div>
        </div>
      </UCard>
    </UModal>
  </UContainer>
</template>
