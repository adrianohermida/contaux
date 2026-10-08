import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import ProtectedRoute from '@/components/ProtectedRoute'
import PortalRoute from '@/components/PortalRoute'
import LoginPage from '@/pages/LoginPage'

const DashboardPage = lazy(() => import('@/modules/dashboard/DashboardPage'))
const CrmPage = lazy(() => import('@/modules/crm/CrmPage'))
const FinanceiroPage = lazy(() => import('@/modules/financeiro/FinanceiroPage'))
const InboxPage = lazy(() => import('@/modules/email/InboxPage'))
const ContabilidadePage = lazy(() => import('@/modules/contabilidade/ContabilidadePage'))
const SuportePage = lazy(() => import('@/modules/suporte/SuportePage'))
const MarketingPage = lazy(() => import('@/modules/marketing/MarketingPage'))
const AdminPage = lazy(() => import('@/modules/admin/AdminPage'))
const ImportPage = lazy(() => import('@/modules/import/ImportPage'))
const ConhecimentoPage = lazy(() => import('@/modules/conhecimento/ConhecimentoPage'))
const TarefasPage = lazy(() => import('@/modules/tarefas/TarefasPage'))

// Portal do Cliente
const PortalLayout = lazy(() => import('@/pages/portal/PortalLayout'))
const PortalDashboard = lazy(() => import('@/pages/portal/PortalDashboard'))
const PortalInvoices = lazy(() => import('@/pages/portal/PortalInvoices'))
const PortalTickets = lazy(() => import('@/pages/portal/PortalTickets'))
const PortalDocuments = lazy(() => import('@/pages/portal/PortalDocuments'))

function Loading() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  )
}

function withSuspense(element) {
  return <Suspense fallback={<Loading />}>{element}</Suspense>
}

export default function App() {
  return (
    <Routes>
      {/* Login público */}
      <Route path="/login" element={<LoginPage />} />

      {/* Dashboard interno (staff) */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={withSuspense(<DashboardPage />)} />

        {/* Caixa de Entrada */}
        <Route path="/inbox" element={withSuspense(<InboxPage />)} />

        {/* CRM */}
        <Route path="/crm" element={withSuspense(<CrmPage view="clients" />)} />
        <Route path="/crm/contatos" element={withSuspense(<CrmPage view="contacts" />)} />

        {/* Financeiro */}
        <Route path="/financeiro" element={withSuspense(<FinanceiroPage view="invoices" />)} />
        <Route path="/financeiro/orcamentos" element={withSuspense(<FinanceiroPage view="quotes" />)} />
        <Route path="/financeiro/pagamentos" element={withSuspense(<FinanceiroPage view="payments" />)} />

        {/* Contabilidade */}
        <Route path="/contabilidade" element={withSuspense(<ContabilidadePage view="accounts" />)} />
        <Route path="/contabilidade/lancamentos" element={withSuspense(<ContabilidadePage view="journal" />)} />
        <Route path="/contabilidade/notas-fiscais" element={withSuspense(<ContabilidadePage view="taxinvoices" />)} />
        <Route path="/contabilidade/calendario" element={withSuspense(<ContabilidadePage view="calendar" />)} />

        {/* Suporte */}
        <Route path="/suporte" element={withSuspense(<SuportePage view="tickets" />)} />
        <Route path="/suporte/processos" element={withSuspense(<SuportePage view="processes" />)} />

        {/* Marketing */}
        <Route path="/marketing" element={withSuspense(<MarketingPage view="campaigns" />)} />
        <Route path="/marketing/blog" element={withSuspense(<MarketingPage view="blog" />)} />
        <Route path="/marketing/fidelidade" element={withSuspense(<MarketingPage view="loyalty" />)} />

        {/* Base de Conhecimento */}
        <Route path="/conhecimento" element={withSuspense(<ConhecimentoPage />)} />

        {/* Tarefas */}
        <Route path="/tarefas" element={withSuspense(<TarefasPage />)} />

        {/* Importação de Dados */}
        <Route path="/importar" element={withSuspense(<ImportPage />)} />

        {/* Administração */}
        <Route path="/admin" element={withSuspense(<AdminPage view="settings" />)} />
        <Route path="/admin/seguranca" element={withSuspense(<AdminPage view="security" />)} />
        <Route path="/admin/auditoria" element={withSuspense(<AdminPage view="audit" />)} />
        <Route path="/admin/automacoes" element={withSuspense(<AdminPage view="automations" />)} />
        <Route path="/admin/documentos" element={withSuspense(<AdminPage view="documents" />)} />
        <Route path="/admin/relatorios" element={withSuspense(<AdminPage view="reports" />)} />
        <Route path="/admin/email" element={withSuspense(<AdminPage view="email" />)} />
        <Route path="/admin/parceiros" element={withSuspense(<AdminPage view="partners" />)} />
      </Route>

      {/* Portal do Cliente */}
      <Route element={<PortalRoute><PortalLayout /></PortalRoute>}>
        <Route path="/portal" element={withSuspense(<PortalDashboard />)} />
        <Route path="/portal/faturas" element={withSuspense(<PortalInvoices />)} />
        <Route path="/portal/documentos" element={withSuspense(<PortalDocuments />)} />
        <Route path="/portal/suporte" element={withSuspense(<PortalTickets />)} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
