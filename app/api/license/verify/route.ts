import { and, count, eq, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { licenseDevices, licenses } from '@/lib/db/schema'

export const dynamic = 'force-dynamic'

type Reason = 'invalid' | 'revoked' | 'expired' | 'device_limit' | 'bad_request'

function deny(reason: Reason, status = 403) {
  return Response.json({ ok: false, reason }, { status })
}

export async function POST(req: Request) {
  let body: { key?: unknown; machineId?: unknown }
  try {
    body = await req.json()
  } catch {
    return deny('bad_request', 400)
  }
  const key = typeof body.key === 'string' ? body.key.trim() : ''
  const machineId = typeof body.machineId === 'string' ? body.machineId.trim() : ''
  if (!key || key.length > 64 || !/^[a-f0-9]{32,128}$/i.test(machineId)) return deny('bad_request', 400)

  const [license] = await db.select().from(licenses).where(eq(licenses.key, key)).limit(1)
  if (!license) return deny('invalid')
  if (license.status !== 'active') return deny('revoked')
  if (license.expiresAt && license.expiresAt.getTime() < Date.now()) return deny('expired')

  const [known] = await db
    .select({ id: licenseDevices.id })
    .from(licenseDevices)
    .where(and(eq(licenseDevices.licenseId, license.id), eq(licenseDevices.machineId, machineId)))
    .limit(1)

  if (known) {
    await db.update(licenseDevices).set({ lastSeenAt: sql`now()` }).where(eq(licenseDevices.id, known.id))
  } else {
    const [{ n }] = await db
      .select({ n: count() })
      .from(licenseDevices)
      .where(eq(licenseDevices.licenseId, license.id))
    if (n >= license.maxDevices) return deny('device_limit')
    await db.insert(licenseDevices).values({ licenseId: license.id, machineId }).onConflictDoNothing()
  }

  await db.update(licenses).set({ lastSeenAt: sql`now()` }).where(eq(licenses.id, license.id))

  return Response.json({
    ok: true,
    holder: license.holder,
    expiresAt: license.expiresAt?.toISOString() ?? null,
  })
}
