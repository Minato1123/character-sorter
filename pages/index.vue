<script setup lang="ts">
import { characters } from '~/utils/characters'
import { useSorter } from '~/composables/useSorter'

const { startSorting } = useSorter()

function handleStart() {
  startSorting(characters)
  navigateTo({ name: 'battle' })
}
</script>

<template>
  <UContainer class="min-h-screen flex flex-col items-center justify-center py-10">
    <h1 class="text-4xl sm:text-6xl font-extrabold text-primary-500 mb-6 text-center">
      動漫角色二選一
    </h1>

    <p class="text-xl text-gray-500 dark:text-gray-400 mb-10 text-center max-w-2xl">
      找出你心目中的 Top 10 角色！系統將會一次顯示兩名角色，
      請點擊你比較喜歡的那一位。
    </p>

    <UButton
      size="xl"
      icon="i-heroicons-play-circle"
      @click="handleStart"
    >
      開始排序
    </UButton>

    <div class="mt-12 text-sm text-gray-400">
      包含作品：防風少年 (Wind Breaker), 排球少年 (Haikyu!!), 我的英雄學院 (My Hero Academia)
    </div>
  </UContainer>
</template>
