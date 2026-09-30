import type { PatternStatus } from '@/lib/db/schema'

export type PatternItem = {
  id: number
  title: string
  productUrl: string
  imageUrl: string
  salesText: string
  salesCount: number
  keyword: string | null
  status: PatternStatus
  error: string | null
  croppedSrc: string | null
  createdAt: string
}

export type PatternsResponse = {
  lingtuConfigured: boolean
  counts: Record<PatternStatus | 'total', number>
  items: PatternItem[]
}
