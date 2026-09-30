import { createHash, randomBytes } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { collectorToken } from '@/lib/db/schema'

export function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export function createToken() {
  return `tpc_${randomBytes(24).toString('base64url')}`
}

export async function findUserIdByToken(token: string | null | undefined) {
  if (!token || !token.startsWith('tpc_') || token.length > 80) return null
  const [row] = await db
    .select({ userId: collectorToken.userId })
    .from(collectorToken)
    .where(eq(collectorToken.tokenHash, hashToken(token)))
    .limit(1)
  return row?.userId ?? null
}
