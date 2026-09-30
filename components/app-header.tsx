'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/', label: '图案库' },
  { href: '/setup', label: '采集设置' },
]

export function AppHeader({ email }: { email: string }) {
  const pathname = usePathname()
  const router = useRouter()

  const signOut = async () => {
    await authClient.signOut()
    router.push('/sign-in')
    router.refresh()
  }

  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded bg-ink font-mono text-[11px] font-medium text-ink-foreground">
              PT
            </span>
            <span className="font-semibold tracking-tight">印花采集台</span>
          </Link>
          <nav aria-label="主导航" className="flex items-center gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href ? 'page' : undefined}
                className={cn(
                  'rounded px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground',
                  pathname === item.href && 'bg-secondary font-medium text-foreground',
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden font-mono text-xs text-muted-foreground md:inline">{email}</span>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut aria-hidden="true" />
            退出
          </Button>
        </div>
      </div>
    </header>
  )
}
