<script setup lang="ts">
import { characters } from '~/utils/characters'
import { getSeriesColor, seriesColorMap, seriesLabelMap } from '~/utils/series'

const props = defineProps<{ modelValue: Record<string, boolean>, excludedIds: string[] }>()
const emit = defineEmits<{
  'update:modelValue': [value: Record<string, boolean>]
  'update:excludedIds': [value: string[]]
}>()

const isDialogOpen = ref(false)
const activeSeries = ref<string | null>(null)
const draftExcludedIds = ref<string[]>([])
const seriesOptions = Object.entries(seriesLabelMap).map(([value, label]) => ({ value, label }))

function charactersInSeries(series: string) {
  return characters.filter(character => character.series === series).sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant'))
}

function excludedCount(series: string) {
  return charactersInSeries(series).filter(character => props.excludedIds.includes(character.id)).length
}

function draftExcludedCount(series: string) {
  return charactersInSeries(series).filter(character => draftExcludedIds.value.includes(character.id)).length
}

function updateSeries(series: string, checked: boolean) {
  emit('update:modelValue', { ...props.modelValue, [series]: checked })
}

function updateCharacter(id: string, checked: boolean) {
  const excluded = new Set(draftExcludedIds.value)
  if (checked) excluded.delete(id)
  else excluded.add(id)
  draftExcludedIds.value = [...excluded]
}

function updateAllCharacters(series: string, checked: boolean) {
  const excluded = new Set(draftExcludedIds.value)
  charactersInSeries(series).forEach(character => checked ? excluded.delete(character.id) : excluded.add(character.id))
  draftExcludedIds.value = [...excluded]
}

function openCharacterDialog(series: string) {
  activeSeries.value = series
  draftExcludedIds.value = [...props.excludedIds]
  isDialogOpen.value = true
}

function cancelCharacterDialog() {
  isDialogOpen.value = false
  activeSeries.value = null
}

function saveCharacterDialog() {
  emit('update:excludedIds', [...draftExcludedIds.value])
  cancelCharacterDialog()
}

function seriesTextColor(series: string) {
  const color = seriesColorMap[series as keyof typeof seriesColorMap]
  if (color === 'blue') return 'text-blue-500'
  if (color === 'orange') return 'text-orange-500'
  if (color === 'red') return 'text-red-500'
  if (color === 'sky') return 'text-sky-500'
  return 'text-gray-500'
}

function seriesOutlineColor(series: string) {
  const color = seriesColorMap[series as keyof typeof seriesColorMap]
  if (color === 'blue') return 'border-blue-500 dark:border-blue-400'
  if (color === 'orange') return 'border-orange-500 dark:border-orange-400'
  if (color === 'red') return 'border-red-500 dark:border-red-400'
  if (color === 'sky') return 'border-sky-500 dark:border-sky-400'
  if (color === 'gray') return 'border-gray-700 dark:border-gray-300'
  return 'border-gray-200 dark:border-gray-800'
}
</script>

<template>
  <div class="space-y-2">
    <div
      v-for="series in seriesOptions"
      :key="series.value"
      class="flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors"
      :class="modelValue[series.value] ? seriesOutlineColor(series.value) : 'border-gray-200 dark:border-gray-800'"
    >
      <UCheckbox :model-value="modelValue[series.value]" :label="series.label" :color="getSeriesColor(series.value)" @update:model-value="updateSeries(series.value, $event)" />
      <span v-if="excludedCount(series.value) > 0" class="text-xs font-semibold" :class="seriesTextColor(series.value)">-{{ excludedCount(series.value) }}</span>
      <UButton class="ml-auto" color="gray" variant="ghost" size="xs" icon="i-heroicons-adjustments-horizontal" @click="openCharacterDialog(series.value)">
      </UButton>
    </div>
  </div>

  <UModal v-model="isDialogOpen">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between gap-4">
          <div>
            <h2 class="text-lg font-bold">篩選角色</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ activeSeries ? seriesLabelMap[activeSeries as keyof typeof seriesLabelMap] : '' }}</p>
          </div>
          <span v-if="activeSeries" class="text-sm text-gray-500">已選 {{ charactersInSeries(activeSeries).length - draftExcludedCount(activeSeries) }} / {{ charactersInSeries(activeSeries).length }}</span>
        </div>
      </template>
      <div v-if="activeSeries">
        <div class="mb-3 flex justify-end gap-2">
          <UButton size="xs" color="gray" variant="ghost" @click="updateAllCharacters(activeSeries, true)">全選</UButton>
          <UButton size="xs" color="gray" variant="ghost" @click="updateAllCharacters(activeSeries, false)">全不選</UButton>
        </div>
        <div class="grid max-h-96 gap-1 overflow-y-auto sm:grid-cols-2">
          <SelectableCharacterOption v-for="character in charactersInSeries(activeSeries)" :key="character.id" :character="character" :checked="!draftExcludedIds.includes(character.id)" :color="getSeriesColor(activeSeries)" @update:checked="updateCharacter(character.id, $event)" />
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton color="gray" variant="ghost" @click="cancelCharacterDialog">取消</UButton>
          <UButton color="primary" @click="saveCharacterDialog">儲存</UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>
