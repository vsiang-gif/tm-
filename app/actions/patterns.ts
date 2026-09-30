'use server'

import { and, eq, inArray } from 'drizzle-orm'
import { headers } from 'next/headers'
import { del } from '@vercel/blob'
import { db } from '@/lib/db'
import { collectorToken, patterns } from '@/lib/db/schema'
import { getSessionUserId } from '@/lib/auth'
import { createToken, hashToken } from '@/lib/collector-token'

async function getUserId() {
  const userId = await getSessionUserId(await headers())
  if (!userId) throw new Error('Unauthorized')
  return userId
}

export async function retryPattern(id: number) {
  const userId = await getUserId()
  await db
    .update(patterns)
    .set({ status: 'pending', jobId: null, error: null, updatedAt: new Date() })
    .where(and(eq(patterns.id, id), eq(patterns.userId, userId), eq(patterns.status, 'failed')))
}

export async function retryAllFailed() {
  const userId = await getUserId()
  await db
    .update(patterns)
    .set({ status: 'pending', jobId: null, error: null, updatedAt: new Date() })
    .where(and(eq(patterns.userId, userId), eq(patterns.status, 'failed')))
}

export async function deletePatterns(ids: number[]) {
  const userId = await getUserId()
  const safeIds = ids.filter(Number.isInteger).slice(0, 500)
  if (safeIds.length === 0) return
  const removed = await db
    .delete(patterns)
    .where(and(eq(patterns.userId, userId), inArray(patterns.id, safeIds)))
    .returning({ pathname: patterns.croppedPathname })
  const pathnames = removed.map((r) => r.pathname).filter((p): p is string => Boolean(p))
  if (pathnames.length > 0) await del(pathnames)
}

export async function regenerateCollectorToken() {
  const userId = await getUserId()
  const token = createToken()
  const values = { tokenHash: hashToken(token), tokenPreview: `${token.slice(0, 8)}…${token.slice(-4)}`, createdAt: new Date() }
  await db
    .insert(collectorToken)
    .values({ userId, ...values })
    .onConflictDoUpdate({ target: collectorToken.userId, set: values })
  return token
}
