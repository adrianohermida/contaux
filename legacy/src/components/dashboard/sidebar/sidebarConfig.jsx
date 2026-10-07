import {
  LayoutDashboard,
  Users,
  Ticket,
  FileText,
  DollarSign,
  Calculator,
  FileSpreadsheet,
  Zap,
  BarChart3,
  Settings,
  MessageCircle,
  Landmark,
} from 'lucide-react';

export const SIDEBAR_MENU_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', page: 'Dashboard' },
  { icon: MessageCircle, label: 'Balcão Virtual', page: 'VirtualCounter', badge: 'unread' },
  { icon: Users, label: 'CRM - Clientes', page: 'Contact' },
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
  {
    icon: FileText,
    label: 'Gerenciamento',
    submenu: [
      { label: 'Documentos', page: 'DocumentManagement' },
      { label: 'Blogs', page: 'BlogManager' },
      { label: 'Comunicação', page: 'Communication' }
    ]
  },
  {
    icon: Settings,
    label: 'Administração',
    submenu: [
      { label: 'Configurações', page: 'SettingsPage' },
      { label: 'Logs de Auditoria', page: 'AuditLogs' },
      { label: 'Centro de Segurança', page: 'SecurityCenter' }
    ]
  }
];