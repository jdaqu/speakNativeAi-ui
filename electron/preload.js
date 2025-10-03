const { contextBridge, ipcRenderer } = require('electron')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Quick access window controls
  hideQuickAccess: () => ipcRenderer.invoke('hide-quick-access'),
  showMainWindow: () => ipcRenderer.invoke('show-main-window'),

  // Platform info
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  getShortcut: () => ipcRenderer.invoke('get-shortcut'),

  // Check if running in Electron
  isElectron: true,

  // API base URL for Electron
  getApiBaseUrl: () => 'https://speaknativeai-api-production.up.railway.app/api',

  // Shared token storage (accessible across all windows)
  getSharedToken: () => ipcRenderer.invoke('get-shared-token'),
  setSharedToken: (token) => ipcRenderer.invoke('set-shared-token', token),
  removeSharedToken: () => ipcRenderer.invoke('remove-shared-token')
}) 