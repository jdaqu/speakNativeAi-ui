import Cookies from 'js-cookie'
import { isElectron, isBrowser } from './environment'

/**
 * Universal storage utility that works for both web and Electron apps
 * - Web: Uses cookies (works with SSR)
 * - Electron: Uses shared storage via IPC (works across all windows)
 */

// In-memory cache for Electron token to avoid repeated IPC calls
let electronTokenCache: string | null = null

export const storage = {
  getToken: async (): Promise<string | null> => {
    if (!isBrowser()) return null

    if (isElectron()) {
      // Check if we have electronAPI available
      if (typeof window !== 'undefined' && (window as any).electronAPI?.getSharedToken) {
        // Use cached value if available
        if (electronTokenCache !== null) {
          return electronTokenCache
        }
        // Get token from shared storage via IPC
        const token = await (window as any).electronAPI.getSharedToken()
        electronTokenCache = token
        return token
      }
      // Fallback to localStorage if IPC not available
      return localStorage.getItem('access_token')
    } else {
      // Use cookies for web (SSR compatible)
      return Cookies.get('access_token') || null
    }
  },

  // Synchronous version for backward compatibility
  getTokenSync: (): string | null => {
    if (!isBrowser()) return null

    if (isElectron()) {
      // Return cached value for Electron
      if (electronTokenCache !== null) {
        return electronTokenCache
      }
      // Fallback to localStorage
      return localStorage.getItem('access_token')
    } else {
      // Use cookies for web
      return Cookies.get('access_token') || null
    }
  },

  setToken: async (token: string): Promise<void> => {
    if (!isBrowser()) return

    if (isElectron()) {
      // Update cache
      electronTokenCache = token
      // Check if we have electronAPI available
      if (typeof window !== 'undefined' && (window as any).electronAPI?.setSharedToken) {
        // Use shared storage via IPC
        await (window as any).electronAPI.setSharedToken(token)
      }
      // Also set in localStorage as fallback
      localStorage.setItem('access_token', token)
    } else {
      // Use cookies for web
      Cookies.set('access_token', token)
    }
  },

  removeToken: async (): Promise<void> => {
    if (!isBrowser()) return

    if (isElectron()) {
      // Clear cache
      electronTokenCache = null
      // Check if we have electronAPI available
      if (typeof window !== 'undefined' && (window as any).electronAPI?.removeSharedToken) {
        // Remove from shared storage via IPC
        await (window as any).electronAPI.removeSharedToken()
      }
      // Also remove from localStorage
      localStorage.removeItem('access_token')
    } else {
      // Use cookies for web
      Cookies.remove('access_token')
    }
  }
}