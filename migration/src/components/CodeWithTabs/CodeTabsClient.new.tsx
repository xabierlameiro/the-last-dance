"use client"

import { useState } from "react"
import { Pre, RawCode } from "codehike/code"
import { useDialogControls } from "../DialogWithControls"

interface CodeTabsClientProps {
  readonly highlighted: any[];
  readonly tabs: RawCode[];
  readonly onClose?: () => void;
  readonly onMinimize?: () => void;
  readonly onFullscreen?: (isFullscreen: boolean) => void;
}

export function CodeTabsClient({ highlighted, tabs }: CodeTabsClientProps) {
  const [activeTab, setActiveTab] = useState(0)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const dialogControls = useDialogControls()
  
  const handleClose = () => {
    dialogControls.close()
  }
  
  const handleMinimize = () => {
    const newMinimized = !isMinimized
    setIsMinimized(newMinimized)
    dialogControls.minimize()
  }
  
  const handleFullscreen = () => {
    const newFullscreen = !isFullscreen
    setIsFullscreen(newFullscreen)
    dialogControls.fullscreen(newFullscreen)
  }

  if (isMinimized) {
    return (
      <button 
        className="code-tabs-minimized" 
        onClick={() => setIsMinimized(false)}
        onKeyDown={(e) => e.key === 'Enter' && setIsMinimized(false)}
        aria-label="Restore window"
      >
        <div className="minimized-header">
          <div className="traffic-lights">
            <div className="traffic-light red">
              <span className="traffic-light-icon">×</span>
            </div>
            <div className="traffic-light yellow">
              <span className="traffic-light-icon">−</span>
            </div>
            <div className="traffic-light green">
              <span className="traffic-light-icon">+</span>
            </div>
          </div>
          <span className="minimized-title">Terminal - {tabs[activeTab]?.meta}</span>
        </div>
      </button>
    )
  }

  return (
    <div 
      className={`code-tabs-container ${isFullscreen ? 'fullscreen' : ''}`}
      suppressHydrationWarning={true}
    >
      {/* Header estilo macOS */}
      <div className="code-header">
        <div className="traffic-lights">
          <button 
            className="traffic-light red"
            onClick={handleClose}
            onKeyDown={(e) => e.key === 'Enter' && handleClose()}
            title="Close"
            aria-label="Close window"
          >
            <span className="traffic-light-icon">×</span>
          </button>
          <button 
            className="traffic-light yellow"
            onClick={handleMinimize}
            onKeyDown={(e) => e.key === 'Enter' && handleMinimize()}
            title="Minimize"
            aria-label="Minimize window"
          >
            <span className="traffic-light-icon">−</span>
          </button>
          <button 
            className="traffic-light green"
            onClick={handleFullscreen}
            onKeyDown={(e) => e.key === 'Enter' && handleFullscreen()}
            title={isFullscreen ? "Exit Full Screen" : "Full Screen"}
            aria-label={isFullscreen ? "Exit Full Screen" : "Enter Full Screen"}
          >
            <span className="traffic-light-icon">{isFullscreen ? "−" : "+"}</span>
          </button>
        </div>
        
        {/* Tabs List al lado izquierdo */}
        <div className="tabs-list">
          {tabs.map((tab, index) => (
            <button
              key={tab.meta}
              onClick={() => setActiveTab(index)}
              className={`tab ${activeTab === index ? 'active' : ''}`}
              data-state={activeTab === index ? 'active' : 'inactive'}
            >
              {tab.meta}
              {activeTab === index && <span className="tab-close">×</span>}
            </button>
          ))}
        </div>
        
        {/* Window Title centrado */}
        <div className="window-title">
          Terminal — {tabs[activeTab]?.meta}
        </div>
      </div>
      
      {/* Tabs Content */}
      <div className="tab-content">
        <Pre code={highlighted[activeTab]} className="code-pre" />
      </div>
    </div>
  )
}
