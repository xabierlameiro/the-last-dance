'use client'

import { ReactNode } from 'react'
import { DialogProvider } from '@/context/dialog'
import { TranslationProvider } from '@/hooks/useTranslationSimple'
import Layout from '@/components/Layout'

type Props = {
  readonly children: ReactNode
  readonly dict?: any
  readonly lang?: string
}

export default function LayoutWrapper({ children, dict, lang }: Props) {
  // If dict and lang are provided, wrap with TranslationProvider
  if (dict && lang) {
    return (
      <TranslationProvider dict={dict} lang={lang}>
        <DialogProvider>
          <Layout>
            {children}
          </Layout>
        </DialogProvider>
      </TranslationProvider>
    )
  }

  // Fallback without TranslationProvider (shouldn't happen in normal usage)
  return (
    <DialogProvider>
      <Layout>
        {children}
      </Layout>
    </DialogProvider>
  )
}
