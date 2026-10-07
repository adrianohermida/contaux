import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronRight, LayoutDashboard } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const breadcrumbMap = {
  '/dashboard': { label: 'Dashboard', icon: LayoutDashboard },
  '/virtualcounter': { label: 'Balcão Virtual' },
  '/clients': { label: 'CRM - Clientes' },
  '/tickets': { label: 'Helpdesk - Tickets' },
  '/legalprocesses': { label: 'Processos Judiciais' },
  '/invoicing': { label: 'Faturamento' },
  '/quotes': { label: 'Orçamentos' },
  '/sales': { label: 'Vendas' },
  '/payments': { label: 'Pagamentos' },
  '/cashflow': { label: 'Fluxo de Caixa' },
  '/cashflowforecast': { label: 'Previsão de Caixa' },
  '/transactions': { label: 'Transações Bancárias' },
  '/services': { label: 'Prestação de Serviços' },
  '/entries': { label: 'Lançamentos' },
  '/chartofaccounts': { label: 'Plano de Contas' },
  '/bankreconciliation': { label: 'Conciliação Bancária' },
  '/manualposting': { label: 'Baixa Manual' },
  '/taxinvoices': { label: 'Notas Fiscais' },
  '/accountingcalendar': { label: 'Calendário Contábil' },
  '/importcsv': { label: 'Importação CSV' },
  '/automations': { label: 'Automações' },
  '/reports': { label: 'Relatórios & Análises' },
  '/documentmanagement': { label: 'Documentos' },
  '/blogmanager': { label: 'Blogs' },
  '/communication': { label: 'Comunicação' },
  '/clientportal': { label: 'Meu Painel' },
  '/settings': { label: 'Configurações' },
  '/auditlogs': { label: 'Logs de Auditoria' },
  '/securitycenter': { label: 'Centro de Segurança' },
  '/rlsdebugger': { label: 'RLS Debugger' }
};

export default function Breadcrumbs() {
  const location = useLocation();
  const { theme } = useTheme();
  
  const breadcrumbs = useMemo(() => {
    const path = location.pathname;
    
    if (!breadcrumbMap[path]) return [];
    
    const crumbs = [
      { label: 'Dashboard', path: '/dashboard' }
    ];
    
    if (path !== '/dashboard') {
      crumbs.push({
        label: breadcrumbMap[path].label,
        path: path
      });
    }
    
    return crumbs;
  }, [location.pathname]);

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav className={`flex items-center gap-2 text-sm px-6 py-2 transition-colors ${
      theme === 'dark'
        ? 'bg-slate-800 border-b border-slate-700 text-slate-400'
        : 'bg-slate-50 border-b border-slate-200 text-slate-600'
    }`} aria-label="Breadcrumb">
      {breadcrumbs.map((crumb, idx) => (
        <div key={crumb.path} className="flex items-center gap-2">
          {idx > 0 && <ChevronRight className={`w-4 h-4 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} />}
          <a
            href={crumb.path}
            className={`hover:underline transition-colors ${
              theme === 'dark'
                ? 'hover:text-slate-200'
                : 'hover:text-slate-900'
            }`}
          >
            {crumb.label}
          </a>
        </div>
      ))}
    </nav>
  );
}