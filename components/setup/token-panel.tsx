'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { KeyRound } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { regenerateCollectorToken } from '@/app/actions/patterns'

export function TokenPanel({ existingPreview }: { existingPreview: string | null }) {
  const [token, setToken] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const generate = () =>
    startTransition(async () => {
      try {
        setToken(await regenerateCollectorToken())
        toast.success('新密钥已生成，旧脚本将失效')
      } catch {
        toast.error('生成失败，请重试')
      }
    })

  const installUrl = token ? `/collector.user.js?token=${encodeURIComponent(token)}` : null

  return (
    <section className="flex flex-col gap-4 rounded-lg border bg-card p-6" aria-labelledby="token-heading">
      <div className="flex items-center gap-2">
        <KeyRound className="size-4 text-muted-foreground" aria-hidden="true" />
        <h2 id="token-heading" className="font-medium">
          采集密钥
        </h2>
      </div>

      {token ? (
        <div className="flex flex-col gap-3">
          <p className="break-all rounded bg-secondary px-3 py-2 font-mono text-xs">{token}</p>
          <p className="text-pretty text-xs leading-relaxed text-muted-foreground">
            密钥只显示这一次，已内置在下方脚本中。
          </p>
          <a href={installUrl ?? '#'} target="_blank" rel="noopener" className={buttonVariants()}>
            安装采集脚本
          </a>
        </div>
      ) : (
        <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
          {existingPreview ? (
            <>
              当前密钥 <span className="font-mono text-foreground">{existingPreview}</span>
              。重新生成后需重新安装脚本。
            </>
          ) : (
            '生成一个专属密钥，用于把采集结果安全地发送到你的图案库。'
          )}
        </p>
      )}

      <Button variant={token ? 'outline' : 'default'} onClick={generate} disabled={pending}>
        {pending ? '生成中…' : existingPreview || token ? '重新生成密钥' : '生成密钥'}
      </Button>
    </section>
  )
}
