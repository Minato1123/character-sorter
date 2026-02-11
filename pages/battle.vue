<script setup lang="ts">
const { currentPair, selectWinner, isFinished, progress, remainingComparisons } = useSorter()

// 動畫控制
const isTransitioning = ref(false)
const pairKey = ref(0)

// Redirect if no pair and not finished (e.g. refresh)
onMounted(() => {
  if (!currentPair.value && !isFinished.value) {
    navigateTo({ name: 'index' })
  }
})

// Watch finish state
watch(isFinished, (val) => {
  if (val) {
    navigateTo({ name: 'results' })
  }
})

const handleSelect = async (winner: any) => {
  if (isTransitioning.value) return  // 防止連點
  
  isTransitioning.value = true
  
  // 1. 先觸發 leave 動畫（改變 key）
  pairKey.value++
  
  // 2. 短暫延遲後執行選擇（讓 leave 動畫開始，避免閃爍）
  await new Promise(resolve => setTimeout(resolve, 50))
  selectWinner(winner)
  
  // 3. 等待 merge sort 生成下一對 + 動畫完成
  await new Promise(resolve => setTimeout(resolve, 500))
  
  isTransitioning.value = false
}
</script>

<template>
  <UContainer class="min-h-screen flex flex-col py-10">
    <div class="mb-8">
      <!-- 剩餘次數（新增） -->
      <p class="text-center text-sm text-gray-500 dark:text-gray-400 mb-2">
        還需最多 <span class="font-semibold text-primary-500">{{ remainingComparisons }}</span> 次對決
      </p>
      
      <!-- 進度條 -->
      <UProgress :value="progress" color="primary" indicator />
    </div>

    <!-- 對決區域（加入 key 強制重渲染和過渡效果） -->
    <Transition name="slide-fade" mode="out-in">
      <div 
        v-if="currentPair" 
        :key="pairKey"
        class="flex-1 flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16"
      >
        <!-- Left Character -->
        <div class="w-full max-w-sm transform transition hover:scale-102">
          <CharacterCard
            :character="currentPair[0]"
            :class="{ 'pointer-events-none opacity-70': isTransitioning }"
            @click="handleSelect(currentPair[0])"
          />
        </div>

        <div class="text-2xl font-bold text-gray-300">
          VS
        </div>

        <!-- Right Character -->
        <div class="w-full max-w-sm transform transition hover:scale-102">
          <CharacterCard
            :character="currentPair[1]"
            :class="{ 'pointer-events-none opacity-70': isTransitioning }"
            @click="handleSelect(currentPair[1])"
          />
        </div>
      </div>
    </Transition>
    
    <div v-if="!currentPair && !isFinished" class="flex-1 flex items-center justify-center">
      <UIcon name="i-heroicons-arrow-path" class="w-12 h-12 animate-spin text-primary-500" />
    </div>
  </UContainer>
</template>

<style scoped>
/* 滑動淡出淡入效果 */
.slide-fade-enter-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>
