'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const isSignUp = mode === 'sign-up'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = isSignUp
      ? await authClient.signUp.email({ email, password, name })
      : await authClient.signIn.email({ email, password })
    setLoading(false)
    if (error) {
      setError(isSignUp ? '注册失败，请检查信息后重试' : '邮箱或密码错误')
      return
    }
    router.push('/')
    router.refresh()
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-8 bg-background px-4">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex size-12 items-center justify-center rounded-md bg-ink font-mono text-sm font-medium text-ink-foreground">
          PT
        </div>
        <h1 className="text-balance text-2xl font-semibold tracking-tight">印花采集台</h1>
        <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
          {isSignUp ? '创建账号，开始采集 Temu 爆款图案' : '登录后管理你的图案库'}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-lg border bg-card p-6"
      >
        {isSignUp && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">昵称</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
          </div>
        )}
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">邮箱</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">密码</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
          />
        </div>
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? '请稍候…' : isSignUp ? '注册' : '登录'}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          {isSignUp ? '已有账号？' : '还没有账号？'}
          <Link
            href={isSignUp ? '/sign-in' : '/sign-up'}
            className="ml-1 font-medium text-foreground underline-offset-4 hover:underline"
          >
            {isSignUp ? '去登录' : '注册'}
          </Link>
        </p>
      </form>
    </main>
  )
}
