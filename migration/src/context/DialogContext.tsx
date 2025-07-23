"use client"

import React, { createContext, useContext, useState } from 'react'

interface DialogContextType {
  isOpen: boolean
  isMinimized: boolean
  isFullscreen: boolean
  setIsOpen: (open: boolean) => void
  setIsMinimized: (minimized: boolean) => void
  setIsFullscreen: (fullscreen: boolean) => void
  closeDialog: () => void
  minimizeDialog: () => void
  toggleFullscreen: () => void
}

const DialogContext = createContext<DialogContextType | undefined>(undefined)

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const closeDialog = () => {
    setIsOpen(false)
  }

  const minimizeDialog = () => {
    setIsMinimized(!isMinimized)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  return (
    <DialogContext.Provider value={{
      isOpen,
      isMinimized,
      isFullscreen,
      setIsOpen,
      setIsMinimized,
      setIsFullscreen,
      closeDialog,
      minimizeDialog,
      toggleFullscreen
    }}>
      {children}
    </DialogContext.Provider>
  )
}

export function useDialog() {
  const context = useContext(DialogContext)
  if (context === undefined) {
    throw new Error('useDialog must be used within a DialogProvider')
  }
  return context
}
