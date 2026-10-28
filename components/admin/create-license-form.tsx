'use client'

import { useActionState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { Copy } from 'lucide-react'
import { createLicense } from '@/app/admin/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function CreateLicenseForm() {
  const [state, action, pending] = useActionState(createLicense, null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.created) formRef.current?.reset()
  }, [state])

  return (
    <section aria-labelledby="create-title" className="flex flex-col gap-4 rounded-lg border bg-card p-5">
      <h2 id="create-title" className="font-semibold">
        发放新密钥
      </h2>
      <form ref={formRef} action={action} className="grid grid-cols-1 gap-4 md:grid-cols-6">
        <div className="flex flex-col gap-2 md:col-span-2">
          <Label htmlFor="holder">使用人</Label>
          <Input id="holder" name="holder" placeholder="例如：小王" required maxLength={60} />
        </div>
        <div className="flex flex-col gap-2 md:col-span-2">
          <Label htmlFor="note">备注</Label>
          <Input id="note" name="note" placeholder="可选" maxLength={200} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="maxDevices">可用电脑数</Label>
          <Input id="maxDevices" name="maxDevices" type="number" min={1} max={20} defaultValue={1} required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="days">有效天数</Label>
          <Input id="days" name="days" type="number" min={0} max={3650} defaultValue={0} />
        </div>
        <div className="flex flex-col gap-2 md:col-span-4">
          <Label htmlFor="key">自定义密钥（留空自动生成）</Label>
          <Input id="key" name="key" placeholder="例如：528133" className="font-mono" maxLength={64} />
        </div>
        <div className="flex items-end md:col-span-2">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? '生成中…' : '生成密钥'}
          </Button>
        </div>
      </form>
      <p className="text-xs text-muted-foreground leading-relaxed">有效天数填 0 表示永久有效。</p>
      {state?.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state?.created && (
        <div className="flex flex-wrap items-center gap-3 rounded-md bg-ink px-4 py-3 text-ink-foreground">
          <span className="text-sm">新密钥：</span>
          <code className="font-mono text-lg tracking-wider">{state.created}</code>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => navigator.clipboard.writeText(state.created!).then(() => toast.success('已复制'))}
          >
            <Copy aria-hidden="true" />
            复制
          </Button>
        </div>
      )}
    </section>
  )
}
