'use client'

import React, { createContext, useContext, ReactNode, useMemo } from 'react'

type Dictionary = Record<string, string | Record<string, unknown>>

type TranslationContextType = {
  dict: Dictionary
  lang: string
}

const TranslationContext = createContext<TranslationContextType | null>(null)

interface TranslationProviderProps {
  children: ReactNode
  dict: Dictionary
  lang: string
}

export const TranslationProvider = ({ 
  children, 
  dict, 
  lang 
}: TranslationProviderProps) => {
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
    const keys = key.split('.')
    let value: unknown = dict
    
    for (const k of keys) {
      value = (value as Record<string, unknown>)?.[k]
    }
    
    if (typeof value !== 'string') {
      console.warn(`Translation key "${key}" not found`)
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
    return dateObj.toLocaleDateString(lang, options)
  }

  const formatNumber = (value: number, options?: Intl.NumberFormatOptions) => {
    return value.toLocaleString(lang, options)
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
