import { buttonVariants } from '@/components/ui/button'
import { PanelPreview } from './panel-preview'

export function GuideHero() {
  return (
    <section className="grid items-center gap-12 md:grid-cols-2">
      <div className="flex flex-col gap-6">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Temu → 灵图 · 在你自己的电脑上运行
        </p>
        <h1 className="text-balance text-4xl font-semibold leading-tight md:text-5xl">
          黑色 T 恤爆款图案，豆包审核后一键进灵图
        </h1>
        <p className="text-pretty leading-relaxed text-muted-foreground">
          装好浏览器插件后，Temu 页面右下角会出现一个采集面板。它会按你勾选的国家逐个搜索，只留下有销量的黑色单面款，还会进店铺继续采。
          违规词、IP、双面、满印的商品会自动跳过。通过审核的商品会自动点灵图插件的「采集并同步」，直接进你的灵图账号。
        </p>
        <div className="flex flex-wrap gap-3">
  <a
  href="/collector.user.js"
  target="_blank"
  rel="noopener"
  className={buttonVariants({ size: 'lg' })}
  >
  安装采集脚本
  </a>
  <a
  href="/download"
  download="collector.user.js"
  className={buttonVariants({ size: 'lg', variant: 'outline' })}
  >
  下载脚本文件
  </a>
  <a
  href="/download/lan-server"
  download="lan-dedupe-server.js"
  className={buttonVariants({ size: 'lg', variant: 'outline' })}
  >
  下载局域网去重库
  </a>
  <a href="#steps" className={buttonVariants({ size: 'lg', variant: 'outline' })}>
            查看安装步骤
          </a>
        </div>
        <p className="text-sm text-muted-foreground">
          需要先安装 Tampermonkey（篡改猴）扩展，然后再点「安装采集脚本」。要发到其他电脑，点「下载脚本文件」，把 collector.user.js 发过去，在那台电脑的油猴「实用工具 → 导入文件」里选中它即可（不要双击运行）。
        </p>
      </div>
      <PanelPreview />
    </section>
  )
}
