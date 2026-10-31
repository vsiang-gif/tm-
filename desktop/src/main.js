const { app, BrowserWindow, ipcMain, session, Notification, Menu, dialog, net, safeStorage, shell, screen } = require('electron')
const path = require('node:path')
const fs = require('node:fs')
const os = require('node:os')
const crypto = require('node:crypto')
const { spawn } = require('node:child_process')
// Mutable copy: a newer script downloaded at runtime replaces code/version without reinstalling the app.
const collector = { ...require('./generated/collector.json') }
const { LINGTU_NAME, manifestOf, downloadLingtu, pickLingtu } = require('./lingtu.js')
const BUNDLED_SCRIPT_VERSION = collector.version

// Several candidates so a single protected or renamed domain cannot lock every client out.
const LICENSE_SERVERS = [
  ...new Set(
    [process.env.TM_LICENSE_SERVER, collector.licenseServer, 'https://tm-puce-ten.vercel.app']
      .filter(Boolean)
      .map((u) => String(u).replace(/\/+$/, '')),
  ),
]
const RECHECK_MS = 10 * 60 * 1000
// Tolerate this long without reaching the server before forcing a lock (network blips, server maintenance).
const OFFLINE_GRACE_MS = 6 * 60 * 60 * 1000
const MAX_ATTEMPTS = 5
const PARTITION = 'persist:collector'
const MATCHERS = collector.matches.map((r) => new RegExp(r))

let unlocked = false
let attempts = 0
let lockWin = null
let launcherWin = null
const tokens = new Map()
const menuCommands = new Map()

// Keep the pre-rename data folder so saved keys, settings, logins and the dedupe DB survive the MT采集器 rename.
app.setPath('userData', path.join(app.getPath('appData'), '爆款图案采集器'))

// Without the guard a second copy still ran whenReady and flashed its own lock window before quitting.
const gotLock = app.requestSingleInstanceLock()
if (!gotLock) app.quit()

app.userAgentFallback = app.userAgentFallback
  .split(' ')
  .filter((t) => !/^(Electron|tm-collector|爆款图案采集器|MT采集器)\//i.test(t))
  .join(' ')

const dataFile = () => path.join(app.getPath('userData'), 'gm-values.json')
const settingsFile = () => path.join(app.getPath('userData'), 'settings.json')
function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return {}
  }
}
let values = {}
let saveTimer = null
function saveValues() {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    fs.writeFileSync(dataFile() + '.tmp', JSON.stringify(values))
    fs.renameSync(dataFile() + '.tmp', dataFile())
  }, 300)
}
function flushValues() {
  if (!saveTimer) return
  clearTimeout(saveTimer)
  fs.writeFileSync(dataFile(), JSON.stringify(values))
}

function machineId() {
  const macs = Object.values(os.networkInterfaces())
    .flat()
    .filter((i) => i && !i.internal && i.mac && i.mac !== '00:00:00:00:00:00')
    .map((i) => i.mac)
    .sort()
  return crypto
    .createHash('sha256')
    .update([os.hostname(), os.userInfo().username, os.platform(), os.arch(), macs[0] || ''].join('|'))
    .digest('hex')
}

const REASONS = {
  invalid: '密钥不存在',
  revoked: '该密钥已被停用',
  expired: '该密钥已过期',
  device_limit: '该密钥绑定的电脑数已满，请联系管理员解绑',
  bad_request: '请求无效',
}

async function verifyOnline(key) {
  let last = { ok: false, offline: true }
  for (const server of LICENSE_SERVERS) {
    last = await verifyAt(server, key)
    if (!last.offline) return last
  }
  return last
}

async function verifyAt(server, key) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15000)
  try {
    const res = await net.fetch(server + '/api/license/verify', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ key: String(key ?? '').trim(), machineId: machineId(), version: collector.version }),
      signal: controller.signal,
    })
    const data = await res.json().catch(() => ({}))
    if (data.ok) return { ok: true, holder: data.holder, expiresAt: data.expiresAt }
    if (res.status === 403 || res.status === 400) return { ok: false, reason: data.reason || 'invalid' }
    return { ok: false, offline: true }
  } catch {
    return { ok: false, offline: true }
  } finally {
    clearTimeout(timer)
  }
}

function rememberKey(key) {
  const settings = readJson(settingsFile())
  if (key && safeStorage.isEncryptionAvailable()) {
    settings.license = safeStorage.encryptString(key).toString('base64')
  } else {
    delete settings.license
  }
  fs.writeFileSync(settingsFile(), JSON.stringify(settings))
}

function recalledKey() {
  const enc = readJson(settingsFile()).license
  if (!enc || !safeStorage.isEncryptionAvailable()) return ''
  try {
    return safeStorage.decryptString(Buffer.from(enc, 'base64'))
  } catch {
    return ''
  }
}

let activeKey = ''
let lastVerifiedAt = 0
let recheckTimer = null

function lockOut(message) {
  clearInterval(recheckTimer)
  unlocked = false
  rememberKey('')
  for (const w of BrowserWindow.getAllWindows()) w.destroy()
  dialog.showMessageBoxSync({ type: 'warning', title: '授权已失效', message, detail: '程序即将退出。' })
  app.quit()
}

function startRecheck() {
  clearInterval(recheckTimer)
  recheckTimer = setInterval(async () => {
    const r = await verifyOnline(activeKey)
    if (r.ok) {
      lastVerifiedAt = Date.now()
    } else if (!r.offline) {
      lockOut(REASONS[r.reason] || '密钥验证失败')
    } else if (Date.now() - lastVerifiedAt > OFFLINE_GRACE_MS) {
      lockOut('长时间无法连接授权服务器，请检查网络后重新打开')
    }
  }, RECHECK_MS)
}

