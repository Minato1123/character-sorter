import type { Character } from '~/types/character'

type Series = Character['series']

export const seriesLabelMap: Record<Series, string> = {
  WindBreaker: '防風少年',
  Haikyu: '排球少年',
  MHA: '我的英雄學院',
  MP100: '路人超能100',
  BB: '失憶投捕',
  KNY: '鬼滅之刃'
}

export const seriesColorMap: Record<Series, string> = {
  WindBreaker: 'blue',
  Haikyu: 'orange',
  MHA: 'red',
  MP100: 'gray',
  BB: 'sky',
  KNY: 'green'
}

export function getSeriesLabel(series: string) {
  return seriesLabelMap[series as Series] || series
}

export function getSeriesColor(series: string) {
  return seriesColorMap[series as Series] || 'gray'
}
