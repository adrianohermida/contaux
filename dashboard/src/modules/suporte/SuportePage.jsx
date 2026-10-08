import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Ticket, Scale } from 'lucide-react'

const subTabs = [
  { to: '/suporte', label: 'Tickets', icon: Ticket, end: true },
  { to: '/suporte/processos', label: 'Processos Jurídicos', icon: Scale, end: false },
]

export default function SuportePage({ view }) {
  return (
    <div>
      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-border">
        {subTabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )
            }
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </NavLink>
        ))}
      </div>

      {view === 'processes' ? <ProcessosView /> : <TicketsView />}
    </div>
  )
}

import TicketsPage from './TicketsPage'
import ProcessosPage from './ProcessosPage'

function TicketsView() { return <TicketsPage /> }
function ProcessosView() { return <ProcessosPage /> }
