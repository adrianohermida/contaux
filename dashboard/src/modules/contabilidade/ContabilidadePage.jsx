import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { BookOpen, FileText, Receipt, CalendarDays } from 'lucide-react'

const subTabs = [
  { to: '/contabilidade', label: 'Plano de Contas', icon: BookOpen, end: true },
  { to: '/contabilidade/lancamentos', label: 'Lançamentos', icon: FileText, end: false },
  { to: '/contabilidade/notas-fiscais', label: 'Notas Fiscais', icon: Receipt, end: false },
  { to: '/contabilidade/calendario', label: 'Calendário', icon: CalendarDays, end: false },
]

export default function ContabilidadePage({ view }) {
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

      {view === 'journal' ? <JournalView /> : view === 'taxinvoices' ? <TaxInvoicesView /> : view === 'calendar' ? <CalendarView /> : <AccountsView />}
    </div>
  )
}

// Lazy imports para evitar carregar tudo de uma vez
import AccountsPage from './AccountsPage'
import JournalPage from './JournalPage'
import TaxInvoicesPage from './TaxInvoicesPage'
import CalendarPage from './CalendarPage'

function AccountsView() { return <AccountsPage /> }
function JournalView() { return <JournalPage /> }
function TaxInvoicesView() { return <TaxInvoicesPage /> }
function CalendarView() { return <CalendarPage /> }
