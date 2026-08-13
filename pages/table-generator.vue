<script setup lang="ts">
import html2canvas from 'html2canvas'
import type { Character } from '~/types/character'
import { characters } from '~/utils/characters'
import { getSeriesLabel } from '~/utils/series'

const categories = [
  '本命', '初戀', '最佳人設', '最佳性格', '最強戰力',
  '最強智商', '最想結婚', '最想做朋友', '最想做家人', '最想談戀愛',
  '意難平', '心理陰影', '一生之敵', '無法理解', '也就是臉好看'
]

const tableTitle = ref('我的動漫角色喜好表')
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

const tableTypeOptions = [
  { label: '經典角色喜好表（5 × 3）', value: 'classic' }
]
const selectedTableType = ref('classic')
const customImagePreviewUrl = computed(() => customImageSource.value === 'upload' ? customUploadPreviewUrl.value : customCharacterImageUrl.value.trim())
const hasCustomCharacterImage = computed(() => Boolean(customImagePreviewUrl.value))

const filteredCharacters = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  const availableCharacters = [...characters, ...customCharacters.value]
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
  selections.value[activeCell.value] = character
  closePicker()
}

function clearCell() {
  if (activeCell.value === null) return
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
    series: 'MHA',
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
    const canvas = await html2canvas(tableRef.value, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      width: tableRef.value.offsetWidth,
      height: tableRef.value.offsetHeight,
      windowWidth: tableRef.value.offsetWidth,
      windowHeight: tableRef.value.offsetHeight
    })
    const link = document.createElement('a')
    link.download = `${tableTitle.value || '動漫角色喜好表'}_${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
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
      <div class="grid w-full gap-3 sm:max-w-xl sm:grid-cols-2">
        <UFormGroup label="表格標題">
          <UInput v-model="tableTitle" placeholder="輸入表格標題" />
        </UFormGroup>
        <UFormGroup label="表格類型">
          <USelect v-model="selectedTableType" :options="tableTypeOptions" />
        </UFormGroup>
      </div>
      <!-- <UButton icon="i-heroicons-arrow-down-tray" color="amber" :loading="isExporting" @click="exportTable">
        下載圖片
      </UButton> -->
    </div>
    <div class="overflow-hidden pb-4">
      <div class="overflow-x-auto">
        <div ref="tableRef" class="mx-auto w-[1000px] bg-white p-7 text-gray-900">
          <h2 class="mb-6 border-b-2 border-gray-100 pb-4 text-center text-3xl font-extrabold text-gray-700">
            {{ tableTitle || '我的動漫角色喜好表' }}
          </h2>
          <div class="grid grid-cols-5">
            <CharacterTableCell
              v-for="(label, index) in categories"
              :key="label"
              :label="label"
              :character="selections[index]"
              @select="openPicker(index)"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
      已填寫 {{ Object.keys(selections).length }} / {{ categories.length }} 格
    </div>

    <UModal v-model="isPickerOpen">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between gap-4">
            <div>
              <h2 class="text-lg font-bold">選擇角色</h2>
              <p v-if="activeCell !== null" class="text-sm text-gray-500 dark:text-gray-400">要填入「{{ categories[activeCell] }}」的角色</p>
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
