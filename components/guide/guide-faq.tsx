const FAQ = [
  {
    q: '文件保存在哪里？',
    a: '保存在浏览器默认的下载目录下的「Temu图案」文件夹里。每个商品会有一张原图和灵图裁剪后的图案，文件名以销量开头，方便排序。',
  },
  {
    q: '怎么放进灵图素材库？',
    a: '灵图 API 返回的裁剪结果只保留 24 小时，而且目前没有「存入素材库」的接口。请把下载好的文件夹批量导入灵图。如果要自动上传到灵图网页素材库，需要提供灵图网站的网址，我们再加上这个功能。',
  },
  {
    q: '切换国家没有生效？',
    a: 'Temu 有时会按账号或 IP 固定站点。这时请用 Temu 右上角自带的国家/语言切换，面板会自动识别当前站点，文件夹也会按这个国家命名。',
  },
  {
    q: '同一个商品会重复采集吗？',
    a: '不会。已保存的商品会被记下来并自动跳过。想重新采集，可以在面板「设置」里清空记录。',
  },
  {
    q: '版权提醒',
    a: 'Temu 上的图案大多有版权。建议只当选款和设计参考，直接拿来印刷售卖有被投诉侵权的风险。',
  },
]

export function GuideFaq() {
  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-2xl font-semibold">常见问题</h2>
      <div className="flex flex-col divide-y rounded-lg border bg-card">
        {FAQ.map((f) => (
          <details key={f.q} className="group px-5 py-4">
            <summary className="cursor-pointer list-none font-medium marker:hidden">
              {f.q}
            </summary>
            <p className="pt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
