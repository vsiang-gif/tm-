const { app, BrowserWindow, ipcMain, session, Notification, Menu, dialog } = require('electron')
const path = require('node:path')
const fs = require('node:fs')
const crypto = require('node:crypto')
const collector = require('./generated/collector.json')

// SHA-256 of the access key; the plain key is never stored in the app.
const KEY_HASH = '49474e012d3b4a6cfceef6c1bb6f12df475f0efe9ce24903bc6d09d3e4d3eab0'
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

function keyMatches(input) {
  const hash = crypto.createHash('sha256').update(String(input ?? '').trim()).digest()
  return crypto.timingSafeEqual(hash, Buffer.from(KEY_HASH, 'hex'))
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
  win.webContents.on('destroyed', () => {
    tokens.delete(win.webContents.id)
    menuCommands.delete(win.webContents.id)
  })
}

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

function outputDir() {
  const dir = path.join(app.getPath('desktop'), '采集')
  fs.mkdirSync(dir, { recursive: true })
  return dir
}

function safeTarget(name) {
  const base = outputDir()
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

ipcMain.handle('ui:unlock', (_e, key) => {
  if (unlocked) return { ok: true }
  if (keyMatches(key)) {
    unlocked = true
    const settings = readJson(settingsFile())
    Promise.allSettled((settings.extensions || []).map(loadExtension)).finally(() => {
      createLauncher()
      lockWin?.close()
    })
    return { ok: true }
  }
  attempts++
  const left = MAX_ATTEMPTS - attempts
  if (left <= 0) setTimeout(() => app.quit(), 1200)
  return { ok: false, left: Math.max(left, 0) }
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