function enterApp(key) {
  unlocked = true
  activeKey = key
  lastVerifiedAt = Date.now()
  startRecheck()
  loadScriptOverride()
  const settings = readJson(settingsFile())
  const lingtu = settings.lingtu === false ? null : pickLingtu(bundledLingtuDir(), lingtuBaseDir())
  // A manually loaded copy of 灵图 would inject a second floating ball next to the built-in one.
  const manual = (settings.extensions || []).filter((d) => !lingtu || manifestOf(d)?.name !== LINGTU_NAME)
  Promise.allSettled([...(lingtu ? [lingtu.dir] : []), ...manual].map(loadExtension)).finally(() => {
    createLauncher()
    lockWin?.close()
    scheduleUpdateChecks()
    if (settings.lingtu !== false) setTimeout(() => updateLingtu(lingtu), 15000)
  })
}

const RELEASE_API = 'https://api.github.com/repos/vsiang-gif/tm-/releases/tags/desktop-latest'
const RELEASE_PAGE = 'https://github.com/vsiang-gif/tm-/releases/tag/desktop-latest'
const UPDATE_EVERY_MS = 6 * 60 * 60 * 1000

function patchSettings(patch) {
  const settings = { ...readJson(settingsFile()), ...patch }
  fs.writeFileSync(settingsFile(), JSON.stringify(settings))
  return settings
}

function newerThan(a, b) {
  const pa = String(a).split('.').map(Number)
  const pb = String(b).split('.').map(Number)
  for (let i = 0; i < 3; i++) {
    if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) > (pb[i] || 0)
  }
  return false
}

async function fetchLatest() {
  const res = await net.fetch(RELEASE_API, { headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'MT-Collector' } })
  if (!res.ok) throw new Error('HTTP ' + res.status)
  const rel = await res.json()
  const assets = Array.isArray(rel.assets) ? rel.assets : []
  const pick = (re) => {
    let best = null
    for (const a of assets) {
      const m = re.test(a.name) && a.name.match(/(\d+\.\d+\.\d+)/)
      if (m && (!best || newerThan(m[1], best.version))) best = { version: m[1], url: a.browser_download_url }
    }
    return best
  }
  const best = (process.env.PORTABLE_EXECUTABLE_FILE ? pick(/portable\.exe$/i) : pick(/setup\.exe$/i)) || pick(/\.exe$/i)
  return best ? { ...best, notes: String(rel.body || '').slice(0, 800) } : null
}

function showBox(opts) {
  const parent = BrowserWindow.getFocusedWindow()
  return parent ? dialog.showMessageBox(parent, opts) : dialog.showMessageBox(opts)
}

const scriptFile = () => path.join(app.getPath('userData'), 'collector-script.json')

function loadScriptOverride() {
  const saved = readJson(scriptFile())
  if (saved && typeof saved.code === 'string' && saved.name === collector.name && newerThan(saved.version, BUNDLED_SCRIPT_VERSION)) {
    collector.code = saved.code
    collector.version = saved.version
  }
}

async function fetchLatestScript() {
  let lastErr
  for (const base of LICENSE_SERVERS) {
    try {
      const res = await net.fetch(base + '/collector.user.js?t=' + Date.now(), { headers: { 'Cache-Control': 'no-cache' } })
      if (!res.ok) throw new Error('HTTP ' + res.status)
      const code = await res.text()
      const end = code.indexOf('// ==/UserScript==')
      const header = end > 0 ? code.slice(0, end) : ''
      const name = ((header.match(/^\/\/ @name\s+(.+)$/m) || [])[1] || '').trim()
      const version = (header.match(/^\/\/ @version\s+(\d+\.\d+\.\d+)/m) || [])[1]
      if (!version || name !== collector.name) throw new Error('脚本内容无法识别')
      return { version, code }
    } catch (e) {
      lastErr = e
    }
  }
  throw lastErr || new Error('没有可用的服务器')
}

function setAllProgress(p) {
  for (const w of BrowserWindow.getAllWindows()) if (!w.isDestroyed()) w.setProgressBar(p)
}

async function downloadInstaller(latest) {
  const dir = path.join(app.getPath('temp'), 'mt-collector-update')
  fs.mkdirSync(dir, { recursive: true })
  const file = path.join(dir, decodeURIComponent(path.basename(new URL(latest.url).pathname)))
  if (fs.existsSync(file)) return file
  const res = await net.fetch(latest.url)
  if (!res.ok || !res.body) throw new Error('HTTP ' + res.status)
  const total = Number(res.headers.get('content-length')) || 0
  const part = file + '.part'
  const fd = fs.openSync(part, 'w')
  let got = 0
  try {
    const reader = res.body.getReader()
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      fs.writeSync(fd, value)
      got += value.length
      if (total) setAllProgress(got / total)
    }
  } finally {
    fs.closeSync(fd)
    setAllProgress(-1)
  }
  if (total && got !== total) throw new Error('下载不完整（' + got + '/' + total + '）')
  fs.renameSync(part, file)
  return file
}

