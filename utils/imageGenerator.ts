import type { Character } from '~/types/character'

/**
 * 載入圖片（支援跨域和 fallback）
 */
async function loadImage(src: string): Promise<HTMLImageElement> {
  const extensions = ['.jpg', '.jpeg', '.webp', '.png']
  const basePath = src.replace(/\.(jpg|jpeg|webp|png)$/i, '')
  
  // 嘗試載入原始圖片
  const tryLoad = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = url
    })
  }
  
  // 先嘗試原始 URL
  try {
    return await tryLoad(src)
  } catch {
    // Fallback: 嘗試其他副檔名
    for (const ext of extensions) {
      try {
        return await tryLoad(basePath + ext)
      } catch {
        continue
      }
    }
    throw new Error(`Failed to load image: ${src}`)
  }
}

/**
 * 繪製圓形頭像（帶居中裁切效果，類似 object-cover）
 */
function drawCircleImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  radius: number
) {
  ctx.save()
  
  // 創建圓形裁切區域
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.closePath()
  ctx.clip()
  
  // 計算縮放比例（確保圖片填滿圓形，類似 object-cover）
  const scale = Math.max(
    (radius * 2) / img.width,
    (radius * 2) / img.height
  )
  const scaledWidth = img.width * scale
  const scaledHeight = img.height * scale
  
  // 計算居中位置
  const offsetX = x - scaledWidth / 2
  const offsetY = y - scaledHeight / 2
  
  // 繪製圖片
  ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight)
  
  ctx.restore()
}

/**
 * 繪製文字（支援對齊、最大寬度、自動省略）
 */
