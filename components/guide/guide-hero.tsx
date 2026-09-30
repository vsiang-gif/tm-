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
          黑色 T 恤爆款图案，一键采集并裁剪
        </h1>
        <p className="text-pretty leading-relaxed text-muted-foreground">
          装好浏览器插件后，Temu 页面右下角会出现一个采集面板。选好国家，设置最低销量（默认 100+），点「开始采集」。
          它会自动滚动页面、筛出达标商品，调用灵图 API 裁剪出图案，再保存到你电脑的下载文件夹。
        </p>
        <div className="flex flex-wrap gap-3">
          <a href="/collector.user.js" className={buttonVariants({ size: 'lg' })}>
            安装采集脚本
          </a>
          <a href="#steps" className={buttonVariants({ size: 'lg', variant: 'outline' })}>
            查看安装步骤
          </a>
        </div>
        <p className="text-sm text-muted-foreground">
          需要先安装 Tampermonkey（篡改猴）扩展，然后再点「安装采集脚本」。
        </p>
      </div>
      <PanelPreview />
    </section>
  )
}
