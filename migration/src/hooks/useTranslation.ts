'use client'

import { createContext, useContext, ReactNode } from 'react'

type Dictionary = {
    [key: string]: any
}

type TranslationContextType = {
    dict: Dictionary
    lang: string
}

const TranslationContext = createContext<TranslationContextType | null>(null)

export function TranslationProvider({
    children,
    dict,
    lang
}: {
    children: ReactNode
    dict: Dictionary
    lang: string
}) {
    return (
        <TranslationContext.Provider value= {{ dict, lang }
}>
    { children }
    </TranslationContext.Provider>
  )
}

export function useTranslation() {
    const context = useContext(TranslationContext)
    if (!context) {
        throw new Error('useTranslation must be used within a TranslationProvider')
    }

    const { dict, lang } = context

    const t = (key: string, values?: Record<string, string | number>) => {
        const keys = key.split('.')
        let value = dict

        for (const k of keys) {
            value = value?.[k]
        }

        if (typeof value !== 'string') {
            console.warn(`Translation key "${key}" not found`)
            return key
        }

        if (values) {
            return value.replace(/\{(\w+)\}/g, (match, varName) => {
                return values[varName]?.toString() || match
            })
        }

        return value
    }

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
