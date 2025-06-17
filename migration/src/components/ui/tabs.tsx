"use client"

import { useState, ReactNode, createContext, useContext, useMemo } from "react"

interface TabsProps {
  defaultValue: string
  className?: string
  children: ReactNode
}

interface TabsListProps {
  className?: string
  children: ReactNode
}

interface TabsTriggerProps {
  value: string
  children: ReactNode
}

interface TabsContentProps {
  value: string
  className?: string
  children: ReactNode
}

export function Tabs({ defaultValue, className, children }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue)
  
  return (
    <div className={className} data-active-tab={activeTab}>
      <TabsContext.Provider value={{ activeTab, setActiveTab }}>
        {children}
      </TabsContext.Provider>
    </div>
  )
}

export function TabsList({ className, children }: TabsListProps) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}

export function TabsTrigger({ value, children }: TabsTriggerProps) {
  const { activeTab, setActiveTab } = useTabsContext()
  
  return (
    <button
      onClick={() => setActiveTab(value)}
      className={activeTab === value ? 'active' : ''}
      data-state={activeTab === value ? 'active' : 'inactive'}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, className, children }: TabsContentProps) {
  const { activeTab } = useTabsContext()
  
  if (activeTab !== value) return null
  
  return (
    <div className={className}>
      {children}
    </div>
  )
}

// Context
interface TabsContextType {
  activeTab: string
  setActiveTab: (value: string) => void
}

const TabsContext = createContext<TabsContextType | undefined>(undefined)

function useTabsContext() {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider')
  }
  return context
}
