/**
 * Google Analytics 4 Event Tracking Utility
 * 
 * This module provides functions to track custom events in GA4.
 * All tracking is conditional - it only works in web mode, not in Electron.
 */

// Check if we're in Electron mode
const isElectron = typeof window !== 'undefined' && 
  !!(window as unknown as { electronAPI?: { isElectron?: boolean } }).electronAPI?.isElectron;

// Type declaration for window with gtag
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

// Check if GA4 is available (gtag function exists)
const isGA4Available = (): boolean => {
  if (isElectron) return false;
  if (typeof window === 'undefined') return false;
  return typeof window.gtag === 'function';
};

/**
 * Track a custom event in Google Analytics 4
 * 
 * @param eventName - The name of the event (e.g., 'user_registered', 'feature_used')
 * @param eventParams - Optional parameters to send with the event
 */
export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, string | number | boolean>
): void => {
  if (!isGA4Available()) {
    // Silently fail in Electron or if GA4 is not loaded
    return;
  }

  try {
    if (window.gtag) {
      window.gtag('event', eventName, eventParams || {});
    }
  } catch (error) {
    // Silently fail - don't break the app if analytics fails
    console.warn('Analytics tracking failed:', error);
  }
};

/**
 * Track user registration event
 */
export const trackRegistration = (method: 'email' | 'google' = 'email'): void => {
  trackEvent('user_registered', {
    registration_method: method,
  });
};

/**
 * Track user login event
 */
export const trackLogin = (method: 'email' | 'google' = 'email'): void => {
  trackEvent('user_login', {
    login_method: method,
  });
};

/**
 * Track dashboard feature usage
 */
export const trackFeatureUsage = (featureName: 'fix' | 'translate' | 'define'): void => {
  trackEvent('feature_used', {
    feature_name: featureName,
  });
};

/**
 * Track email verification event
 */
export const trackEmailVerification = (status: 'success' | 'error'): void => {
  trackEvent('email_verified', {
    verification_status: status,
  });
};

