// Composable to handle image loading failures and try different extensions
export const useImageFallback = (getSource: () => string) => {
  const extensions = ['.jpg', '.jpeg', '.webp', '.png']
  const currentIndex = ref(0)
  const imageError = ref(false)
  const currentSrc = ref(getSource())
  
  // Extract the base path without extension
  const getBasePath = (src: string) => src.replace(/\.(jpg|jpeg|webp|png)$/i, '')

  const handleImageError = () => {
    const basePath = getBasePath(getSource())
    // If we haven't tried all extensions yet
    if (currentIndex.value < extensions.length) {
      // Construct new path with next extension
      // We start trying from index 0 which is .jpg
      
      const nextExt = extensions[currentIndex.value]
      const nextSrc = `${basePath}${nextExt}`
      
      // If the generated source is same as current (failed) one, skip to next
      if (nextSrc === currentSrc.value) {
        currentIndex.value++
        if (currentIndex.value < extensions.length) {
            currentSrc.value = `${basePath}${extensions[currentIndex.value]}`
        } else {
            imageError.value = true
        }
      } else {
        currentSrc.value = nextSrc
        currentIndex.value++
      }
    } else {
      imageError.value = true
    }
  }

  // Watch for source changes (when props change)
  watch(getSource, (newSrc) => {
    currentSrc.value = newSrc
    currentIndex.value = 0
    imageError.value = false
  })

  return {
    currentSrc,
    imageError,
    handleImageError
  }
}
