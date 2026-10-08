import { useState } from 'react'
import EmailRoutingPanel from './EmailRoutingPanel'
import EmailWorkersPanel from './EmailWorkersPanel'
import EmailTemplatesPanel from './EmailTemplatesPanel'
import { Mail, Zap, FileText } from 'lucide-react'

/**
 * Página de configuração de email — Routing, Workers e Templates
 * Acessível via Admin > Email
 */
export default function EmailConfigPage() {
  const [section, setSection] = useState('templates')

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Configuração de Email</h1>
        <p className="text-sm text-muted-foreground">Templates, Cloudflare Email Routing e Workers</p>
      </div>

      {/* Sub-abas */}
      <div className="flex gap-1 border-b border-border">
        <TabButton active={section === 'templates'} onClick={() => setSection('templates')} icon={FileText} label="Templates" />
        <TabButton active={section === 'routing'} onClick={() => setSection('routing')} icon={Mail} label="Email Routing" />
        <TabButton active={section === 'workers'} onClick={() => setSection('workers')} icon={Zap} label="Workers" />
      </div>

      {section === 'templates' && <EmailTemplatesPanel />}
      {section === 'routing' && <EmailRoutingPanel />}
      {section === 'workers' && <EmailWorkersPanel />}
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
