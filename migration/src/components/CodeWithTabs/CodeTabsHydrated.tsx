'use client'

import { useState, useEffect } from 'react'
import { CodeTabsClient } from './CodeTabsClient'

interface CodeTabsHydratedProps {
  readonly highlighted: any[]
  readonly tabs: any[]
}

export function CodeTabsHydrated({ highlighted, tabs }: CodeTabsHydratedProps) {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Immediate hydration to prevent layout shift
    setIsHydrated(true)
  }, [])

  // Render the actual component immediately but with a suppressHydrationWarning
  return (
    <div suppressHydrationWarning>
      <CodeTabsClient highlighted={highlighted} tabs={tabs} />
    </div>
  )
}