function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  options: {
    fontSize: number
    fontWeight: string
    color: string
    align: 'left' | 'center' | 'right'
    maxWidth?: number
  }
) {
  ctx.font = `${options.fontWeight} ${options.fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
  ctx.fillStyle = options.color
  ctx.textAlign = options.align
  ctx.textBaseline = 'middle'
  
  let finalText = text
  
  // 處理最大寬度限制
  if (options.maxWidth) {
    const metrics = ctx.measureText(text)
    if (metrics.width > options.maxWidth) {
      // 逐字減少直到符合寬度
      let truncated = text
      while (ctx.measureText(truncated + '...').width > options.maxWidth && truncated.length > 0) {
        truncated = truncated.slice(0, -1)
      }
      finalText = truncated + '...'
    }
  }
  
  ctx.fillText(finalText, x, y)
}

/**
 * 取得排名顏色（金銀銅）
 */
function getRankColor(rank: number): string {
  if (rank === 1) return '#FFD700'  // Gold
  if (rank === 2) return '#C0C0C0'  // Silver
  if (rank === 3) return '#CD7F32'  // Bronze
  return '#6B7280'  // Gray
}

/**
 * 繪製系列標籤（圓角矩形背景 + 文字）
 */
function drawSeriesBadge(
  ctx: CanvasRenderingContext2D,
  series: string,
  x: number,
  y: number,
  fontSize: number = 24,
  align: 'left' | 'center' = 'center'
) {
  const labels: Record<string, { text: string; bg: string; color: string }> = {
    WindBreaker: { text: '防風少年', bg: '#DBEAFE', color: '#1E40AF' },
    Haikyu: { text: '排球少年', bg: '#FED7AA', color: '#C2410C' },
    MHA: { text: '我的英雄學院', bg: '#FECACA', color: '#B91C1C' }
  }
  
  const badge = labels[series]
  if (!badge) return
  
  // 設定字體以測量文字寬度（使用動態 fontSize）
  ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
  const textWidth = ctx.measureText(badge.text).width
  
  const padding = 16
  const height = fontSize + 12
  const width = textWidth + padding * 2
  
  // 根據對齊方式調整 X 座標
  let badgeX = x
  if (align === 'left') {
    badgeX = x + width / 2  // 如果是靠左對齊，badge 中心要右移
  }
  
  // 繪製圓角矩形背景
  ctx.fillStyle = badge.bg
  ctx.beginPath()
  ctx.roundRect(badgeX - width / 2, y - height / 2, width, height, 10)
  ctx.fill()
  
  // 繪製文字
  drawText(ctx, badge.text, badgeX, y, {
    fontSize: fontSize,
    fontWeight: 'bold',
    color: badge.color,
    align: 'center'
  })
}

/**
 * 主函數：生成 Top 10 排名圖片（1600x1600px, 1:1）
 * 佈局：3x3 + 1 特殊（第一名放大在上方）
 */
export async function generateTop10Image(characters: Character[]): Promise<Blob> {
  // 創建畫布
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }
  
  // 設定畫布大小（1:1 正方形，1600x1600 高解析度）
  canvas.width = 1600
  canvas.height = 1600
  
  // 1. 繪製白色背景
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, 1600, 1600)
  
  // 2. 繪製右上角「Top 10」標記
  drawText(ctx, 'Top 10', 1520, 60, {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#9CA3AF',
    align: 'right'
  })
  
  // 3. 繪製第一名（橫式佈局，水平置中）
  const first = characters[0]
  if (first) {
    try {
      const firstImg = await loadImage(first.image)
      
      // 測量 #1 文字寬度以計算精確佈局
      ctx.font = 'bold 54px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      const rankWidth = ctx.measureText('#1').width
      
      // 測量名字寬度
      ctx.font = 'bold 48px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      const nameWidth = Math.min(ctx.measureText(first.name).width, 500)
      
      // 計算總寬度（#1 + 間距 + 頭像 + 間距 + 文字區域）
      const spacing = 60
      const avatarDiameter = 250  // 半徑 125px
      const textAreaWidth = 500
      const totalWidth = rankWidth + spacing + avatarDiameter + spacing + textAreaWidth
      
      // 計算起始 X 座標（水平置中）
      const startX = 800 - totalWidth / 2
      
      // 各元素的 X 座標
      const rankX = startX + rankWidth / 2
      const avatarX = startX + rankWidth + spacing + 125
      const textStartX = avatarX + 125 + spacing
      
      // 垂直中心線
      const baseY = 200
      
      // 1. 金色 #1 排名
      drawText(ctx, '#1', rankX, baseY, {
        fontSize: 54,
        fontWeight: 'bold',
        color: '#FFD700',
        align: 'center'
      })
      
      // 2. 大頭像（半徑 125px）
      drawCircleImage(ctx, firstImg, avatarX, baseY, 125)
      
      // 3. 名字（靠左對齊）
      drawText(ctx, first.name, textStartX, baseY - 25, {
        fontSize: 56,
        fontWeight: 'bold',
        color: '#1F2937',
        align: 'left',
        maxWidth: 500
      })
      
      // 4. 系列標籤（靠左對齊）
      drawSeriesBadge(ctx, first.series, textStartX, baseY + 30, 24, 'left')
    } catch (error) {
      console.error('Failed to load first place image:', error)
    }
  } 
  
  // 4. 繪製第 2-10 名（3x3 網格，緊湊佈局）
  const gridStartY = 400
  const gap = 50
  const gridItems = characters.slice(1, 10) // 第 2-10 名
  
  // 計算可用空間和 cell 尺寸
  const availableWidth = 1600 - gap * 2 - 200 // 預留左右邊距和一些額外空間
  const availableHeight = 1600 - gridStartY - gap * 2 - 100
  const cellWidth = availableWidth / 3 // 493.33px
  const cellHeight = availableHeight / 3  // 400px
  
  for (let i = 0; i < gridItems.length; i++) {
    const char = gridItems[i]
    const rank = i + 2
    const col = i % 3
    const row = Math.floor(i / 3)
    
    // 計算 cell 中心座標（考慮 gap）
    const centerX = gap + cellWidth / 2 + col * (cellWidth + gap) + 30 // 預留左側空間
    const centerY = gridStartY + gap + cellHeight / 2 + row * (cellHeight + gap)
    
    try {
      // 1. 排名（在頭像上方，帶顏色）
      const color = getRankColor(rank)
      const rankText = `#${rank}`
      drawText(ctx, rankText, centerX, centerY - 220, {
        fontSize: 36,
        fontWeight: 'bold',
        color,
        align: 'center'
      })
      
      // 2. 載入並繪製頭像（半徑 100px）
      const img = await loadImage(char.image)
      drawCircleImage(ctx, img, centerX, centerY - 100, 100)
      
      // 3. 名字
      drawText(ctx, char.name, centerX, centerY + 50, {
        fontSize: 32,
        fontWeight: '600',
        color: '#374151',
        align: 'center',
        maxWidth: cellWidth - 60
      })
      
      // 4. 系列標籤
      drawSeriesBadge(ctx, char.series, centerX, centerY + 95, 24, 'center')
    } catch (error) {
      console.error(`Failed to load image for ${char.name}:`, error)
    }
  }
  
  // 5. 轉換為 Blob（PNG 格式，最高品質）
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('Failed to generate blob'))
      }
    }, 'image/png', 1.0)
  })
}
