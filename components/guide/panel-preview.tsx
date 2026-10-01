const TABS = ['采集', '国家', '过滤', '灵图/AI']

const FIELDS = [
  { label: '国家', value: '美国 · 英国 · 德国' },
  { label: '最低销量', value: '100' },
  { label: '进店数量', value: '3 家' },
  { label: '卖', value: '男装' },
]

const LOGS = [
  '14:02:31 已保存 601099512（1.2K+ sold）',
  '14:02:27 跳过 601099803：标题含「weed」',
  '14:02:22 跳过 601100017：非黑色或印花太满',
  '14:02:18 将进入 3 个高销量商品的店铺继续采集',
]

export function PanelPreview() {
  return (
    <figure className="flex flex-col gap-3">
      <div
        className="flex flex-col gap-4 rounded-xl bg-ink p-5 text-ink-foreground shadow-2xl md:ml-auto md:w-96"
        aria-label="Temu 页面上的采集面板示意"
      >
        <span className="text-sm font-semibold">爆款图案采集 → 灵图</span>
        <div className="flex border-b border-ink-foreground/15 text-xs">
          {TABS.map((t, i) => (
            <span
              key={t}
              className={`flex-1 border-b-2 pb-1.5 text-center ${i === 0 ? 'border-primary' : 'border-transparent opacity-60'}`}
            >
              {t}
            </span>
          ))}
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
          <span className="flex-1 rounded-md bg-primary py-2 text-center text-sm text-primary-foreground">开始多国采集</span>
          <span className="flex-1 rounded-md border border-ink-foreground/15 py-2 text-center text-sm">只采当前页</span>
        </div>
        <p className="text-xs opacity-60">任务 2/5：店铺 634418212 · 豆包审核 → 灵图采集并同步</p>
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
