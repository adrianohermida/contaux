import { useState } from 'react'
import { cn } from '@/lib/utils'

export function Tabs({ tabs, defaultTab, children }) {
  const [active, setActive] = useState(defaultTab || tabs[0]?.value)

  return (
    <div>
      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActive(tab.value)}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
              active === tab.value
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {typeof children === 'function' ? children(active) : children}
      </div>
    </div>
  )
}
