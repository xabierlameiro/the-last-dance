'use client'

import { createContext, useContext, ReactNode, useMemo } from 'react'

type Dictionary = Record<string, any>

type TranslationContextType = {
  dict: Dictionary
  lang: string
}

const TranslationContext = createContext<TranslationContextType | null>(null)

interface TranslationProviderProps {
  readonly children: ReactNode
  readonly dict: Dictionary
  readonly lang: string
}

export function TranslationProvider({ children, dict, lang }: TranslationProviderProps) {
  const value = useMemo(() => ({ dict, lang }), [dict, lang])
  
  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(TranslationContext)
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider')
  }

  const { dict, lang } = context

  const t = (key: string, values?: Record<string, string | number>): string => {
    // First try direct access (for flattened keys like 'viewCounter.users.error')
    if (dict.hasOwnProperty(key)) {
      const value = dict[key]
      if (typeof value === 'string') {
        if (values) {
          return value.replace(/\{(\w+)\}/g, (match: string, varName: string) => {
            return values[varName]?.toString() || match
          })
        }
        return value
      }
    }
    
    // Fallback to nested access (for nested object keys)
    const keys = key.split('.')
    let value: any = dict
    
    for (const k of keys) {
      value = value?.[k]
    }
    
    if (typeof value !== 'string') {
      console.warn(`Translation key "${key}" not found`, { dict, keys, value })
      return key
    }

    if (values) {
      return value.replace(/\{(\w+)\}/g, (match: string, varName: string) => {
        return values[varName]?.toString() || match
      })
    }

    return value
  }

  // Compatibilidad con react-intl
  const formatMessage = ({ id }: { id: string }, values?: Record<string, string | number>) => {
    return t(id, values)
  }

  const formatDate = (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => {
    const dateObj = new Date(date)
    // Map custom locales to standard ones
    const localeMap: Record<string, string> = {
      'gl': 'es-ES', // Gallego maps to Spanish
      'es': 'es-ES',
      'en': 'en-US'
    }
    const locale = localeMap[lang] || 'en-US'
    return dateObj.toLocaleDateString(locale, options)
  }

  const formatNumber = (value: number, options?: Intl.NumberFormatOptions) => {
    // Map custom locales to standard ones
    const localeMap: Record<string, string> = {
      'gl': 'es-ES', // Gallego maps to Spanish
      'es': 'es-ES',
      'en': 'en-US'
    }
    const locale = localeMap[lang] || 'en-US'
    return value.toLocaleString(locale, options)
  }

  return {
    t,
    formatMessage,
    formatDate,
    formatNumber,
    lang,
    dict
  }
}
