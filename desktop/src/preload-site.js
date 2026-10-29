const { contextBridge, ipcRenderer, webFrame } = require('electron')

const boot = ipcRenderer.sendSync('gm:bootstrap')

if (boot) {
  // Every bridge call carries the per-window token, so other page scripts cannot drive the privileged APIs.
  contextBridge.exposeInMainWorld('__tmBridge', {
    get: (t, k) => ipcRenderer.sendSync('gm:get', t, k),
    set: (t, k, v) => ipcRenderer.send('gm:set', t, k, v),
    xhr: (t, o) => ipcRenderer.invoke('gm:xhr', t, o),
    saveBytes: (t, n, b) => ipcRenderer.invoke('gm:save-bytes', t, n, b),
    downloadUrl: (t, u, n) => ipcRenderer.invoke('gm:download-url', t, u, n),
    notify: (t, title, body) => ipcRenderer.send('gm:notify', t, title, body),
    registerMenu: (t, n) => ipcRenderer.send('gm:menu-register', t, n),
    panelPush: (t, s) => ipcRenderer.send('gm:panel-push', t, s),
  })

  ipcRenderer.on('gm:menu', (_e, name) => {
    webFrame.executeJavaScript('window.__tmRunMenu && window.__tmRunMenu(' + JSON.stringify(name) + ')')
  })

  // userGesture=true so panel clicks can open confirm dialogs and file pickers like a real click would.
  ipcRenderer.on('gm:panel-act', (_e, msg) => {
    webFrame.executeJavaScript(
      'window.__tmRunPanel && window.__tmRunPanel(' + JSON.stringify(boot.token) + ',' + JSON.stringify(msg) + ')',
      true,
    )
  })

  const shim = [
    '(function () {',
    'var __b = window.__tmBridge, __t = ' + JSON.stringify(boot.token) + ';',
    'var unsafeWindow = window;',
    'var GM_info = { script: { name: ' + JSON.stringify(boot.name) + ', version: ' + JSON.stringify(boot.version) + ' }, scriptHandler: "TM Collector Desktop" };',
    'function GM_getValue(k, d) { var r = __b.get(__t, k); return r && r.has ? r.value : d; }',
    'function GM_setValue(k, v) { __b.set(__t, k, v); }',
    'function GM_notification(o, t) { var x = typeof o === "string" ? { text: o, title: t } : (o || {}); __b.notify(__t, x.title, x.text); }',
    'var __menus = {};',
    'window.__tmRunMenu = function (n) { if (__menus[n]) __menus[n](); };',
    'function GM_registerMenuCommand(n, fn) { __menus[n] = fn; __b.registerMenu(__t, n); return n; }',
    'var __panelAct = null;',
    'function TM_panelPush(s) { __b.panelPush(__t, s); }',
    'function TM_onPanelAct(fn) { __panelAct = fn; }',
    'window.__tmRunPanel = function (tok, m) { if (tok === __t && __panelAct) __panelAct(m); };',
    'function GM_xmlhttpRequest(o) {',
    '  var aborted = false, rt = o.responseType || "";',
    '  var data = o.data == null ? undefined : (typeof o.data === "string" ? o.data : String(o.data));',
    '  __b.xhr(__t, { method: o.method || "GET", url: String(new URL(o.url, location.href)), headers: o.headers || {}, data: data, timeout: o.timeout || 0, binary: rt === "blob" || rt === "arraybuffer" }).then(function (r) {',
    '    if (aborted) return;',
    '    if (r.error) { var cb = r.error === "timeout" ? o.ontimeout : o.onerror; if (cb) cb({ error: r.message || r.error, status: 0 }); return; }',
    '    var resp = { status: r.status, statusText: r.statusText, finalUrl: r.finalUrl, responseHeaders: r.responseHeaders, readyState: 4, responseText: "" };',
    '    if (r.bytes) { resp.response = rt === "blob" ? new Blob([r.bytes], { type: r.contentType }) : r.bytes.buffer; }',
    '    else { resp.responseText = r.text; resp.response = r.text; if (rt === "json") { try { resp.response = JSON.parse(r.text); } catch (e) { resp.response = null; } } }',
    '    if (o.onload) o.onload(resp);',
    '  }, function (e) { if (!aborted && o.onerror) o.onerror({ error: String(e) }); });',
    '  return { abort: function () { aborted = true; if (o.onabort) o.onabort(); } };',
    '}',
    'function GM_download(a, b) {',
    '  var o = typeof a === "string" ? { url: a, name: b } : a;',
    '  var p = /^(blob|data):/i.test(o.url)',
    '    ? fetch(o.url).then(function (r) { return r.arrayBuffer(); }).then(function (buf) { return __b.saveBytes(__t, o.name, new Uint8Array(buf)); })',
    '    : __b.downloadUrl(__t, String(new URL(o.url, location.href)), o.name);',
    '  p.then(function (r) { if (r && r.error) { if (o.onerror) o.onerror({ error: r.error }); } else if (o.onload) o.onload({}); },',
    '    function (e) { if (o.onerror) o.onerror({ error: String(e) }); });',
    '}',
  ].join('\n')

  const inject = () => {
    webFrame.executeJavaScript(shim + '\n' + boot.code + '\n})();').catch((e) => console.error('[collector] inject failed', e))
  }
  if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', inject, { once: true })
  else inject()
}
