import { Locale, defaultLocale } from '@/i18n/config'
import Cookies from 'js-cookie'

const LOCALE_COOKIE_KEY = 'NEXT_LOCALE'

export const localeStorage = {
  getLocale: (): Locale => {
    if (typeof window === 'undefined') return defaultLocale
    const stored = Cookies.get(LOCALE_COOKIE_KEY)
    return (stored as Locale) || defaultLocale
  },

  setLocale: (locale: Locale) => {
    Cookies.set(LOCALE_COOKIE_KEY, locale, { expires: 365 })
  }
}
