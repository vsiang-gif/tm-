'use client'

import { useActionState } from 'react'
import { login } from '@/app/admin/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function LoginForm({ configured }: { configured: boolean }) {
  const [state, action, pending] = useActionState(login, null)

  return (
    <form action={action} className="flex w-full max-w-sm flex-col gap-5 rounded-lg border bg-card p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold">密钥管理后台</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">输入管理密码后可以发放和停用采集器密钥。</p>
      </div>
      {!configured && (
        <p className="rounded-md bg-muted px-3 py-2 text-sm text-destructive leading-relaxed">
          服务器还没有设置 ADMIN_PASSWORD 环境变量，请先在项目设置的 Vars 中添加。
        </p>
      )}
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">管理密码</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required autoFocus />
      </div>
      {state?.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending || !configured}>
        {pending ? '验证中…' : '登录'}
      </Button>
    </form>
  )
}
