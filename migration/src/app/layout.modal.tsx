import { ReactNode } from 'react'

interface LayoutProps {
  readonly children: ReactNode
  readonly modal: ReactNode
}

export default function Layout({ children, modal }: LayoutProps) {
  return (
    <>
      {children}
      {modal}
    </>
  )
}
