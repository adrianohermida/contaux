import { useState } from 'react'
import EmailRoutingPanel from './EmailRoutingPanel'
import EmailWorkersPanel from './EmailWorkersPanel'
import { Mail, Zap } from 'lucide-react'

/**
 * Página de configuração de email — Cloudflare Email Routing + Workers
 * Acessível via Admin > Email
 */
export default function EmailConfigPage() {
  const [section, setSection] = useState('routing')

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Configuração de Email</h1>
        <p className="text-sm text-muted-foreground">Cloudflare Email Routing e Workers</p>
      </div>

      {/* Sub-abas */}
      <div className="flex gap-1 border-b border-border">
        <TabButton active={section === 'routing'} onClick={() => setSection('routing')} icon={Mail} label="Email Routing" />
        <TabButton active={section === 'workers'} onClick={() => setSection('workers')} icon={Zap} label="Workers" />
      </div>

      {section === 'routing' ? <EmailRoutingPanel /> : <EmailWorkersPanel />}
    </div>
  )
}

function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${
        active
          ? 'border-primary text-primary'
          : 'border-transparent text-muted-foreground hover:text-foreground'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  )
}
