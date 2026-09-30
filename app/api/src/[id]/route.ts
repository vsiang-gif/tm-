import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { patterns } from '@/lib/db/schema'
import { isTemuImageUrl } from '@/lib/origin'

// Public short link to the original Temu product image, used only when the
// Temu URL exceeds 灵图's 100-character limit for the `image` parameter.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id)
  if (!Number.isInteger(id)) return new NextResponse('Not found', { status: 404 })

  const [row] = await db
    .select({ imageUrl: patterns.imageUrl, status: patterns.status })
    .from(patterns)
    .where(eq(patterns.id, id))
    .limit(1)
  if (!row || row.status === 'done' || !isTemuImageUrl(row.imageUrl)) {
    return new NextResponse('Not found', { status: 404 })
  }

  const upstream = await fetch(row.imageUrl, { cache: 'no-store' })
  if (!upstream.ok || !upstream.body) return new NextResponse('Upstream error', { status: 502 })

  return new NextResponse(upstream.body, {
    headers: {
      'Content-Type': upstream.headers.get('content-type') ?? 'image/jpeg',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
