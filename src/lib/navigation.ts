import { isElectron } from './environment'

/**
 * Navigation utilities that work for both web and Electron apps
 */

export const navigation = {
  /**
   * Navigate to a route - uses correct path format based on environment
   */
  goto: (route: string) => {
    if (typeof window === 'undefined') return

    // Important distinction:
    // - In packaged Electron (file:// protocol), we must navigate to static HTML files
    // - In Electron dev (http:// protocol via Next.js dev server), use normal Next.js routes
    const isFileProtocol = window.location.protocol === 'file:'

    if (isElectron() && isFileProtocol) {
      // Packaged Electron: Use static HTML paths relative to current HTML file
      const cleanRoute = route.replace(/^\//, '') // Remove leading slash

      const currentPath = window.location.pathname
      const basePath = currentPath.substring(0, currentPath.lastIndexOf('/'))

      if (cleanRoute === '' || cleanRoute === '/') {
        window.location.href = `${basePath}/index.html`
      } else {
        window.location.href = `${basePath}/${cleanRoute}/index.html`
      }
      return
    }

    // Web or Electron dev server: standard Next.js route navigation
    window.location.href = route
  },

  /**
   * Get the correct href for a link based on environment
   */
  getHref: (route: string): string => {
    if (typeof window === 'undefined') return route

    const isFileProtocol = window.location.protocol === 'file:'

    if (isElectron() && isFileProtocol) {
      // Packaged Electron: return static HTML paths
      const cleanRoute = route.replace(/^\//, '')
      const currentPath = window.location.pathname
      const basePath = currentPath.substring(0, currentPath.lastIndexOf('/'))

      if (cleanRoute === '' || cleanRoute === '/') {
        return `${basePath}/index.html`
      }
      return `${basePath}/${cleanRoute}/index.html`
    }

    // Web or Electron dev server
    return route
  }
}
