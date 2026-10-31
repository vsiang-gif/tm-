// Build step: bundle the latest 灵图卖家辅助工具 into extensions/lingtu so the exe works without reaching the Chrome Web Store.
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const { downloadLingtu } = require('../src/lingtu.js')
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const base = path.join(root, 'extensions')
const target = path.join(base, 'lingtu')

fs.mkdirSync(base, { recursive: true })
try {
  const { version, dir } = await downloadLingtu(base, fetch)
  fs.rmSync(target, { recursive: true, force: true })
  fs.renameSync(dir, target)
  console.log('灵图插件已打包：v' + version)
} catch (e) {
  console.warn('灵图插件下载失败（安装包将不含内置插件，运行时会再尝试自动下载）：' + (e && e.message ? e.message : e))
}
