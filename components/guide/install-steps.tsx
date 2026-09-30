const STEPS = [
  {
    title: '安装 Tampermonkey 扩展',
    body: '在 Chrome 或 Edge 的扩展商店搜索「Tampermonkey」（篡改猴）并安装。Chrome 还需要在扩展详情里打开「允许运行用户脚本」。',
  },
  {
    title: '开启文件夹下载',
    body: '打开 Tampermonkey 设置 → 配置模式选「高级」→ 下载 BETA → 下载模式选「浏览器 API」，这样图片会按「国家_关键词_日期」分文件夹保存。浏览器设置里请关闭「下载前询问保存位置」。',
  },
  {
    title: '安装采集脚本',
    body: '回到本页，点「安装采集脚本」，在弹出的 Tampermonkey 页面里点「安装」。',
  },
  {
    title: '登录 Temu，填写灵图 API',
    body: '在同一个浏览器里正常登录 Temu。第一次打开面板时会展开设置，填入灵图 API 地址、appId 和 secret。这些只保存在你自己的电脑上。',
  },
  {
    title: '选国家 → 搜索 → 开始采集',
    body: '选择国家（关键词会自动换成当地语言），点「切换国家并搜索」，再点「开始采集」。浏览器不要最小化，采集完点「导出采集记录 CSV」。',
  },
]

export function InstallSteps() {
  return (
    <section id="steps" className="flex scroll-mt-8 flex-col gap-8">
      <h2 className="text-2xl font-semibold">安装与使用</h2>
      <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {STEPS.map((s, i) => (
          <li key={s.title} className="flex flex-col gap-3 rounded-lg border bg-card p-5">
            <span className="font-mono text-xs text-primary">步骤 {i + 1}</span>
            <h3 className="font-semibold">{s.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