// Runs on quit; the short delay lets this process release the single-instance lock and its files first.
let pendingInstaller = null
function launchInstaller(file) {
  let target = file
  const portable = process.env.PORTABLE_EXECUTABLE_FILE
  if (portable) {
    try {
      target = path.join(path.dirname(portable), path.basename(file))
      if (path.resolve(target) !== path.resolve(file)) fs.copyFileSync(file, target)
    } catch {
      target = file
    }
  }
  spawn('cmd.exe', ['/d', '/s', '/c', '"ping -n 3 127.0.0.1 >nul & start "" "' + target + '""'], {
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
    windowsVerbatimArguments: true,
  }).unref()
}
app.on('quit', () => {
  if (!pendingInstaller) return
  try {
    launchInstaller(pendingInstaller)
  } catch {}
})

async function offerAppUpdate(latest, manual) {
  if (!manual && readJson(settingsFile()).skipVersion === latest.version) return false
  const r = await showBox({
    type: 'info',
    buttons: ['立即更新', '稍后', '跳过这个版本'],
    defaultId: 0,
    cancelId: 1,
    message: '发现新版本 MT采集器 v' + latest.version,
    detail: '当前版本 v' + app.getVersion() + (latest.notes ? '\n\n' + latest.notes : '') + '\n\n点「立即更新」会在后台自动下载（任务栏图标显示进度），下载期间可以继续使用。',
  })
  if (r.response === 2) patchSettings({ skipVersion: latest.version })
  if (r.response !== 0) return false
  let file
  try {
    file = await downloadInstaller(latest)
  } catch (e) {
    const f = await showBox({
      type: 'error',
      buttons: ['用浏览器下载', '取消'],
      defaultId: 0,
      cancelId: 1,
      message: '自动下载失败',
      detail: String(e && e.message ? e.message : e) + '\n\n可以改用浏览器下载，下载后关闭旧版再运行新版即可。',
    })
    if (f.response === 0) shell.openExternal(latest.url)
    return false
  }
  pendingInstaller = file
  const portable = !!process.env.PORTABLE_EXECUTABLE_FILE
  const d = await showBox({
    type: 'info',
    buttons: ['立即重启并更新', '退出软件时再更新'],
    defaultId: 0,
    cancelId: 1,
    message: '新版本 v' + latest.version + ' 已下载好',
    detail:
      (portable ? '会关闭当前软件并自动打开新版（新版文件放在旧版同一个文件夹）。' : '会关闭当前软件并打开安装程序，按提示点「下一步」即可。') +
      '\n密钥、设置、登录状态和去重库都会保留。正在采集的话，建议等这一轮结束再更新。',
  })
  if (d.response === 0) app.quit()
  return true
}

async function offerScriptUpdate(latest, manual) {
  if (!manual && readJson(settingsFile()).skipScriptVersion === latest.version) return false
  const r = await showBox({
    type: 'info',
    buttons: ['立即更新', '稍后', '跳过这个版本'],
    defaultId: 0,
    cancelId: 1,
    message: '采集脚本有新版本 v' + latest.version,
    detail: '当前脚本 v' + collector.version + '\n\n脚本更新不用重装软件，点「立即更新」几秒内生效，已打开的平台网页会自动刷新，进行中的采集任务会自动续上。',
  })
  if (r.response === 2) patchSettings({ skipScriptVersion: latest.version })
  if (r.response !== 0) return false
  fs.writeFileSync(scriptFile(), JSON.stringify({ name: collector.name, version: latest.version, code: latest.code }))
  collector.code = latest.code
  collector.version = latest.version
  reloadSitePages()
  if (Notification.isSupported()) new Notification({ title: 'MT采集器', body: '采集脚本已更新到 v' + latest.version }).show()
  return true
}

const errText = (r) => (r.status === 'rejected' ? String(r.reason && r.reason.message ? r.reason.message : r.reason) : '')

let updateBusy = false
async function checkAll(manual) {
  if (updateBusy) return { busy: true }
  updateBusy = true
  try {
    const [appRes, scriptRes] = await Promise.allSettled([fetchLatest(), fetchLatestScript()])
    const appLatest = appRes.status === 'fulfilled' ? appRes.value : null
    const scriptLatest = scriptRes.status === 'fulfilled' ? scriptRes.value : null
    const appNew = !!appLatest && newerThan(appLatest.version, app.getVersion())
    const scriptNew = !!scriptLatest && newerThan(scriptLatest.version, collector.version)
    let installing = false
    if (appNew) installing = await offerAppUpdate(appLatest, manual)
    if (scriptNew && !installing) await offerScriptUpdate(scriptLatest, manual)
    if (manual && !appNew && !scriptNew) {
      const errs = [errText(appRes) && '软件：' + errText(appRes), errText(scriptRes) && '采集脚本：' + errText(scriptRes)].filter(Boolean)
      if (errs.length === 2) {
        dialog.showErrorBox('检查更新失败', '连不上更新服务器：\n' + errs.join('\n') + '\n\n可以稍后再试，或在「帮助」里打开下载页手动下载。')
      } else {
        await showBox({
          type: 'info',
          message: '已是最新版本',
          detail: '软件 v' + app.getVersion() + ' · 采集脚本 v' + collector.version + (errs.length ? '\n\n部分检查失败：' + errs[0] : ''),
        })
      }
    }
    return { app: app.getVersion(), script: collector.version, appUpdate: appNew, scriptUpdate: scriptNew }
  } finally {
    updateBusy = false
  }
}

let updateTimer = null
function scheduleUpdateChecks() {
  clearInterval(updateTimer)
  if (readJson(settingsFile()).autoUpdate === false) return
  setTimeout(() => checkAll(false), 8000)
  updateTimer = setInterval(() => checkAll(false), UPDATE_EVERY_MS)
}

