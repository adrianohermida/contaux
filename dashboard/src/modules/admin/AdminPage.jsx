import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Settings, Shield, ScrollText, Zap, FolderOpen, BarChart3 } from 'lucide-react'

const subTabs = [
  { to: '/admin', label: 'Configurações', icon: Settings, end: true },
  { to: '/admin/seguranca', label: 'Segurança', icon: Shield, end: false },
  { to: '/admin/auditoria', label: 'Auditoria', icon: ScrollText, end: false },
  { to: '/admin/automacoes', label: 'Automações', icon: Zap, end: false },
  { to: '/admin/documentos', label: 'Documentos', icon: FolderOpen, end: false },
  { to: '/admin/relatorios', label: 'Relatórios', icon: BarChart3, end: false },
]

export default function AdminPage({ view }) {
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

      {view === 'security' ? <SegurancaView /> : view === 'audit' ? <AuditoriaView /> : view === 'automations' ? <AutomacoesView /> : view === 'documents' ? <DocumentosView /> : view === 'reports' ? <RelatoriosView /> : <ConfiguracoesView />}
    </div>
  )
}

import ConfiguracoesPage from './ConfiguracoesPage'
import SegurancaPage from './SegurancaPage'
import AuditoriaPage from './AuditoriaPage'
import AutomacoesPage from './AutomacoesPage'
import DocumentosPage from './DocumentosPage'
import RelatoriosPage from './RelatoriosPage'

function ConfiguracoesView() { return <ConfiguracoesPage /> }
function SegurancaView() { return <SegurancaPage /> }
function AuditoriaView() { return <AuditoriaPage /> }
function AutomacoesView() { return <AutomacoesPage /> }
function DocumentosView() { return <DocumentosPage /> }
function RelatoriosView() { return <RelatoriosPage /> }
