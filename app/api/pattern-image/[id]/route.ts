import { NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { get } from '@vercel/blob'
import { db } from '@/lib/db'
import { patterns } from '@/lib/db/schema'
import { getSessionUserId } from '@/lib/auth'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId(request.headers)
  if (!userId) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const id = Number((await params).id)
  if (!Number.isInteger(id)) return new NextResponse('Not found', { status: 404 })

  const [row] = await db
    .select({ pathname: patterns.croppedPathname, goodsId: patterns.goodsId })
    .from(patterns)
    .where(and(eq(patterns.id, id), eq(patterns.userId, userId)))
    .limit(1)
  if (!row?.pathname) return new NextResponse('Not found', { status: 404 })

  const result = await get(row.pathname, {
    access: 'private',
    ifNoneMatch: request.headers.get('if-none-match') ?? undefined,
  })
  if (!result) return new NextResponse('Not found', { status: 404 })

  if (result.statusCode === 304) {
    return new NextResponse(null, {
      status: 304,
      headers: { ETag: result.blob.etag, 'Cache-Control': 'private, no-cache' },
    })
  }

  const download = new URL(request.url).searchParams.has('download')
  const ext = row.pathname.split('.').pop() ?? 'png'
  return new NextResponse(result.stream, {
    headers: {
      'Content-Type': result.blob.contentType,
      ETag: result.blob.etag,
      'Cache-Control': 'private, no-cache',
      ...(download ? { 'Content-Disposition': `attachment; filename="pattern-${row.goodsId}.${ext}"` } : {}),
    },
  })
}
