'use client'

import { useState, useRef, useEffect } from 'react'
import { useLocale } from '@/lib/locale-context'
import { locales, localeNames, Locale } from '@/i18n/config'
import { Button } from './primitives/button'
import { Globe, Check, ChevronDown } from 'lucide-react'

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale)
    setIsOpen(false)
  }

  // Flag emojis for each language
  const localeFlags: Record<Locale, string> = {
    en: '🇬🇧',
    es: '🇪🇸'
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 min-w-[120px] justify-between hover:bg-gray-50 transition-colors"
        title="Change language"
      >
        <div className="flex items-center space-x-2">
          <Globe className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">{localeFlags[locale]} {localeNames[locale]}</span>
        </div>
        <ChevronDown className={`h-3 w-3 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Select Language</p>
          </div>
          {locales.map((loc) => (
            <button
              key={loc}
              onClick={() => handleLocaleChange(loc)}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                locale === loc ? 'bg-primary/5' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{localeFlags[loc]}</span>
                <span className={`font-medium ${locale === loc ? 'text-primary' : 'text-gray-700'}`}>
                  {localeNames[loc]}
                </span>
              </div>
              {locale === loc && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Compact version for mobile or tight spaces
export function LanguageSwitcherCompact() {
  const { locale, setLocale } = useLocale()

  const toggleLocale = () => {
    const currentIndex = locales.indexOf(locale)
    const nextIndex = (currentIndex + 1) % locales.length
    setLocale(locales[nextIndex])
  }

  const localeFlags: Record<Locale, string> = {
    en: '🇬🇧',
    es: '🇪🇸'
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLocale}
      className="flex items-center space-x-1.5 px-2 hover:bg-gray-50 transition-colors"
      title={`Switch to ${localeNames[locales.find(l => l !== locale) || locales[0]]}`}
    >
      <span className="text-lg">{localeFlags[locale]}</span>
      <span className="text-sm font-medium hidden sm:inline">{localeNames[locale]}</span>
    </Button>
  )
}

// Icon-only version for minimal UI
export function LanguageSwitcherIcon() {
  const { locale, setLocale } = useLocale()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale)
    setIsOpen(false)
  }

  const localeFlags: Record<Locale, string> = {
    en: '🇬🇧',
    es: '🇪🇸'
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        title="Change language"
      >
        <Globe className="h-5 w-5 text-gray-600" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {locales.map((loc) => (
            <button
              key={loc}
              onClick={() => handleLocaleChange(loc)}
              className={`w-full flex items-center space-x-3 px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                locale === loc ? 'bg-primary/5' : ''
              }`}
            >
              <span className="text-xl">{localeFlags[loc]}</span>
              <span className={`font-medium ${locale === loc ? 'text-primary' : 'text-gray-700'}`}>
                {localeNames[loc]}
              </span>
              {locale === loc && (
                <Check className="h-4 w-4 text-primary ml-auto" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
