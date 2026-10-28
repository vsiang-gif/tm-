import { deleteLicense, resetDevices, toggleLicense } from '@/app/admin/actions'
import { Button } from '@/components/ui/button'

type Row = {
  id: number
  key: string
  holder: string
  note: string
  status: string
  maxDevices: number
  devices: number
  expiresAt: Date | null
  lastSeenAt: Date | null
  createdAt: Date
}

const fmt = new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})

function statusOf(r: Row) {
  if (r.status !== 'active') return { label: '已停用', cls: 'bg-muted text-muted-foreground' }
  if (r.expiresAt && r.expiresAt.getTime() < Date.now()) return { label: '已过期', cls: 'bg-muted text-destructive' }
  return { label: '启用中', cls: 'bg-primary text-primary-foreground' }
}

export function LicenseTable({ rows }: { rows: Row[] }) {
  if (rows.length === 0) {
    return <p className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">还没有密钥，先在上面生成一个。</p>
  }

  return (
    <section aria-label="密钥列表" className="overflow-x-auto rounded-lg border bg-card">
      <table className="w-full min-w-[860px] text-sm">
        <thead className="border-b text-left text-xs text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">使用人</th>
            <th className="px-4 py-3 font-medium">密钥</th>
            <th className="px-4 py-3 font-medium">状态</th>
            <th className="px-4 py-3 font-medium">电脑</th>
            <th className="px-4 py-3 font-medium">到期</th>
            <th className="px-4 py-3 font-medium">最近使用</th>
            <th className="px-4 py-3 text-right font-medium">操作</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const s = statusOf(r)
            const active = r.status === 'active'
            return (
              <tr key={r.id} className="border-b last:border-b-0">
                <td className="px-4 py-3">
                  <div className="font-medium">{r.holder}</div>
                  {r.note && <div className="text-xs text-muted-foreground">{r.note}</div>}
                </td>
                <td className="px-4 py-3 font-mono">{r.key}</td>
                <td className="px-4 py-3">
                  <span className={`rounded px-2 py-0.5 text-xs ${s.cls}`}>{s.label}</span>
                </td>
                <td className="px-4 py-3 font-mono">
                  {r.devices}/{r.maxDevices}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{r.expiresAt ? fmt.format(r.expiresAt) : '永久'}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.lastSeenAt ? fmt.format(r.lastSeenAt) : '从未'}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <form action={toggleLicense}>
                      <input type="hidden" name="id" value={r.id} />
                      <input type="hidden" name="next" value={active ? 'revoked' : 'active'} />
                      <Button type="submit" size="sm" variant={active ? 'destructive' : 'default'}>
                        {active ? '停用' : '启用'}
                      </Button>
                    </form>
                    <form action={resetDevices}>
                      <input type="hidden" name="id" value={r.id} />
                      <Button type="submit" size="sm" variant="outline" disabled={r.devices === 0}>
                        解绑电脑
                      </Button>
                    </form>
                    <form action={deleteLicense}>
                      <input type="hidden" name="id" value={r.id} />
                      <Button type="submit" size="sm" variant="ghost">
                        删除
                      </Button>
                    </form>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </section>
  )
}
