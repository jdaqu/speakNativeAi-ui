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
      openGoogleLogin: (apiBaseUrl: string) => Promise<boolean>
      onOAuthCallback: (callback: (data: { success: boolean; accessToken?: string; error?: string }) => void) => void
      removeOAuthListener: () => void
    }
  }
}

export {}
