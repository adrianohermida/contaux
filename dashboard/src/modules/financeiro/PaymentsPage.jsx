import { useState } from 'react'
import PaymentList from './PaymentList'
import PaymentForm from './PaymentForm'
import { mockPayments } from './lib/mockData'

export default function PaymentsPage() {
  const [payments, setPayments] = useState(mockPayments)
  const [formOpen, setFormOpen] = useState(false)

  const handleNew = () => setFormOpen(true)

  const handleSave = (data) => {
    setPayments((prev) => [{ ...data, id: String(Date.now()) }, ...prev])
    setFormOpen(false)
  }

  const handleConfirm = (id) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'confirmed' } : p)),
    )
  }

  return (
    <>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Pagamentos</h1>
        <p className="text-sm text-muted-foreground">Registro e acompanhamento de pagamentos recebidos</p>
      </div>
      <PaymentList payments={payments} onNew={handleNew} onConfirm={handleConfirm} />
      <PaymentForm open={formOpen} onClose={() => setFormOpen(false)} onSave={handleSave} />
    </>
  )
}
