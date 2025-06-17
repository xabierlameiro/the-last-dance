'use client'

import { ReactNode } from 'react'
import Layout from '@/components/Layout'
import Notification from '@/components/Notification'
import ErrorBoundary from '@/components/ErrorBoundary'

type Props = {
  readonly children: ReactNode
}

export default function LayoutWrapper({ children }: Props) {
  return (
    <ErrorBoundary>
      <Notification
        title="Cookies"
        message="This website uses cookies to improve the user experience, more information on the legal information path."
      />
      <Layout>
        {children}
      </Layout>
    </ErrorBoundary>
  )
}
