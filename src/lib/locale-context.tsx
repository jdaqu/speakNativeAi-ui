'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Locale, defaultLocale } from '@/i18n/config'
import { localeStorage } from './locale-storage'
import { NextIntlClientProvider } from 'next-intl'

interface LocaleContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale)
  const [messages, setMessages] = useState<Record<string, unknown>>({})
  const [isLoading, setIsLoading] = useState(true)

  // Load locale from storage on mount
  useEffect(() => {
    const storedLocale = localeStorage.getLocale()
    setLocaleState(storedLocale)
    loadMessages(storedLocale)
  }, [])

  const loadMessages = async (newLocale: Locale) => {
    setIsLoading(true)
    try {
      const msgs = await import(`../../messages/${newLocale}.json`)
      setMessages(msgs.default)
    } catch (error) {
      console.error('Failed to load messages:', error)
      // Fallback to default locale
      const msgs = await import(`../../messages/${defaultLocale}.json`)
      setMessages(msgs.default)
    } finally {
      setIsLoading(false)
    }
  }

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localeStorage.setLocale(newLocale)
    loadMessages(newLocale)
  }

  if (isLoading) {
    return null // or a loading spinner
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }
  return context
}
