const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('desktop', {
  unlock: (key, remember) => ipcRenderer.invoke('ui:unlock', key, Boolean(remember)),
  autoUnlock: () => ipcRenderer.invoke('ui:auto-unlock'),
  platforms: () => ipcRenderer.sendSync('ui:platforms'),
  open: (url) => ipcRenderer.invoke('ui:open', url),
  loadExtension: () => ipcRenderer.invoke('ui:extension'),
  getCfg: () => ipcRenderer.invoke('ui:cfg-get'),
  setCfg: (patch) => ipcRenderer.invoke('ui:cfg-set', patch),
  dbInfo: () => ipcRenderer.invoke('ui:db-info'),
  dbExport: () => ipcRenderer.invoke('ui:db-export'),
  dbImport: () => ipcRenderer.invoke('ui:db-import'),
})
