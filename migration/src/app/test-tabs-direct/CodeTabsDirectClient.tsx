"use client"

import { useState } from "react"
import { Pre } from "codehike/code"

interface Tab {
  meta: string;
  value: string;
  lang: string;
}

interface CodeTabsDirectClientProps {
  readonly highlighted: any[];
  readonly tabs: Tab[];
}

export function CodeTabsDirectClient({ highlighted, tabs }: CodeTabsDirectClientProps) {
  const [activeTab, setActiveTab] = useState(0)
  
  return (
    <div className="code-tabs-container">
      {/* Header estilo macOS/VS Code */}
      <div className="code-header">
        <div className="traffic-lights">
          <div className="traffic-light red"></div>
          <div className="traffic-light yellow"></div>
          <div className="traffic-light green"></div>
        </div>
        
        {/* Tabs List */}
        <div className="tabs-list">
          {tabs.map((tab, index) => (
            <button
              key={tab.meta}
              onClick={() => setActiveTab(index)}
              className={activeTab === index ? 'active' : ''}
              data-state={activeTab === index ? 'active' : 'inactive'}
            >
              {tab.meta}
            </button>
          ))}
        </div>
      </div>
      
      {/* Tabs Content */}
      <div className="tab-content">
        <Pre code={highlighted[activeTab]} className="code-pre" />
      </div>
    </div>
  )
}
