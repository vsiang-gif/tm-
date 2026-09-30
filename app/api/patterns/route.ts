import { NextResponse } from 'next/server'
import { desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { patterns } from '@/lib/db/schema'
import { getSessionUserId } from '@/lib/auth'
import { isLingtuConfigured } from '@/lib/lingtu'
import { refreshCropping, submitPending } from '@/lib/patterns-service'
import type { PatternsResponse } from '@/lib/types'

export async function GET(request: Request) {
  const userId = await getSessionUserId(request.headers)
  if (!userId) return NextResponse.json({ error: '未登录' }, { status: 401 })

  await refreshCropping(userId)
  await submitPending(userId)

  const rows = await db
    .select()
    .from(patterns)
    .where(eq(patterns.userId, userId))
    .orderBy(desc(patterns.salesCount), desc(patterns.createdAt))
    .limit(600)

  const counts = { total: rows.length, pending: 0, cropping: 0, done: 0, failed: 0 }
  for (const row of rows) counts[row.status] += 1

  const payload: PatternsResponse = {
    lingtuConfigured: isLingtuConfigured(),
    counts,
    items: rows.map((row) => ({
      id: row.id,
      title: row.title,
      productUrl: row.productUrl,
      imageUrl: row.imageUrl,
      salesText: row.salesText,
      salesCount: row.salesCount,
      keyword: row.keyword,
      status: row.status,
      error: row.error,
      croppedSrc: row.croppedPathname
        ? `/api/pattern-image/${row.id}?v=${row.updatedAt.getTime()}`
        : null,
      createdAt: row.createdAt.toISOString(),
    })),
  }

  return NextResponse.json(payload, { headers: { 'Cache-Control': 'no-store' } })
}
