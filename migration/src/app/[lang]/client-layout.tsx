'use client'

import { TranslationProvider } from '@/hooks/useTranslationSimple'
import LayoutWrapper from '@/components/LayoutWrapper'
import { ReactNode } from 'react'

type Props = {
  children: ReactNode
  dict: any
  lang: string
}

export default function ClientLayout({ children, dict, lang }: Props) {
  return (
    <div lang={lang}>
      <TranslationProvider dict={dict} lang={lang}>
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </TranslationProvider>
    </div>
  )
}
