'use client'

import { ReactNode } from 'react'
import { DialogProvider } from '@/context/dialog'
import Layout from '@/components/Layout'

type Props = {
  children: ReactNode
}

export default function LayoutWrapper({ children }: Props) {
  return (
    <DialogProvider>
      <Layout>
        {children}
      </Layout>
    </DialogProvider>
  )
}
