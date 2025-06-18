'use client'

import Dialog from '@/components/Dialog'
import ControlButtons from '@/components/ControlButtons'
import { useDialog } from '@/context/dialog'

export default function NotFound() {
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
          Oh! sorry, this page doesn&apos;t exist.
        </div>
      }
    />
  )
}