const siteWins = new Set()
const winNo = new Map()
let winSeq = 0
let menuTimer = null
function scheduleMenu() {
  clearTimeout(menuTimer)
  menuTimer = setTimeout(buildMenu, 150)
}

function liveSiteWins() {
  return Array.from(siteWins).filter((w) => !w.isDestroyed())
}

function windowList() {
  return liveSiteWins().map((w) => ({ id: w.id, no: winNo.get(w.id), title: w.webContents.getTitle() || w.webContents.getURL() }))
}

function tileSiteWindows() {
  const wins = liveSiteWins()
  if (!wins.length) return 0
  const wa = screen.getDisplayMatching(wins[0].getBounds()).workArea
  const cols = Math.ceil(Math.sqrt(wins.length))
  const rows = Math.ceil(wins.length / cols)
  const w = Math.floor(wa.width / cols)
  const h = Math.floor(wa.height / rows)
  wins.forEach((win, i) => {
    if (win.isMinimized()) win.restore()
    if (win.isMaximized()) win.unmaximize()
    win.setBounds({ x: wa.x + (i % cols) * w, y: wa.y + Math.floor(i / cols) * h, width: w, height: h })
  })
  return wins.length
}

function duplicateWindow(win) {
  const url = win && siteWins.has(win) && !win.isDestroyed() ? win.webContents.getURL() : ''
  if (url && /^https?:/i.test(url)) openSite(url, '')
  else createLauncher()
}

function actAll(k) {
  let n = 0
  for (const w of liveSiteWins()) {
    const wc = w.webContents
    if (!wc.isDestroyed() && tokens.has(wc.id)) {
      wc.send('gm:panel-act', { t: 'key', k })
      n++
    }
  }
  return n
}

function uiPrefs() {
  return { contextIsolation: true, sandbox: true, nodeIntegration: false, preload: path.join(__dirname, 'preload-ui.js') }
}
function sitePrefs() {
  return {
    partition: PARTITION,
    contextIsolation: true,
    sandbox: true,
    nodeIntegration: false,
    preload: path.join(__dirname, 'preload-site.js'),
  }
}

function createLockWindow() {
  lockWin = new BrowserWindow({
    width: 420,
    height: 460,
    resizable: false,
    maximizable: false,
    title: 'MT采集器 v' + app.getVersion() + ' - 验证密钥',
    backgroundColor: '#161616',
    autoHideMenuBar: true,
    webPreferences: uiPrefs(),
  })
  lockWin.setMenu(null)
  lockWin.loadFile(path.join(__dirname, 'lock.html'))
  lockWin.on('closed', () => {
    lockWin = null
    if (!unlocked) app.quit()
  })
}

function createLauncher() {
  if (launcherWin) return launcherWin.focus()
  launcherWin = new BrowserWindow({
    width: 980,
    height: 720,
    title: 'MT采集器 v' + app.getVersion() + '（脚本 v' + collector.version + '）',
    backgroundColor: '#161616',
    webPreferences: uiPrefs(),
  })
  launcherWin.loadFile(path.join(__dirname, 'launcher.html'))
  launcherWin.on('closed', () => (launcherWin = null))
}

function wireSiteWindow(win) {
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (!/^https?:/i.test(url)) return { action: 'deny' }
    return { action: 'allow', overrideBrowserWindowOptions: { width: 1400, height: 900, backgroundColor: '#ffffff', webPreferences: sitePrefs() } }
  })
  win.webContents.on('did-create-window', wireSiteWindow)
  const siteId = win.webContents.id
  const winId = win.id
  lastSite = win.webContents
  siteWins.add(win)
  winNo.set(winId, ++winSeq)
  win.on('page-title-updated', (e, title) => {
    e.preventDefault()
    win.setTitle('#' + winNo.get(winId) + ' ' + title)
    scheduleMenu()
  })
  win.on('closed', () => {
    siteWins.delete(win)
    winNo.delete(winId)
    if (!siteWins.size) winSeq = 0
    scheduleMenu()
  })
  scheduleMenu()
  win.on('focus', () => {
    if (!win.isDestroyed()) lastSite = win.webContents
  })
  win.webContents.on('destroyed', () => {
    tokens.delete(siteId)
    menuCommands.delete(siteId)
  })
  setupAutoAct(win)
}

// The collector panel renders inside the page exactly like the Tampermonkey script; launcher shortcuts drive it via IPC.
// Auto-start waits for redirects (e.g. temu.com -> temu.com/ca) to settle; any main-frame navigation restarts the countdown.
function setupAutoAct(win) {
  const site = win.webContents
  let autoAct = autoActFor.get(win.id) || ''
  autoActFor.delete(win.id)
  if (!autoAct) return
  let timer = null
  site.on('did-start-navigation', (details) => {
    const isMain = details && typeof details === 'object' ? details.isMainFrame && !details.isSameDocument : true
    if (isMain) clearTimeout(timer)
  })
  site.on('did-stop-loading', () => {
    if (!autoAct) return
    clearTimeout(timer)
    timer = setTimeout(() => {
      if (site.isDestroyed() || !tokens.has(site.id) || !autoAct) return
      const k = autoAct
      autoAct = ''
      site.send('gm:panel-act', { t: 'key', k })
    }, 3500)
  })
  win.on('closed', () => clearTimeout(timer))
}

const autoActFor = new Map()
const AUTO_ACTIONS = new Set(['here', 'start'])

