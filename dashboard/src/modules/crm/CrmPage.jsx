import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import ClientsPage from './ClientsPage'
import ContactsPage from './ContactsPage'
import { cn } from '@/lib/utils'
import { Users, User } from 'lucide-react'

const subTabs = [
  { to: '/crm', label: 'Clientes', icon: Users, end: true },
  { to: '/crm/contatos', label: 'Contatos', icon: User, end: false },
]

export default function CrmPage({ view }) {
  return (
    <div>
      {/* Sub-navegação */}
      <div className="mb-6 flex gap-1 border-b border-border">
        {subTabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
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

      {view === 'contacts' ? <ContactsPage /> : <ClientsPage />}
    </div>
  )
}
