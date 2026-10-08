import { useState } from 'react'
import { cn } from '@/lib/utils'

export function Tabs({ tabs, defaultTab, children }) {
  const [active, setActive] = useState(defaultTab || tabs[0]?.value)

  const onKeyDown = (e, index) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      const next = tabs[(index + 1) % tabs.length]
      setActive(next.value)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      const prev = tabs[(index - 1 + tabs.length) % tabs.length]
      setActive(prev.value)
    }
  }

  return (
    <div>
      <div className="flex gap-1 border-b border-border" role="tablist" aria-orientation="horizontal">
        {tabs.map((tab, i) => (
          <button
            key={tab.value}
            role="tab"
            aria-selected={active === tab.value}
            tabIndex={active === tab.value ? 0 : -1}
            onClick={() => setActive(tab.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              active === tab.value
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4" role="tabpanel">
        {typeof children === 'function' ? children(active) : children}
      </div>
    </div>
  )
}