function openSite(url, autoAct) {
  const wa = screen.getPrimaryDisplay().workArea
  const step = (siteWins.size % 8) * 32
  const width = Math.min(1400, wa.width)
  const height = Math.min(900, wa.height)
  const win = new BrowserWindow({
    x: wa.x + Math.min(step, Math.max(0, wa.width - width)),
    y: wa.y + Math.min(step, Math.max(0, wa.height - height)),
    width,
    height,
    backgroundColor: '#ffffff',
    webPreferences: sitePrefs(),
  })
  if (AUTO_ACTIONS.has(autoAct)) autoActFor.set(win.id, autoAct)
  wireSiteWindow(win)
  win.loadURL(url)
}

function bundledLingtuDir() {
  return app.isPackaged ? path.join(process.resourcesPath, 'extensions', 'lingtu') : path.join(__dirname, '..', 'extensions', 'lingtu')
}
function lingtuBaseDir() {
  return path.join(app.getPath('userData'), 'extensions')
}

// Installs a newer 灵图 from the Chrome Web Store; if none was loaded yet it takes effect at once, otherwise after restart.
async function updateLingtu(current) {
  try {
    fs.mkdirSync(lingtuBaseDir(), { recursive: true })
    const r = await downloadLingtu(lingtuBaseDir(), (u, o) => net.fetch(u, o), current && current.version)
    if (!r.dir) return
    if (!current) {
      await loadExtension(r.dir)
      reloadSitePages()
      notifyApp('灵图插件已安装', '灵图卖家辅助工具 v' + r.version + ' 已集成到网页窗口，悬浮球在页面左侧')
    } else {
      notifyApp('灵图插件有新版本', '已下载 v' + r.version + '，重启 MT采集器 后生效')
    }
  } catch (e) {
    console.warn('[lingtu] update failed:', e && e.message ? e.message : e)
  }
}

function notifyApp(title, body) {
  if (Notification.isSupported()) new Notification({ title, body }).show()
}

async function loadExtension(dir) {
  const ses = session.fromPartition(PARTITION)
  for (const ext of ses.extensions?.getAllExtensions?.() ?? ses.getAllExtensions()) {
    if (ext.path === dir) return ext
  }
  const loader = ses.extensions?.loadExtension ? ses.extensions : ses
  return loader.loadExtension(dir, { allowFileAccess: true })
}

async function pickExtension() {
  const win = BrowserWindow.getFocusedWindow()
  const res = await dialog.showOpenDialog(win, {
    title: '选择插件的解压目录（包含 manifest.json）',
    properties: ['openDirectory'],
  })
  if (res.canceled || !res.filePaths[0]) return
  const dir = res.filePaths[0]
  if (!fs.existsSync(path.join(dir, 'manifest.json'))) {
    return dialog.showErrorBox('不是插件目录', '该目录下没有 manifest.json，请选择插件解压后的根目录。')
  }
  try {
    const ext = await loadExtension(dir)
    const settings = readJson(settingsFile())
    settings.extensions = Array.from(new Set([...(settings.extensions || []), dir]))
    fs.writeFileSync(settingsFile(), JSON.stringify(settings))
    dialog.showMessageBox(win, { message: '已加载插件：' + ext.name, detail: '刷新已打开的网页后生效。' })
  } catch (e) {
    dialog.showErrorBox('加载插件失败', String(e && e.message ? e.message : e))
  }
}

function buildMenu() {
  const send = (name) => {
    const wc = BrowserWindow.getFocusedWindow()?.webContents
    if (wc && tokens.has(wc.id)) wc.send('gm:menu', name)
  }
  const scriptItems = Array.from(new Set([].concat(...Array.from(menuCommands.values(), (s) => Array.from(s)))))
  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      {
        label: '文件',
        submenu: [
          { label: '打开启动页', accelerator: 'CmdOrCtrl+Shift+H', click: () => unlocked && createLauncher() },
          { type: 'separator' },
          { role: 'quit', label: '退出' },
        ],
      },
      {
        label: '采集面板',
        submenu: scriptItems.length
          ? scriptItems.map((name) => ({ label: name, click: () => send(name) }))
          : [{ label: '（打开电商网页后可用）', enabled: false }],
      },
      { label: '插件', submenu: [{ label: '灵图卖家辅助工具：已内置并自动更新', enabled: false }, { type: 'separator' }, { label: '加载其他插件（解压目录）…', click: pickExtension }] },
      {
        label: '窗口',
        submenu: [
          { label: '新建窗口（复制当前网页）', accelerator: 'CmdOrCtrl+N', click: (_i, w) => unlocked && duplicateWindow(w) },
          { label: '平铺所有网页窗口', accelerator: 'CmdOrCtrl+Alt+T', click: tileSiteWindows },
          { type: 'separator' },
          { label: '所有窗口：只采当前页', click: () => actAll('here') },
          { label: '所有窗口：暂停 / 继续', click: () => actAll('pause') },
          { label: '所有窗口：结束任务', click: () => actAll('end') },
          { type: 'separator' },
          ...(windowList().length
            ? windowList().map((w) => ({
                label: '#' + w.no + ' ' + String(w.title).slice(0, 40),
                click: () => {
                  const win = BrowserWindow.fromId(w.id)
                  if (!win) return
                  if (win.isMinimized()) win.restore()
                  win.focus()
                },
              }))
            : [{ label: '（还没有打开网页窗口）', enabled: false }]),
          { type: 'separator' },
          { label: '关闭所有网页窗口', click: () => liveSiteWins().forEach((w) => w.close()) },
        ],
      },
      {
        label: '视图',
        submenu: [
          { label: '后退', accelerator: 'Alt+Left', click: (_i, w) => w?.webContents.navigationHistory.goBack() },
          { role: 'reload', label: '刷新' },
          { role: 'forceReload', label: '强制刷新' },
          { type: 'separator' },
          { role: 'zoomIn', label: '放大' },
          { role: 'zoomOut', label: '缩小' },
          { role: 'resetZoom', label: '实际大小' },
          { type: 'separator' },
          { role: 'toggleDevTools', label: '开发者工具' },
        ],
      },
      {
        label: '帮助',
        submenu: [
          { label: '检查更新（软件 + 采集脚本）…', click: () => checkAll(true) },
          { label: '打开下载页', click: () => shell.openExternal(RELEASE_PAGE) },
          { label: '打开数据文件夹', click: () => shell.openPath(app.getPath('userData')) },
          { type: 'separator' },
          {
            label: '关于 MT采集器',
            click: () => showBox({ type: 'info', message: 'MT采集器 v' + app.getVersion(), detail: '采集脚本 v' + collector.version + '\n数据目录：' + app.getPath('userData') }),
          },
        ],
      },
    ]),
  )
}

