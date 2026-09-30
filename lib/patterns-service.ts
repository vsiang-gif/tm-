import { and, asc, eq } from 'drizzle-orm'
import { put } from '@vercel/blob'
import { db } from '@/lib/db'
import { patterns, type Pattern } from '@/lib/db/schema'
import { getJobResult, isLingtuConfigured, submitDetect } from '@/lib/lingtu'
import { getAppOrigin } from '@/lib/origin'

// 灵图 image 参数最大长度为 100，超出时改用本站短链中转原图
const LINGTU_IMAGE_URL_MAX = 100
const BATCH_SIZE = 8

function errorMessage(e: unknown) {
  return e instanceof Error ? e.message.slice(0, 300) : '未知错误'
}

function sourceImageFor(row: Pattern) {
  return row.imageUrl.length <= LINGTU_IMAGE_URL_MAX
    ? row.imageUrl
    : `${getAppOrigin()}/api/src/${row.id}`
}

export async function submitPending(userId: string) {
  if (!isLingtuConfigured()) return
  const rows = await db
    .select()
    .from(patterns)
    .where(and(eq(patterns.userId, userId), eq(patterns.status, 'pending')))
    .orderBy(asc(patterns.id))
    .limit(BATCH_SIZE)

  await Promise.all(
    rows.map(async (row) => {
      const attempt = row.attempts + 1
      try {
        const jobId = await submitDetect({
          requestId: `temu-pattern-${row.id}-${attempt}`,
          image: sourceImageFor(row),
        })
        await db
          .update(patterns)
          .set({ status: 'cropping', jobId, attempts: attempt, error: null, updatedAt: new Date() })
          .where(and(eq(patterns.id, row.id), eq(patterns.userId, userId)))
      } catch (e) {
        await db
          .update(patterns)
          .set({ status: 'failed', attempts: attempt, error: errorMessage(e), updatedAt: new Date() })
          .where(and(eq(patterns.id, row.id), eq(patterns.userId, userId)))
      }
    }),
  )
}

async function storeResult(row: Pattern, url: string, format?: string) {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`下载裁剪结果失败（HTTP ${res.status}）`)
  const contentType = res.headers.get('content-type') ?? 'image/png'
  const ext = (format ?? contentType.split('/')[1] ?? 'png').replace(/[^a-z0-9]/gi, '').toLowerCase() || 'png'
  const blob = await put(`patterns/${row.userId}/${row.id}.${ext}`, await res.arrayBuffer(), {
    access: 'private',
    contentType,
    addRandomSuffix: false,
    allowOverwrite: true,
  })
  return blob.pathname
}

export async function refreshCropping(userId: string) {
  if (!isLingtuConfigured()) return
  const rows = await db
    .select()
    .from(patterns)
    .where(and(eq(patterns.userId, userId), eq(patterns.status, 'cropping')))
    .orderBy(asc(patterns.updatedAt))
    .limit(BATCH_SIZE)

  await Promise.all(
    rows.map(async (row) => {
      if (!row.jobId) return
      const scope = and(eq(patterns.id, row.id), eq(patterns.userId, userId))
      try {
        const result = await getJobResult(row.jobId)
        if (result.status === 'succeed') {
          const url = result.urls?.[0]
          if (!url) throw new Error('灵图返回成功但没有结果图片')
          const pathname = await storeResult(row, url, result.formats?.[0])
          await db
            .update(patterns)
            .set({ status: 'done', croppedPathname: pathname, error: null, updatedAt: new Date() })
            .where(scope)
        } else if (result.status === 'failed' || result.status === 'canceled') {
          await db
            .update(patterns)
            .set({
              status: 'failed',
              error: result.message || (result.status === 'canceled' ? '任务已取消' : '灵图裁剪失败'),
              updatedAt: new Date(),
            })
            .where(scope)
        } else {
          await db.update(patterns).set({ updatedAt: new Date() }).where(scope)
        }
      } catch (e) {
        await db
          .update(patterns)
          .set({ status: 'failed', error: errorMessage(e), updatedAt: new Date() })
          .where(scope)
      }
    }),
  )
}
