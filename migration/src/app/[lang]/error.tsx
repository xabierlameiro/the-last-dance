'use client'

import Dialog from '@/components/Dialog'
import ControlButtons from '@/components/ControlButtons'
import { useDialog } from '@/context/dialog'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { dispatch, open } = useDialog()
  const close = () => dispatch({ type: 'close' })

  return (
    <Dialog
      modalMode
      withPadding
      header={<ControlButtons disabled onClickClose={close} onClickMinimise={close} />}
      open={open}
      body={
        <div style={{ display: 'grid', placeContent: 'center', height: 'inherit' }}>
          <div>
            <p>Oh! sorry, a server error has occurred!</p>
            <button 
              onClick={reset}
              style={{ 
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#0070f3',
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
  )
}