function checkToken(event, token) {
  return unlocked && tokens.get(event.sender.id) === token
}

function appHomeDir() {
  return path.join(app.getPath('desktop'), '采集')
}

function placePortableExeInAppHome() {
  const source = process.env.PORTABLE_EXECUTABLE_FILE
  if (!source || !fs.existsSync(source)) return
  try {
    const home = appHomeDir()
    const target = path.join(home, path.basename(source))
    if (path.resolve(source).toLowerCase() === path.resolve(target).toLowerCase()) return
    fs.mkdirSync(home, { recursive: true })
    const srcSize = fs.statSync(source).size
    if (fs.existsSync(target) && fs.statSync(target).size === srcSize) return
    fs.copyFileSync(source, target)
  } catch (err) {
    console.error('copy exe to desktop folder failed:', err)
  }
}

function safeTarget(name) {
  const base = app.getPath('downloads')
  const clean = String(name || 'download')
    .replace(/\\/g, '/')
    .split('/')
    .map((p) => p.replace(/[<>:"|?*\x00-\x1f]/g, '_').trim())
    .filter((p) => p && p !== '.' && p !== '..')
    .join(path.sep)
  let target = path.resolve(base, clean || 'download')
  if (!target.startsWith(base + path.sep)) throw new Error('非法文件名')
  fs.mkdirSync(path.dirname(target), { recursive: true })
  const ext = path.extname(target)
  const stem = target.slice(0, target.length - ext.length)
  for (let i = 1; fs.existsSync(target); i++) target = stem + ' (' + i + ')' + ext
  return target
}

let verifying = false

ipcMain.handle('ui:unlock', async (_e, key, remember) => {
  if (unlocked) return { ok: true }
  if (verifying || attempts >= MAX_ATTEMPTS) return { ok: false, message: '请稍候', left: MAX_ATTEMPTS - attempts }
  verifying = true
  try {
    const clean = String(key ?? '').trim()
    const r = await verifyOnline(clean)
    if (r.ok) {
      rememberKey(remember ? clean : '')
      enterApp(clean)
      return { ok: true, holder: r.holder }
    }
    if (r.offline) return { ok: false, offline: true, message: '无法连接授权服务器，请检查网络后重试', left: MAX_ATTEMPTS - attempts }
    attempts++
    const left = MAX_ATTEMPTS - attempts
    if (left <= 0) setTimeout(() => app.quit(), 1500)
    return { ok: false, message: REASONS[r.reason] || '密钥验证失败', left: Math.max(left, 0) }
  } finally {
    verifying = false
  }
})

ipcMain.handle('ui:auto-unlock', async () => {
  if (unlocked) return { ok: true }
  const key = recalledKey()
  if (!key) return { ok: false, none: true }
  const r = await verifyOnline(key)
  if (r.ok) {
    enterApp(key)
    return { ok: true, holder: r.holder }
  }
  if (!r.offline) rememberKey('')
  return { ok: false, offline: r.offline, message: r.offline ? '无法连接授权服务器，请检查网络' : REASONS[r.reason] || '已保存的密钥失效' }
})

ipcMain.on('ui:platforms', (e) => {
  e.returnValue = unlocked ? { version: collector.version, appVersion: app.getVersion(), platforms: collector.platforms } : null
})

const CFG_KEYS = new Set([
  'useAi', 'arkKey', 'arkModel', 'aiCheck', 'aiVision', 'handoff', 'clickGap', 'saveOriginal',
  'gender', 'colorMode', 'minSales', 'target', 'maxPages', 'pixelCheck', 'darkMin', 'lightMin', 'noPlain', 'printMin', 'printOne', 'printTwo', 'printMulti',
  'enterStore', 'storeCount', 'storeTarget', 'storeMinSales', 'schedule', 'dailyCap', 'reportTime', 'restEvery',
  'restMin', 'autoResume', 'beep', 'pushType', 'pushKey', 'imgDedupe',
  'userFirst', 'category', 'blackOnly', 'blackCount', 'whiteCount', 'kwScope', 'kwTranslate',
  'kwRandColor', 'kwRandCount', 'kwAutoRand', 'autoPick', 'skipWords', 'removeWords',
])
const CFG_OBJECT_KEYS = new Set(['sites', 'platKws', 'catKws'])
const PAGE_ACTIONS = new Set([
  'genKw', 'previewKw', 'randKw', 'recommend', 'testPush', 'report',
  'start', 'here', 'pause', 'end', 'csv', 'clear', 'clearSynced',
])

function isPlainData(v, depth = 0) {
  if (depth > 4) return false
  if (['boolean', 'number', 'string'].includes(typeof v)) return true
  if (!v || typeof v !== 'object' || Array.isArray(v)) return false
  return Object.values(v).every((x) => isPlainData(x, depth + 1))
}

let lastSite = null
function activeSite() {
  if (lastSite && !lastSite.isDestroyed() && tokens.has(lastSite.id)) return lastSite
  for (const w of BrowserWindow.getAllWindows()) {
    const wc = w.webContents
    if (!wc.isDestroyed() && tokens.has(wc.id)) return wc
  }
  return null
}

ipcMain.handle('ui:page-act', (_e, k) => {
  if (!unlocked || !PAGE_ACTIONS.has(k)) return { error: '不支持的操作' }
  const site = activeSite()
  if (!site) return { error: '请先在「开始采集」里打开一个平台网页，再点这个按钮' }
  site.send('gm:panel-act', { t: 'key', k })
  const win = BrowserWindow.fromWebContents(site)
  if (win && ['start', 'here', 'genKw', 'previewKw', 'recommend', 'report', 'csv'].includes(k)) win.focus()
  return { ok: true }
})

ipcMain.handle('ui:defaults', () => (unlocked ? { skip: collector.defaultSkip, remove: collector.defaultRemove } : null))

ipcMain.handle('ui:kw-hist', () => (unlocked ? (Array.isArray(values.kwHistory) ? values.kwHistory.length : 0) : 0))

ipcMain.handle('ui:kw-hist-clear', () => {
  if (!unlocked) return false
  values.kwHistory = []
  saveValues()
  reloadSitePages()
  return true
})

// The script reads cfg once at page load, so reload open collector pages; an active job resumes on its own.
let reloadTimer = null
function reloadSitePages() {
  clearTimeout(reloadTimer)
  reloadTimer = setTimeout(() => {
    for (const w of BrowserWindow.getAllWindows()) {
      const wc = w.webContents
      if (!wc.isDestroyed() && tokens.has(wc.id)) wc.reload()
    }
  }, 1500)
}

ipcMain.handle('ui:cfg-get', () => (unlocked ? values.cfg || {} : null))

ipcMain.handle('ui:cfg-set', (_e, patch) => {
  if (!unlocked || !patch || typeof patch !== 'object') return false
  const clean = {}
  for (const [k, v] of Object.entries(patch)) {
    if (CFG_OBJECT_KEYS.has(k)) {
      if (!isPlainData(v) || typeof v !== 'object' || JSON.stringify(v).length > 500000) return false
      clean[k] = v
      continue
    }
    if (!CFG_KEYS.has(k) || !['boolean', 'number', 'string'].includes(typeof v)) return false
    clean[k] = typeof v === 'string' ? v.slice(0, 50000) : v
  }
  values.cfg = { ...(values.cfg || {}), ...clean }
  saveValues()
  reloadSitePages()
  return true
})

ipcMain.handle('ui:db-info', () => {
  if (!unlocked) return null
  const len = (k) => (Array.isArray(values[k]) ? values[k].length : 0)
  return { synced: len('synced'), done: len('done'), hashes: len('hashes') }
})

ipcMain.handle('ui:db-export', async (e) => {
  if (!unlocked) return null
  const day = new Date().toISOString().slice(0, 10)
  const res = await dialog.showSaveDialog(BrowserWindow.fromWebContents(e.sender), {
    title: '备份去重库',
    defaultPath: path.join(appHomeDir(), '去重库-' + day + '.json'),
    filters: [{ name: 'JSON', extensions: ['json'] }],
  })
  if (res.canceled || !res.filePath) return null
  fs.mkdirSync(path.dirname(res.filePath), { recursive: true })
  fs.writeFileSync(
    res.filePath,
    JSON.stringify({ v: 1, exportedAt: new Date().toISOString(), synced: values.synced || [], done: values.done || [], hashes: values.hashes || [] }),
  )
  return { ok: true, file: res.filePath }
})

ipcMain.handle('ui:db-import', async (e) => {
  if (!unlocked) return null
  const res = await dialog.showOpenDialog(BrowserWindow.fromWebContents(e.sender), {
    title: '导入去重库',
    properties: ['openFile'],
    filters: [{ name: 'JSON', extensions: ['json'] }],
  })
  if (res.canceled || !res.filePaths[0]) return null
  let data
  try {
    data = JSON.parse(fs.readFileSync(res.filePaths[0], 'utf8'))
  } catch {
    return { error: '文件不是有效的去重库备份' }
  }
  if (!data || !Array.isArray(data.synced)) return { error: '文件不是有效的去重库备份' }
  const merge = (k) => Array.from(new Set([...(values[k] || []), ...(data[k] || []).map(String)]))
  values.synced = merge('synced')
  values.done = merge('done')
  const seen = new Set((values.hashes || []).map((x) => x && x.k))
  values.hashes = [...(values.hashes || []), ...(Array.isArray(data.hashes) ? data.hashes : []).filter((x) => x && x.h && !seen.has(x.k))]
  saveValues()
  reloadSitePages()
  return { ok: true }
})

ipcMain.handle('ui:open', (_e, url, autoAct) => {
  if (!unlocked) return false
  try {
    const u = new URL(String(url))
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return false
    openSite(u.toString(), typeof autoAct === 'string' ? autoAct : '')
    return true
  } catch {
    return false
  }
})

ipcMain.handle('ui:extension', () => unlocked && pickExtension())

ipcMain.handle('ui:app-prefs', () => {
  if (!unlocked) return null
  const s = readJson(settingsFile())
  return { autoUpdate: s.autoUpdate !== false, version: app.getVersion(), script: collector.version }
})
ipcMain.handle('ui:app-prefs-set', (_e, patch) => {
  if (!unlocked || !patch || typeof patch.autoUpdate !== 'boolean') return false
  patchSettings({ autoUpdate: patch.autoUpdate })
  scheduleUpdateChecks()
  return true
})
ipcMain.handle('ui:update-check', () => (unlocked ? checkAll(true) : null))
ipcMain.handle('ui:open-release', () => unlocked && shell.openExternal(RELEASE_PAGE))
ipcMain.handle('ui:windows', () => (unlocked ? windowList() : []))
ipcMain.handle('ui:win-focus', (_e, id) => {
  const win = unlocked && BrowserWindow.fromId(Number(id))
  if (!win || !siteWins.has(win)) return false
  if (win.isMinimized()) win.restore()
  win.focus()
  return true
})
ipcMain.handle('ui:win-tile', () => (unlocked ? tileSiteWindows() : 0))
ipcMain.handle('ui:act-all', (_e, k) => {
  if (!unlocked || !['here', 'pause', 'end'].includes(k)) return { error: '不支持的操作' }
  const n = actAll(k)
  return n ? { ok: true, n } : { error: '还没有打开任何平台网页' }
})

ipcMain.on('gm:bootstrap', (e) => {
  const url = e.senderFrame?.url || ''
  if (!unlocked || !MATCHERS.some((re) => re.test(url))) {
    e.returnValue = null
    return
  }
  const token = crypto.randomUUID()
  tokens.set(e.sender.id, token)
  menuCommands.set(e.sender.id, new Set())
  e.returnValue = { token, code: collector.code, name: collector.name, version: collector.version }
})

ipcMain.on('gm:get', (e, token, key) => {
  e.returnValue = checkToken(e, token) && Object.hasOwn(values, key) ? { has: true, value: values[key] } : { has: false }
})

ipcMain.on('gm:set', (e, token, key, value) => {
  if (!checkToken(e, token)) return
  values[key] = value
  saveValues()
  if ((key === 'cfg' || key === 'kwHistory') && launcherWin && !launcherWin.isDestroyed()) {
    launcherWin.webContents.send('ui:values-changed', key)
  }
})

ipcMain.on('gm:notify', (e, token, title, body) => {
  if (!checkToken(e, token) || !Notification.isSupported()) return
  new Notification({ title: String(title || '采集提醒'), body: String(body || '') }).show()
})

ipcMain.on('gm:menu-register', (e, token, name) => {
  if (!checkToken(e, token)) return
  menuCommands.get(e.sender.id)?.add(String(name))
  buildMenu()
})

ipcMain.handle('gm:xhr', async (e, token, opts) => {
  if (!checkToken(e, token)) return { error: 'denied' }
  const ses = session.fromPartition(PARTITION)
  const controller = new AbortController()
  const timer = opts.timeout ? setTimeout(() => controller.abort(), opts.timeout) : null
  try {
    const method = String(opts.method || 'GET').toUpperCase()
    const res = await ses.fetch(String(opts.url), {
      method,
      headers: opts.headers || {},
      body: method === 'GET' || method === 'HEAD' ? undefined : opts.data,
      signal: controller.signal,
      redirect: 'follow',
    })
    const headers = Array.from(res.headers, ([k, v]) => k + ': ' + v).join('\r\n')
    const base = { status: res.status, statusText: res.statusText, finalUrl: res.url, responseHeaders: headers }
    if (method === 'HEAD') return { ...base, text: '' }
    if (opts.binary) {
      return { ...base, bytes: new Uint8Array(await res.arrayBuffer()), contentType: res.headers.get('content-type') || '' }
    }
    return { ...base, text: await res.text() }
  } catch (err) {
    return { error: controller.signal.aborted ? 'timeout' : 'network', message: String(err && err.message) }
  } finally {
    clearTimeout(timer)
  }
})

ipcMain.handle('gm:save-bytes', (e, token, name, bytes) => {
  if (!checkToken(e, token)) return { error: 'denied' }
  try {
    fs.writeFileSync(safeTarget(name), Buffer.from(bytes))
    return { ok: true }
  } catch (err) {
    return { error: String(err && err.message) }
  }
})

ipcMain.handle('gm:download-url', async (e, token, url, name) => {
  if (!checkToken(e, token)) return { error: 'denied' }
  try {
    const res = await session.fromPartition(PARTITION).fetch(String(url))
    if (!res.ok) return { error: 'HTTP ' + res.status }
    fs.writeFileSync(safeTarget(name), Buffer.from(await res.arrayBuffer()))
    return { ok: true }
  } catch (err) {
    return { error: String(err && err.message) }
  }
})

app.on('second-instance', () => {
  const win = launcherWin || lockWin || BrowserWindow.getAllWindows()[0]
  if (win) {
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.whenReady().then(() => {
  if (!gotLock) return
  values = readJson(dataFile())
  placePortableExeInAppHome()
  session.fromPartition(PARTITION).on('will-download', (_e, item) => {
    try {
      item.setSavePath(safeTarget(item.getFilename()))
    } catch {
      item.cancel()
    }
  })
  buildMenu()
  createLockWindow()
})

app.on('window-all-closed', () => app.quit())
app.on('before-quit', flushValues)
