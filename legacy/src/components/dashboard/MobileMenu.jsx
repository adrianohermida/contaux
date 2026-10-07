import React, { useState, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, ChevronRight } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import {
  LayoutDashboard,
  Users,
  Ticket,
  FileText,
  DollarSign,
  FileSpreadsheet,
  Zap,
  BarChart3,
  UserCircle,
  Settings,
  MessageCircle
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', page: 'Dashboard' },
  { icon: MessageCircle, label: 'Balcão Virtual', page: 'VirtualCounter' },
  { icon: Users, label: 'CRM - Clientes', page: 'Clients' },
  { icon: Ticket, label: 'Helpdesk - Tickets', page: 'Tickets' },
  { icon: FileText, label: 'Processos Judiciais', page: 'LegalProcesses' },
  {
    icon: DollarSign,
    label: 'Vendas & Financeiro',
    submenu: [
      { label: 'Faturamento', page: 'Invoicing' },
      { label: 'Orçamentos', page: 'Quotes' },
      { label: 'Vendas', page: 'Sales' },
      { label: 'Pagamentos', page: 'Payments' },
      { label: 'Fluxo de Caixa', page: 'CashFlow' },
      { label: 'Previsão de Caixa', page: 'CashFlowForecast' },
      { label: 'Transações Bancárias', page: 'Transactions' },
      { label: 'Prestação de Serviços', page: 'Services' }
    ]
  },
  {
    icon: FileSpreadsheet,
    label: 'Contabilidade',
    submenu: [
      { label: 'Lançamentos', page: 'Entries' },
      { label: 'Plano de Contas', page: 'ChartOfAccounts' },
      { label: 'Conciliação Bancária', page: 'BankReconciliation' },
      { label: 'Baixa Manual', page: 'ManualPosting' },
      { label: 'Notas Fiscais', page: 'TaxInvoices' },
      { label: 'Calendário Contábil', page: 'AccountingCalendar' },
      { label: 'Importação CSV', page: 'ImportCSV' }
    ]
  },
  { icon: Zap, label: 'Automações', page: 'Automations' },
  { icon: BarChart3, label: 'Relatórios & Análises', page: 'Reports' },
  { icon: FileText, label: 'Gerenciamento', page: 'DocumentManagement' },
  { icon: UserCircle, label: 'Meu Painel', page: 'ClientPortal' },
  { icon: Settings, label: 'Administração', page: 'SettingsPage' }
];

export default function MobileMenu() {
  const location = useLocation();
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState({});

  const isActive = useCallback((page) => {
    return location.pathname === `/${page.toLowerCase()}`;
  }, [location.pathname]);

  const toggleSubmenu = useCallback((label) => {
    setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
  }, []);

  return (
    <>
      {/* Hamburger Button - visible only on mobile */}
       <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
        aria-expanded={isOpen}
        className={`hidden max-md:block fixed top-4 left-4 z-50 p-2 rounded-lg transition-colors ${
          theme === 'dark'
            ? 'bg-slate-700 text-slate-200'
            : 'bg-slate-900 text-white'
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Drawer */}
      {isOpen && (
        <>
          {/* Backdrop */}
           <div
             className="fixed inset-0 bg-black/50 z-40 max-md:block hidden"
             onClick={() => setIsOpen(false)}
           />

           {/* Drawer */}
           <div className={`fixed left-0 top-0 h-full w-64 z-40 max-md:block hidden flex flex-col transition-colors ${
             theme === 'dark'
               ? 'bg-slate-800 text-slate-200'
               : 'bg-slate-900 text-white'
           }`}>
            <div className={`p-4 flex-shrink-0 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-800'}`}>
              <h2 className="text-xl font-bold">Contaux</h2>
            </div>

            <nav className="py-4 space-y-1 overflow-y-auto flex-1">
              {menuItems.map((item, index) => (
                <div key={index}>
                  {item.submenu ? (
                    <>
                      <button
                        onClick={() => toggleSubmenu(item.label)}
                        className={`w-full px-4 py-3 flex items-center gap-3 transition-colors text-left ${
                          theme === 'dark'
                            ? 'hover:bg-slate-700'
                            : 'hover:bg-slate-800'
                        }`}
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm flex-1">{item.label}</span>
                        {openMenus[item.label] ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>

                      {openMenus[item.label] && (
                        <div className={`space-y-1 ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-950'}`}>
                          {item.submenu.map((sub, subIndex) => (
                            <a
                              key={subIndex}
                              href={`/${sub.page.toLowerCase()}`}
                              className={`block px-12 py-2 text-sm transition-colors ${
                                isActive(sub.page)
                                  ? theme === 'dark'
                                    ? 'bg-slate-600 text-blue-300'
                                    : 'bg-slate-800 text-blue-400'
                                  : theme === 'dark'
                                  ? 'hover:bg-slate-600'
                                  : 'hover:bg-slate-800'
                              }`}
                              onClick={() => setIsOpen(false)}
                            >
                              {sub.label}
                            </a>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <a
                       href={`/${item.page.toLowerCase()}`}
                       className={`block px-4 py-3 flex items-center gap-3 transition-colors ${
                         isActive(item.page)
                           ? theme === 'dark'
                             ? 'bg-slate-600 border-l-4 border-blue-400'
                             : 'bg-slate-800 border-l-4 border-blue-500'
                           : theme === 'dark'
                           ? 'hover:bg-slate-700'
                           : 'hover:bg-slate-800'
                       }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm">{item.label}</span>
                    </a>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </>
      )}
    </>
  );
}