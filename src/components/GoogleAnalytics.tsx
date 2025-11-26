'use client'

import { GoogleAnalytics } from '@next/third-parties/google'
import { useEffect, useState } from 'react'

/**
 * Google Analytics 4 Component
 * Only loads GA4 in web mode, not in Electron builds
 */
export function GoogleAnalyticsWrapper() {
  const [shouldLoad, setShouldLoad] = useState(false)
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  useEffect(() => {
    // Check if we're in Electron mode
    const isElectron = typeof window !== 'undefined' && 
      !!(window as unknown as { electronAPI?: { isElectron?: boolean } }).electronAPI?.isElectron
    
    // Only load GA4 if:
    // 1. We have a measurement ID
    // 2. We're NOT in Electron mode
    // 3. We're in the browser (not SSR)
    if (measurementId && !isElectron && typeof window !== 'undefined') {
      setShouldLoad(true)
    }
  }, [measurementId])

  if (!shouldLoad || !measurementId) {
    return null
  }

  return <GoogleAnalytics gaId={measurementId} />
}

