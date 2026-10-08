import { NavLink } from 'react-router-dom'
import InvoicesPage from './InvoicesPage'
import QuotesPage from './QuotesPage'
import PaymentsPage from './PaymentsPage'
import { cn } from '@/lib/utils'
import { FileText, FileSpreadsheet, CreditCard } from 'lucide-react'

const subTabs = [
  { to: '/financeiro', label: 'Faturas', icon: FileText, end: true },
  { to: '/financeiro/orcamentos', label: 'Orçamentos', icon: FileSpreadsheet, end: false },
  { to: '/financeiro/pagamentos', label: 'Pagamentos', icon: CreditCard, end: false },
]

export default function FinanceiroPage({ view }) {
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

      {view === 'quotes' ? <QuotesPage /> : view === 'payments' ? <PaymentsPage /> : <InvoicesPage />}
    </div>
  )
}
