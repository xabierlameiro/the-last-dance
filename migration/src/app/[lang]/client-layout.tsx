'use client'

import LayoutWrapper from '@/components/LayoutWrapper.tsx'
import { ReactNode } from 'react'

type Props = {
  children: ReactNode
  dict: any
  lang: string
}

export default function ClientLayout({ children, dict, lang }: Props) {
  return (
    <div lang={lang}>
      <LayoutWrapper dict={dict} lang={lang}>
        {children}
      </LayoutWrapper>
    </div>
  )
}
