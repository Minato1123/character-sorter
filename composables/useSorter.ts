import type { Character } from '~/types/character'

// Global state for the sorter logic (Singleton pattern within the module)
// This ensures that the promise resolver created in startSorting() remains accessible
// when the user navigates to the battle page and triggers selectWinner().
let resolveSelection: ((winner: Character) => void) | null = null
let comparisonCount = 0
let totalEstimatedComparisons = 0

// Helper to simulate merge sort and count required comparisons
const countComparisons = (arr: Character[]): number => {
  if (arr.length <= 1) return 0
  
  const mid = Math.floor(arr.length / 2)
  const left = arr.slice(0, mid)
  const right = arr.slice(mid)
  
  // Recursively count comparisons in sub-arrays
  let count = countComparisons(left) + countComparisons(right)
  
  // Count comparisons needed for this merge step
  // In a merge of size N+M, we do at most N+M-1 comparisons
  // We approximate using the worst case for consistent progress bar behavior: left.length + right.length - 1
  count += (left.length + right.length - 1)
  
  return count
}

export const useSorter = () => {
  const currentPair = useState<[Character, Character] | null>('sorter-pair', () => null)
  const sortedList = useState<Character[]>('sorter-results', () => [])
  const isFinished = useState<boolean>('sorter-finished', () => false)
  const progress = useState<number>('sorter-progress', () => 0)

  const userChoose = (a: Character, b: Character): Promise<Character> => {
    currentPair.value = [a, b]
    return new Promise((resolve) => {
      resolveSelection = resolve
    })
  }

  const selectWinner = (winner: Character) => {
    if (resolveSelection) {
      resolveSelection(winner)
      resolveSelection = null
      currentPair.value = null
      
      // Update progress
      comparisonCount++
      if (totalEstimatedComparisons > 0) {
        progress.value = Math.min(Math.round((comparisonCount / totalEstimatedComparisons) * 100), 99)
      }
    }
  }

  const merge = async (left: Character[], right: Character[]): Promise<Character[]> => {
    const result: Character[] = []
    let i = 0
    let j = 0

    while (i < left.length && j < right.length) {
      const winner = await userChoose(left[i], right[j])
      if (winner.id === left[i].id) {
        result.push(left[i])
        i++
      }
      else {
        result.push(right[j])
        j++
      }
    }

    return result.concat(left.slice(i)).concat(right.slice(j))
  }

  const mergeSort = async (arr: Character[]): Promise<Character[]> => {
    if (arr.length <= 1)
      return arr

    const mid = Math.floor(arr.length / 2)
    const left = await mergeSort(arr.slice(0, mid))
    const right = await mergeSort(arr.slice(mid))

    return await merge(left, right)
  }

  const startSorting = async (list: Character[]) => {
    // Reset state
    isFinished.value = false
    sortedList.value = []
    progress.value = 0
    comparisonCount = 0
    // N log N approximation
    // totalEstimatedComparisons = list.length * Math.log2(list.length)

    // Deep copy to avoid mutating original source
    // Implement Stratified/Interleaved Shuffle to prevent consecutive series
    const groups: Record<string, Character[]> = {}
    list.forEach(c => {
      if (!groups[c.series]) groups[c.series] = []
      groups[c.series].push(c)
    })

    // 1. Shuffle each group internally
    Object.values(groups).forEach(group => {
      for (let i = group.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [group[i], group[j]] = [group[j], group[i]]
      }
    })

    // 2. Interleave groups
    const interleaved: Character[] = []
    const seriesKeys = Object.keys(groups)
    // Randomize the order of series themselves initially
    for (let i = seriesKeys.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [seriesKeys[i], seriesKeys[j]] = [seriesKeys[j], seriesKeys[i]]
    }

    let hasMore = true
    while (hasMore) {
      hasMore = false
      for (const key of seriesKeys) {
        if (groups[key].length > 0) {
          interleaved.push(groups[key].pop()!)
          hasMore = true
        }
      }
    }

    // Calculate exact comparisons needed for this specific order
    // Note: Since we don't know the exact winners, we use the worst-case scenario
    // for merge sort which is (N log N) - N + 1 comparisons
    // But since our recursive structure is fixed, we can just sum (left.length + right.length - 1) for each merge
    totalEstimatedComparisons = countComparisons(interleaved)
    
    // Sort
    const result = await mergeSort(interleaved)
    
    sortedList.value = result
    isFinished.value = true
    progress.value = 100
  }

  return {
    currentPair,
    sortedList,
    isFinished,
    progress,
    startSorting,
    selectWinner
  }
}
