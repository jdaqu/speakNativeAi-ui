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

    if (isElectron()) {
      // Electron: Use static HTML paths with proper base URL
      const cleanRoute = route.replace(/^\//, '') // Remove leading slash

      // Get the base path (the directory containing the current HTML file)
      const currentPath = window.location.pathname
      const basePath = currentPath.substring(0, currentPath.lastIndexOf('/'))

      if (cleanRoute === '' || cleanRoute === '/') {
        window.location.href = `${basePath}/index.html`
      } else {
        window.location.href = `${basePath}/${cleanRoute}/index.html`
      }
    } else {
      // Web: Use standard Next.js routes
      window.location.href = route
    }
  },

  /**
   * Get the correct href for a link based on environment
   */
  getHref: (route: string): string => {
    if (typeof window === 'undefined') return route

    if (isElectron()) {
      // Electron: Use static HTML paths with proper base URL
      const cleanRoute = route.replace(/^\//, '')

      // Get the base path
      const currentPath = window.location.pathname
      const basePath = currentPath.substring(0, currentPath.lastIndexOf('/'))

      if (cleanRoute === '' || cleanRoute === '/') {
        return `${basePath}/index.html`
      }
      return `${basePath}/${cleanRoute}/index.html`
    } else {
      // Web: Use standard Next.js routes
      return route
    }
  }
}