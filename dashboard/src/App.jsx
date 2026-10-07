import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import AppLayout from '@/components/layout/AppLayout'

const DashboardPage = lazy(() => import('@/modules/dashboard/DashboardPage'))
const CrmPage = lazy(() => import('@/modules/crm/CrmPage'))

function Loading() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route
          path="/dashboard"
          element={
            <Suspense fallback={<Loading />}>
              <DashboardPage />
            </Suspense>
          }
        />
        {/* CRM */}
        <Route
          path="/crm"
          element={
            <Suspense fallback={<Loading />}>
              <CrmPage view="clients" />
            </Suspense>
          }
        />
        <Route
          path="/crm/contatos"
          element={
            <Suspense fallback={<Loading />}>
              <CrmPage view="contacts" />
            </Suspense>
          }
        />
        {/* Módulos futuros: /financeiro, /contabilidade, /suporte, /marketing, /admin */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}
