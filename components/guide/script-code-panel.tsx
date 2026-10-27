'use client'

import { useState } from 'react'
import { Button, buttonVariants } from '@/components/ui/button'

type ScriptCodePanelProps = {
  code: string
  version: string
}

export function ScriptCodePanel({ code, version }: ScriptCodePanelProps) {
  const [copied, setCopied] = useState(false)
  const lineCount = code.split('\n').length

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = code
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      textarea.remove()
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section
      aria-labelledby="script-code-title"
      className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex min-w-0 flex-col">
          <h2 id="script-code-title" className="text-sm font-semibold">
            最新脚本 <span className="font-mono text-primary">v{version}</span>
          </h2>
          <p className="text-xs text-muted-foreground">
            {'collector.user.js · '}
            {lineCount.toLocaleString()} 行
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleCopy}>
            {copied ? '已复制' : '复制全部代码'}
          </Button>
          <a
            href="/collector.user.js"
            target="_blank"
            rel="noopener"
            className={buttonVariants({ size: 'sm', variant: 'outline' })}
          >
            一键更新
          </a>
        </div>
      </header>
      <pre className="max-h-[32rem] overflow-auto bg-muted px-4 py-3 font-mono text-xs leading-relaxed text-foreground">
        <code>{code}</code>
      </pre>
      <p className="border-t border-border px-4 py-2 text-xs leading-relaxed text-muted-foreground">
        更新方法：点「一键更新」由油猴直接覆盖安装；或复制全部代码，在油猴编辑器里全选替换后按 Ctrl+S 保存。
      </p>
    </section>
  )
}
