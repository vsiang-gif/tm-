'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { toast } from 'sonner'
import { RotateCcw } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { deletePatterns, retryAllFailed, retryPattern } from '@/app/actions/patterns'
import type { PatternItem, PatternsResponse } from '@/lib/types'
import { PatternCard } from './pattern-card'

type Filter = 'all' | 'active' | 'done' | 'failed'

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'active', label: '处理中' },
  { value: 'done', label: '已裁剪' },
  { value: 'failed', label: '失败' },
]

const fetcher = async (url: string): Promise<PatternsResponse> => {
  const res = await fetch(url)
  if (!res.ok) throw new Error('加载失败')
  return res.json()
}

function matches(item: PatternItem, filter: Filter) {
  if (filter === 'all') return true
  if (filter === 'active') return item.status === 'pending' || item.status === 'cropping'
  return item.status === filter
}

export function PatternBoard() {
  const [filter, setFilter] = useState<Filter>('all')
  const [, startTransition] = useTransition()
  const { data, error, isLoading, mutate } = useSWR('/api/patterns', fetcher, {
    refreshInterval: (latest) =>
      latest && latest.counts.pending + latest.counts.cropping > 0 ? 4000 : 20000,
  })

  const visible = useMemo(() => (data?.items ?? []).filter((i) => matches(i, filter)), [data, filter])
  const counts = data?.counts

  const run = (action: () => Promise<void>, success: string) =>
    startTransition(async () => {
      try {
        await action()
        toast.success(success)
      } catch {
        toast.error('操作失败，请重试')
      }
      await mutate()
    })

  const stats = [
    { label: '已采集', value: counts?.total },
    { label: '处理中', value: counts ? counts.pending + counts.cropping : undefined },
    { label: '已裁剪', value: counts?.done },
    { label: '失败', value: counts?.failed },
  ]

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-balance text-2xl font-semibold tracking-tight">图案库</h1>
          <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
            来自 Temu 销量达标的 T 恤，由灵图自动识别并裁剪印花。
          </p>
        </div>
        <dl className="flex divide-x rounded-lg border bg-card">
          {stats.map((s) => (
            <div key={s.label} className="flex min-w-20 flex-col gap-0.5 px-4 py-2.5">
              <dt className="text-xs text-muted-foreground">{s.label}</dt>
              <dd className="font-mono text-lg font-medium tabular-nums">{s.value ?? '–'}</dd>
            </div>
          ))}
        </dl>
      </section>

      {data && !data.lingtuConfigured && (
        <div className="flex flex-col gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm md:flex-row md:items-center md:justify-between">
          <p className="leading-relaxed">
            尚未配置灵图 API 凭证，采集到的图案会先排队，配置后自动开始裁剪。
          </p>
          <Link href="/setup" className={buttonVariants({ size: 'sm' })}>
            去配置
          </Link>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="按状态筛选" className="flex gap-1 rounded-lg bg-secondary p-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              aria-pressed={filter === f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                'rounded-md px-3 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground',
                filter === f.value && 'bg-card font-medium text-foreground shadow-sm',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        {counts && counts.failed > 0 && (
          <Button variant="outline" size="sm" onClick={() => run(retryAllFailed, '已重新提交失败的图案')}>
            <RotateCcw aria-hidden="true" />
            全部重试
          </Button>
        )}
      </div>

      {error ? (
        <p className="rounded-lg border bg-card p-8 text-center text-sm text-destructive">图案库加载失败，请刷新页面。</p>
      ) : isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" aria-hidden="true">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse rounded-lg bg-secondary" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState hasAny={(counts?.total ?? 0) > 0} />
      ) : (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {visible.map((item) => (
            <li key={item.id} className="flex">
              <PatternCard
                item={item}
                onRetry={(id) => run(() => retryPattern(id), '已重新提交')}
                onDelete={(id) => run(() => deletePatterns([id]), '已删除')}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function EmptyState({ hasAny }: { hasAny: boolean }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed bg-card px-6 py-16 text-center">
      <div className="size-16 rounded-md bg-ink" aria-hidden="true" />
      <div className="flex flex-col gap-1">
        <h2 className="font-semibold">{hasAny ? '该分类下暂无图案' : '还没有采集任何图案'}</h2>
        <p className="max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
          {hasAny
            ? '切换上方筛选查看其他状态的图案。'
            : '安装浏览器采集脚本，在 Temu 搜索“黑色T恤”，点击“自动滚动采集”即可。'}
        </p>
      </div>
      {!hasAny && (
        <Link href="/setup" className={buttonVariants()}>
          安装采集脚本
        </Link>
      )}
    </div>
  )
}
