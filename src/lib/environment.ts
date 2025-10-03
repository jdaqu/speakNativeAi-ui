/**
 * Environment detection utilities
 */

export const isElectron = (): boolean => {
  if (typeof window === 'undefined') return false

  // Check for Electron userAgent
  const userAgent = window.navigator.userAgent.toLowerCase()
  if (userAgent.includes('electron')) return true

  // Check for Electron process
  // @ts-ignore
  if (window.process && window.process.type === 'renderer') return true

  // Check for file protocol (static Electron app)
  if (window.location.protocol === 'file:') return true

  return false
}

export const isWeb = (): boolean => {
  return !isElectron()
}

export const isBrowser = (): boolean => {
  return typeof window !== 'undefined'
}