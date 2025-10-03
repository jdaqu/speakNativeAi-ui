declare global {
  interface Window {
    electronAPI?: {
      hideQuickAccess: () => Promise<void>
      showMainWindow: () => Promise<void>
      getPlatform: () => Promise<string>
      getShortcut: () => Promise<string>
      isElectron: boolean
      getApiBaseUrl: () => string
      getSharedToken: () => Promise<string | null>
      setSharedToken: (token: string) => Promise<boolean>
      removeSharedToken: () => Promise<boolean>
    }
  }
}

export {}
