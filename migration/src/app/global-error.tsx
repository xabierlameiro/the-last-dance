'use client'

import Dialog from '@/components/Dialog'

export default function GlobalError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string }
  reset: () => void
}>) {
  return (
    <html lang="en">
      <body>
        <Dialog
          modalMode
          withPadding
          open={true}
          body={
            <div style={{ display: 'grid', placeContent: 'center', height: 'inherit' }}>
              <div style={{ textAlign: 'center' }}>
                <div>Oh! sorry, a server error has occurred!</div>
                <button 
                  onClick={reset}
                  style={{ 
                    marginTop: '1rem', 
                    padding: '0.5rem 1rem', 
                    background: '#007acc', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Try again
                </button>
              </div>
            </div>
          }
        />
      </body>
    </html>
  )
}
