const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('desktop', {
  unlock: (key) => ipcRenderer.invoke('ui:unlock', key),
  platforms: () => ipcRenderer.sendSync('ui:platforms'),
  open: (url) => ipcRenderer.invoke('ui:open', url),
  loadExtension: () => ipcRenderer.invoke('ui:extension'),
})
