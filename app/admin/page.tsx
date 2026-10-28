import type { Metadata } from 'next'
import { count, desc, eq } from 'drizzle-orm'
import { isAdmin } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { licenseDevices, licenses } from '@/lib/db/schema'
import { LoginForm } from '@/components/admin/login-form'
import { CreateLicenseForm } from '@/components/admin/create-license-form'
import { LicenseTable } from '@/components/admin/license-table'
import { logout } from './actions'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: '密钥管理 · 爆款图案采集器',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  if (!(await isAdmin())) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-4">
        <LoginForm configured={Boolean(process.env.ADMIN_PASSWORD)} />
      </main>
    )
  }

  const rows = await db
    .select({
      id: licenses.id,
      key: licenses.key,
      holder: licenses.holder,
      note: licenses.note,
      status: licenses.status,
      maxDevices: licenses.maxDevices,
      expiresAt: licenses.expiresAt,
      lastSeenAt: licenses.lastSeenAt,
      createdAt: licenses.createdAt,
      devices: count(licenseDevices.id),
    })
    .from(licenses)
    .leftJoin(licenseDevices, eq(licenseDevices.licenseId, licenses.id))
    .groupBy(licenses.id)
    .orderBy(desc(licenses.createdAt))

  const active = rows.filter((r) => r.status === 'active').length

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 md:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b pb-6">
        <div className="flex flex-col gap-1">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">License Console</p>
          <h1 className="text-2xl font-semibold text-balance">采集器密钥管理</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {'共 '}
            {rows.length}
            {' 个密钥，'}
            {active}
            {' 个启用中。停用后对方的采集器会在 10 分钟内自动退出。'}
          </p>
        </div>
        <form action={logout}>
          <Button type="submit" variant="outline">
            退出登录
          </Button>
        </form>
      </header>

      <CreateLicenseForm />
      <LicenseTable rows={rows.map((r) => ({ ...r, devices: Number(r.devices) }))} />
    </main>
  )
}
