import { after, type NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { patterns } from '@/lib/db/schema'
import { findUserIdByToken } from '@/lib/collector-token'
import { isTemuImageUrl, isTemuPageUrl } from '@/lib/origin'
import { submitPending } from '@/lib/patterns-service'

const MAX_ITEMS = 100

type IncomingItem = {
  goodsId: string
  title: string
  productUrl: string
  imageUrl: string
  salesText: string
  salesCount: number
}

function parseItem(raw: unknown): IncomingItem | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const goodsId = typeof r.goodsId === 'string' ? r.goodsId : ''
  const imageUrl = typeof r.imageUrl === 'string' ? r.imageUrl : ''
  const productUrl = typeof r.productUrl === 'string' ? r.productUrl : ''
  const salesCount = typeof r.salesCount === 'number' ? Math.floor(r.salesCount) : NaN
  if (!/^\d{6,30}$/.test(goodsId)) return null
  if (!isTemuImageUrl(imageUrl) || imageUrl.length > 500) return null
  if (!isTemuPageUrl(productUrl) || productUrl.length > 500) return null
  if (!Number.isFinite(salesCount) || salesCount < 0 || salesCount > 1e9) return null
  return {
    goodsId,
    imageUrl,
    productUrl,
    salesCount,
    title: (typeof r.title === 'string' ? r.title : 'Temu 商品').slice(0, 300),
    salesText: (typeof r.salesText === 'string' ? r.salesText : String(salesCount)).slice(0, 60),
  }
}

export async function POST(request: NextRequest) {
  const userId = await findUserIdByToken(request.headers.get('x-collector-token'))
  if (!userId) {
    return NextResponse.json({ error: '采集密钥无效，请在采集台重新安装脚本' }, { status: 401 })
  }

  let body: { keyword?: unknown; items?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 })
  }

  if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > MAX_ITEMS) {
    return NextResponse.json({ error: `每次需提交 1-${MAX_ITEMS} 个商品` }, { status: 400 })
  }

  const keyword = typeof body.keyword === 'string' ? body.keyword.slice(0, 100) : null
  const items = body.items.map(parseItem).filter((x): x is IncomingItem => x !== null)
  if (items.length === 0) {
    return NextResponse.json({ received: body.items.length, inserted: 0 })
  }

  const inserted = await db
    .insert(patterns)
    .values(items.map((item) => ({ ...item, userId, keyword })))
    .onConflictDoNothing({ target: [patterns.userId, patterns.goodsId] })
    .returning({ id: patterns.id })

  if (inserted.length > 0) {
    after(() => submitPending(userId))
  }

  return NextResponse.json({ received: body.items.length, inserted: inserted.length })
}
