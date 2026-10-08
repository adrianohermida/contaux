import {
  LayoutDashboard,
  Mail,
  Users,
  DollarSign,
  Calculator,
  LifeBuoy,
  Megaphone,
  Settings,
  UploadCloud,
} from 'lucide-react'

export const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Mail, label: 'Caixa de Entrada', path: '/inbox' },
  { icon: Users, label: 'CRM', path: '/crm' },
  { icon: DollarSign, label: 'Financeiro', path: '/financeiro' },
  { icon: Calculator, label: 'Contabilidade', path: '/contabilidade' },
  { icon: LifeBuoy, label: 'Suporte', path: '/suporte' },
  { icon: Megaphone, label: 'Marketing', path: '/marketing' },
  { icon: Settings, label: 'Administração', path: '/admin' },
  { icon: UploadCloud, label: 'Importar Dados', path: '/importar' },
]
