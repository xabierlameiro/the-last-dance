import type { Metadata } from 'next'
import Dialog from '@/components/Dialog'

export const metadata: Metadata = {
  title: '404 - Page Not Found',
  description: "Oh! sorry, this page doesn't exist",
  robots: {
    index: false,
    follow: false,
  },
}

export default function NotFound() {
  return (
    <Dialog
      modalMode
      withPadding
      open={true}
      body={
        <div style={{ display: 'grid', placeContent: 'center', height: 'inherit' }}>
          Oh! sorry, this page doesn&apos;t exist.
        </div>
      }
    />
  )
}
