const { app, BrowserWindow, WebContentsView, ipcMain, session, Notification, Menu, dialog, net, safeStorage } = require('electron')
const path = require('node:path')
const fs = require('node:fs')
const os = require('node:os')
const crypto = require('node:crypto')
const collector = require('./generated/collector.json')

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

if (!app.requestSingleInstanceLock()) app.quit()

app.userAgentFallback = app.userAgentFallback
  .split(' ')
  .filter((t) => !/^(Electron|tm-collector|爆款图案采集器)\//i.test(t))
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
  const settings = readJson(settingsFile())
  Promise.allSettled((settings.extensions || []).map(loadExtension)).finally(() => {
    createLauncher()
    lockWin?.close()
  })
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
    title: '爆款图案采集器 - 验证密钥',
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
    title: '爆款图案采集器 v' + collector.version,
    backgroundColor: '#161616',
    webPreferences: uiPrefs(),
  })
  launcherWin.loadFile(path.join(__dirname, 'launcher.html'))
  launcherWin.on('closed', () => (launcherWin = null))
}

function wireSiteWindow(win) {
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (!/^https?:/i.test(url)) return { action: 'deny' }
    return { action: 'allow', overrideBrowserWindowOptions: { width: 1400, height: 900, webPreferences: sitePrefs() } }
  })
  win.webContents.on('did-create-window', wireSiteWindow)
  const siteId = win.webContents.id
  win.webContents.on('destroyed', () => {
    tokens.delete(siteId)
    menuCommands.delete(siteId)
    panels.delete(siteId)
  })
  attachPanel(win)
}

// The collector panel is a native view docked on the right of each site window; the page no longer shows it.
const PANEL_WIDTH = 360
const PANEL_COLLAPSED_HEIGHT = 46
const panels = new Map()
const panelOwners = new Map()

function attachPanel(win) {
  const view = new WebContentsView({
    webPreferences: { contextIsolation: true, sandbox: true, nodeIntegration: false, preload: path.join(__dirname, 'preload-panel.js') },
  })
  view.setBackgroundColor('#161616')
  view.setVisible(false)
  win.contentView.addChildView(view)
  view.webContents.loadFile(path.join(__dirname, 'panel.html'))
  const site = win.webContents
  const state = { view, win, collapsed: false, ready: false }
  panels.set(site.id, state)
  panelOwners.set(view.webContents.id, site)

  const layout = () => {
    if (win.isDestroyed()) return
    const [w, h] = win.getContentSize()
    const width = Math.min(PANEL_WIDTH, w)
    view.setBounds({ x: w - width, y: 0, width, height: state.collapsed ? Math.min(PANEL_COLLAPSED_HEIGHT, h) : h })
  }
  state.layout = layout
  layout()
  win.on('resize', layout)
  view.webContents.once('did-finish-load', () => (state.ready = true))
  site.on('did-start-navigation', (details) => {
    const isMain = details && typeof details === 'object' ? details.isMainFrame && !details.isSameDocument : true
    if (!isMain) return
    view.setVisible(false)
    if (state.ready) view.webContents.send('panel:reset')
  })
  win.on('closed', () => {
    panelOwners.delete(view.webContents.id)
    if (!view.webContents.isDestroyed()) view.webContents.close()
  })
}

ipcMain.on('gm:panel-push', (e, token, snap) => {
  if (!checkToken(e, token) || typeof snap !== 'string') return
  const state = panels.get(e.sender.id)
  if (!state || state.win.isDestroyed()) return
  state.view.webContents.send('panel:snapshot', snap)
  if (!state.view.getVisible()) {
    state.view.setVisible(true)
    state.layout()
  }
})

ipcMain.on('panel:act', (e, msg) => {
  const site = panelOwners.get(e.sender.id)
  if (!unlocked || !site || site.isDestroyed() || !tokens.has(site.id) || !msg || typeof msg !== 'object') return
  site.send('gm:panel-act', msg)
})

ipcMain.on('panel:collapse', (e, on) => {
  const site = panelOwners.get(e.sender.id)
  const state = site && panels.get(site.id)
  if (!state) return
  state.collapsed = !!on
  state.layout()
})

function openSite(url) {
  const win = new BrowserWindow({ width: 1400, height: 900, backgroundColor: '#ffffff', webPreferences: sitePrefs() })
  wireSiteWindow(win)
  win.loadURL(url)
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
    title: '选择灵图插件的解压目录（包含 manifest.json）',
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
      { label: '插件', submenu: [{ label: '加载灵图插件（解压目录）…', click: pickExtension }] },
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
  e.returnValue = unlocked ? { version: collector.version, platforms: collector.platforms } : null
})

ipcMain.handle('ui:open', (_e, url) => {
  if (!unlocked) return false
  try {
    const u = new URL(String(url))
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return false
    openSite(u.toString())
    return true
  } catch {
    return false
  }
})

ipcMain.handle('ui:extension', () => unlocked && pickExtension())

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
