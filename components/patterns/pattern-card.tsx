'use client'

import { useState } from 'react'
import { Download, ExternalLink, Loader2, RotateCcw, Trash2 } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { PatternItem } from '@/lib/types'

const STATUS_LABEL: Record<PatternItem['status'], string> = {
  pending: '排队中',
  cropping: '灵图裁剪中',
  done: '已裁剪',
  failed: '裁剪失败',
}

export function PatternCard({
  item,
  onRetry,
  onDelete,
}: {
  item: PatternItem
  onRetry: (id: number) => void
  onDelete: (id: number) => void
}) {
  const [showOriginal, setShowOriginal] = useState(false)
  const hasCrop = Boolean(item.croppedSrc) && !showOriginal
  const busy = item.status === 'pending' || item.status === 'cropping'

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border bg-card">
      <div className="relative aspect-square bg-ink">
        {hasCrop ? (
          <img
            src={item.croppedSrc ?? ''}
            alt={`裁剪后的图案：${item.title}`}
            className="size-full object-contain p-6"
            loading="lazy"
          />
        ) : (
          <img
            src={item.imageUrl}
            alt={item.title}
            referrerPolicy="no-referrer"
            className={cn('size-full object-cover', busy && 'opacity-60')}
            loading="lazy"
          />
        )}

        <span className="absolute left-2 top-2 rounded bg-card/95 px-1.5 py-0.5 font-mono text-[11px] font-medium text-foreground">
          {item.salesText}
        </span>

        {busy && (
          <span className="absolute inset-x-0 bottom-0 flex items-center gap-1.5 bg-ink/85 px-3 py-2 text-xs text-ink-foreground">
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
            {STATUS_LABEL[item.status]}
          </span>
        )}

        {item.croppedSrc && (
          <button
            type="button"
            onClick={() => setShowOriginal((v) => !v)}
            aria-pressed={showOriginal}
            className="absolute right-2 top-2 rounded bg-card/95 px-1.5 py-0.5 text-[11px] font-medium text-foreground opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
          >
            {showOriginal ? '看图案' : '看原图'}
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-3">
        <h3 className="line-clamp-2 text-pretty text-sm leading-relaxed">{item.title}</h3>

        {item.status === 'failed' && item.error && (
          <p className="line-clamp-2 text-xs leading-relaxed text-destructive">{item.error}</p>
        )}

        <div className="mt-auto flex items-center justify-between gap-2">
          <span
            className={cn(
              'text-xs font-medium',
              item.status === 'done' && 'text-primary',
              item.status === 'failed' && 'text-destructive',
              busy && 'text-muted-foreground',
            )}
          >
            {STATUS_LABEL[item.status]}
          </span>
          <div className="flex items-center gap-0.5">
            {item.croppedSrc && (
              <a
                href={`${item.croppedSrc}&download=1`}
                className={buttonVariants({ variant: 'ghost', size: 'icon-sm' })}
                aria-label="下载图案"
                title="下载图案"
              >
                <Download />
              </a>
            )}
            {item.status === 'failed' && (
              <Button variant="ghost" size="icon-sm" onClick={() => onRetry(item.id)} aria-label="重新裁剪" title="重新裁剪">
                <RotateCcw />
              </Button>
            )}
            <a
              href={item.productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: 'ghost', size: 'icon-sm' })}
              aria-label="在 Temu 打开商品"
              title="在 Temu 打开商品"
            >
              <ExternalLink />
            </a>
            <Button variant="ghost" size="icon-sm" onClick={() => onDelete(item.id)} aria-label="删除" title="删除">
              <Trash2 />
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}
