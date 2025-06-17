'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import Dialog from '@/components/Dialog'

interface ModalWrapperProps {
  readonly children: React.ReactNode
  readonly className?: string
}

export default function ModalWrapper({ children, className }: ModalWrapperProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const handleClose = useCallback(() => {
    setIsOpen(false)
    router.back()
  }, [router])

  const handleMinimize = useCallback(() => {
    setIsMinimized(!isMinimized)
  }, [isMinimized])

  const handleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen)
  }, [isFullscreen])

  // Proporcionar funciones de control a los componentes hijos
  useEffect(() => {
    // Crear eventos personalizados para que los componentes hijos puedan comunicarse
    const handleDialogClose = () => handleClose()
    const handleDialogMinimize = () => handleMinimize()
    const handleDialogFullscreen = (event: CustomEvent) => {
      setIsFullscreen(event.detail.isFullscreen)
    }

    window.addEventListener('dialog:close', handleDialogClose)
    window.addEventListener('dialog:minimize', handleDialogMinimize)
    window.addEventListener('dialog:fullscreen', handleDialogFullscreen as EventListener)

    return () => {
      window.removeEventListener('dialog:close', handleDialogClose)
      window.removeEventListener('dialog:minimize', handleDialogMinimize)
      window.removeEventListener('dialog:fullscreen', handleDialogFullscreen as EventListener)
    }
  }, [handleClose, handleMinimize])

  if (!isOpen) return null

  return (
    <Dialog
      className={`modal-overlay ${className ?? ''} ${isMinimized ? 'minimized' : ''} ${isFullscreen ? 'fullscreen' : ''}`}
      modalMode
      open={true}
      body={children}
    />
  )
}
