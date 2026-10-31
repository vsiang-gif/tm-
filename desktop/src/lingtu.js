// 灵图卖家辅助工具 (Chrome Web Store id below): bundled at build time, auto-updated from the store at runtime.
const fs = require('node:fs')
const path = require('node:path')
const os = require('node:os')
const { execFileSync } = require('node:child_process')

const LINGTU_ID = 'oigianaminhgacdbfogebnplkeapmbon'
const LINGTU_NAME = '灵图卖家辅助工具'
const CRX_URL =
  'https://clients2.google.com/service/update2/crx?response=redirect&prodversion=140.0.0.0&acceptformat=crx2,crx3&x=id%3D' +
  LINGTU_ID +
  '%26uc'

function manifestOf(dir) {
  try {
    return JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'))
  } catch {
    return null
  }
}

function newer(a, b) {
  const pa = String(a).split('.').map(Number)
  const pb = String(b).split('.').map(Number)
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) > (pb[i] || 0)
  }
  return false
}

function crxToZip(buf) {
  if (buf.toString('latin1', 0, 4) !== 'Cr24') throw new Error('下载的不是插件文件')
  const ver = buf.readUInt32LE(4)
  if (ver === 3) return buf.subarray(12 + buf.readUInt32LE(8))
  if (ver === 2) return buf.subarray(16 + buf.readUInt32LE(8) + buf.readUInt32LE(12))
  throw new Error('不支持的插件格式 v' + ver)
}

function unzip(zipFile, dest) {
  fs.mkdirSync(dest, { recursive: true })
  const tries = [
    ['tar', ['-xf', zipFile, '-C', dest]],
    ['unzip', ['-oq', zipFile, '-d', dest]],
    ['powershell', ['-NoProfile', '-Command', 'Expand-Archive -Force -LiteralPath $args[0] -DestinationPath $args[1]', zipFile, dest]],
  ]
  let last
  for (const [cmd, args] of tries) {
    try {
      execFileSync(cmd, args, { stdio: 'ignore', windowsHide: true })
      if (manifestOf(dest)) return
    } catch (e) {
      last = e
    }
  }
  throw last || new Error('解压失败')
}

// Downloads the latest CRX into `${baseDir}/lingtu-<version>` unless that version (or newer) is already at `haveVersion`.
async function downloadLingtu(baseDir, fetchImpl, haveVersion) {
  const res = await fetchImpl(CRX_URL, { redirect: 'follow' })
  if (!res.ok) throw new Error('HTTP ' + res.status)
  const zip = crxToZip(Buffer.from(await res.arrayBuffer()))
  const tmpZip = path.join(os.tmpdir(), 'lingtu-' + process.pid + '-' + Date.now() + '.zip')
  const tmpDir = path.join(baseDir, '.lingtu-tmp-' + Date.now())
  fs.writeFileSync(tmpZip, zip)
  try {
    unzip(tmpZip, tmpDir)
    const m = manifestOf(tmpDir)
    if (!m || m.name !== LINGTU_NAME) throw new Error('插件内容不对')
    if (haveVersion && !newer(m.version, haveVersion)) {
      fs.rmSync(tmpDir, { recursive: true, force: true })
      return { version: m.version, dir: null }
    }
    const dir = path.join(baseDir, 'lingtu-' + m.version)
    fs.rmSync(dir, { recursive: true, force: true })
    fs.renameSync(tmpDir, dir)
    return { version: m.version, dir }
  } finally {
    fs.rmSync(tmpZip, { force: true })
    fs.rmSync(tmpDir, { recursive: true, force: true })
  }
}

// Newest copy among the bundled one and previously auto-updated ones; older updated copies are removed.
function pickLingtu(bundledDir, baseDir) {
  const found = []
  if (bundledDir && manifestOf(bundledDir)) found.push(bundledDir)
  if (fs.existsSync(baseDir)) {
    for (const n of fs.readdirSync(baseDir)) if (/^lingtu-\d/.test(n)) found.push(path.join(baseDir, n))
  }
  let best = null
  for (const d of found) {
    const m = manifestOf(d)
    if (m && m.name === LINGTU_NAME && (!best || newer(m.version, best.version))) best = { dir: d, version: m.version }
  }
  for (const d of found) {
    if (best && d !== best.dir && d.startsWith(baseDir)) fs.rmSync(d, { recursive: true, force: true })
  }
  return best
}

module.exports = { LINGTU_NAME, manifestOf, downloadLingtu, pickLingtu }
