const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('panelApi', {
  onSnapshot: (cb) => ipcRenderer.on('panel:snapshot', (_e, snap) => cb(snap)),
  onReset: (cb) => ipcRenderer.on('panel:reset', () => cb()),
  act: (msg) => ipcRenderer.send('panel:act', msg),
  collapse: (on) => ipcRenderer.send('panel:collapse', !!on),
})
