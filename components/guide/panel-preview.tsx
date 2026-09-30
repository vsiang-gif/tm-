const FIELDS = [
  { label: '国家', value: '美国' },
  { label: '最低销量', value: '100' },
  { label: '目标数量', value: '100' },
  { label: '只要黑色款', value: '是' },
]

const LOGS = [
  '14:02:31 已保存 601099512（1.2K+ sold）',
  '14:02:25 已保存 601099734（860+ sold）',
  '14:02:18 已保存 601100215（3.4K+ sold）',
]

export function PanelPreview() {
  return (
    <figure className="flex flex-col gap-3">
      <div
        className="flex flex-col gap-4 rounded-xl bg-ink p-5 text-ink-foreground shadow-2xl md:ml-auto md:w-96"
        aria-label="Temu 页面上的采集面板示意"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">爆款图案采集 → 灵图</span>
          <span className="text-xs opacity-60">设置</span>
        </div>
        <dl className="grid grid-cols-2 gap-2">
          {FIELDS.map((f) => (
            <div key={f.label} className="flex flex-col gap-1 rounded-md border border-ink-foreground/15 px-3 py-2">
              <dt className="text-xs opacity-60">{f.label}</dt>
              <dd className="font-mono text-sm">{f.value}</dd>
            </div>
          ))}
        </dl>
        <div className="flex gap-2">
          <span className="flex-1 rounded-md border border-ink-foreground/15 py-2 text-center text-sm">切换国家并搜索</span>
          <span className="flex-1 rounded-md bg-primary py-2 text-center text-sm text-primary-foreground">停止滚动</span>
        </div>
        <p className="font-mono text-xs opacity-70">识别 64 · 达标 23 · 已保存 18 · 排队 5</p>
        <ul className="flex flex-col gap-1 font-mono text-xs opacity-60">
          {LOGS.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </div>
      <figcaption className="text-center text-xs text-muted-foreground md:text-right">
        面板会固定在 Temu 页面右下角
      </figcaption>
    </figure>
  )
}
