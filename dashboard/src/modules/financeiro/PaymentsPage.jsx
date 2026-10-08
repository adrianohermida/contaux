import { useState } from 'react'
import PaymentList from './PaymentList'
import PaymentForm from './PaymentForm'
import { useCollection } from '@/hooks/useCollection'

export default function PaymentsPage() {
  const { items: payments, create, update, loading } = useCollection('payments')
  const [formOpen, setFormOpen] = useState(false)

  const handleNew = () => setFormOpen(true)

  const handleSave = async (data) => {
    await create(data)
    setFormOpen(false)
  }

  const handleConfirm = async (id) => {
    await update(id, { status: 'confirmed' })
  }

  return (
    <>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Pagamentos</h1>
        <p className="text-sm text-muted-foreground">Registro e acompanhamento de pagamentos recebidos</p>
      </div>
      <PaymentList payments={payments} loading={loading} onNew={handleNew} onConfirm={handleConfirm} />
      <PaymentForm open={formOpen} onClose={() => setFormOpen(false)} onSave={handleSave} />
    </>
  )
}
