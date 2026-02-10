<script setup lang="ts">
const { currentPair, selectWinner, isFinished, progress } = useSorter()

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

const handleSelect = (winner: any) => {
  selectWinner(winner)
}
</script>

<template>
  <UContainer class="min-h-screen flex flex-col py-10">
    <div class="mb-8">
      <UProgress :value="progress" color="primary" indicator />
    </div>

    <div v-if="currentPair" class="flex-1 flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
      <!-- Left Character -->
      <div class="w-full max-w-sm transform transition hover:scale-102">
        <CharacterCard
          :character="currentPair[0]"
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
          @click="handleSelect(currentPair[1])"
        />
      </div>
    </div>
    
    <div v-else class="flex-1 flex items-center justify-center">
      <UIcon name="i-heroicons-arrow-path" class="w-12 h-12 animate-spin text-primary-500" />
    </div>
  </UContainer>
</template>
