import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { collectorToken } from '@/lib/db/schema'
import { isLingtuConfigured } from '@/lib/lingtu'
import { AppHeader } from '@/components/app-header'
import { TokenPanel } from '@/components/setup/token-panel'

const STEPS = [
  {
    title: '安装 Tampermonkey',
    body: '在 Chrome / Edge 扩展商店搜索 “Tampermonkey”（篡改猴）并安装。',
  },
  {
    title: '生成采集密钥并安装脚本',
    body: '点击右侧“生成密钥”，再点“安装采集脚本”，在 Tampermonkey 弹窗中确认安装。',
  },
  {
    title: '在 Temu 搜索黑色 T 恤',
    body: '打开 temu.com 搜索“黑色T恤”，页面右下角会出现采集面板。',
  },
  {
    title: '自动滚动采集',
    body: '设定最低销量（默认 100）和目标数量，点击“自动滚动采集”。达标商品会实时送到灵图裁剪。',
  },
]

export default async function SetupPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  const [token] = await db
    .select({ preview: collectorToken.tokenPreview, createdAt: collectorToken.createdAt })
    .from(collectorToken)
    .where(eq(collectorToken.userId, session.user.id))
    .limit(1)

  const lingtuReady = isLingtuConfigured()

  return (
    <div className="min-h-svh">
      <AppHeader email={session.user.email} />
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 md:px-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-balance text-2xl font-semibold tracking-tight">采集设置</h1>
          <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
            采集脚本运行在你自己的浏览器里，只读取你正在浏览的 Temu 页面。
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-5">
          <ol className="flex flex-col gap-5 rounded-lg border bg-card p-6 md:col-span-3">
            {STEPS.map((step, i) => (
              <li key={step.title} className="flex gap-4">
                <span className="flex size-7 shrink-0 items-center justify-center rounded bg-ink font-mono text-xs text-ink-foreground">
                  {i + 1}
                </span>
                <div className="flex flex-col gap-1">
                  <h2 className="font-medium">{step.title}</h2>
                  <p className="text-pretty text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="flex flex-col gap-6 md:col-span-2">
            <TokenPanel existingPreview={token?.preview ?? null} />

            <section className="flex flex-col gap-3 rounded-lg border bg-card p-6" aria-labelledby="lingtu-heading">
              <div className="flex items-center justify-between">
                <h2 id="lingtu-heading" className="font-medium">
                  灵图 API
                </h2>
                <span
                  className={
                    lingtuReady
                      ? 'rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary'
                      : 'rounded bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive'
                  }
                >
                  {lingtuReady ? '已连接' : '未配置'}
                </span>
              </div>
              <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                使用灵图「图案裁剪」接口（/aigc/detect）自动识别 T 恤印花。请在项目设置的 Vars 中填写灵图邮件提供的：
              </p>
              <ul className="flex flex-col gap-1 font-mono text-xs">
                <li>LINGTU_API_BASE</li>
                <li>LINGTU_APP_ID</li>
                <li>LINGTU_SECRET</li>
              </ul>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
