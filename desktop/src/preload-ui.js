const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('desktop', {
  unlock: (key, remember) => ipcRenderer.invoke('ui:unlock', key, Boolean(remember)),
  autoUnlock: () => ipcRenderer.invoke('ui:auto-unlock'),
  platforms: () => ipcRenderer.sendSync('ui:platforms'),
  open: (url) => ipcRenderer.invoke('ui:open', url),
  loadExtension: () => ipcRenderer.invoke('ui:extension'),
})
