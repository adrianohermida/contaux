import { useState } from 'react'
import InvoiceList from './InvoiceList'
import InvoiceForm from './InvoiceForm'
import { useCollection } from '@/hooks/useCollection'
import { isOverdue } from './lib/format'

/** Aplica status overdue automaticamente em faturas vencidas */
function applyOverdue(invoices) {
  return invoices.map((inv) =>
    inv.status === 'sent' && isOverdue(inv.due_date, inv.status)
      ? { ...inv, status: 'overdue' }
      : inv,
  )
}

export default function InvoicesPage() {
  const { items: invoices, create, update, loading } = useCollection('invoices')
  const { items: clients } = useCollection('clients')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const displayInvoices = applyOverdue(invoices)

  const handleNew = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const handleEdit = (inv) => {
    setEditing(inv)
    setFormOpen(true)
  }

  const handleSave = async (data) => {
    if (editing) {
      await update(editing.id, data)
    } else {
      const num = `NF-2024-${String(invoices.length + 1).padStart(3, '0')}`
      await create({ ...data, number: num })
    }
    setFormOpen(false)
  }

  const handleCancel = async (id) => {
    await update(id, { status: 'cancelled' })
  }

  return (
    <>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Faturas</h1>
        <p className="text-sm text-muted-foreground">Gestão de faturamento e cobranças</p>
      </div>
      <InvoiceList
        invoices={displayInvoices}
        loading={loading}
        onNew={handleNew}
        onEdit={handleEdit}
        onCancel={handleCancel}
      />
      <InvoiceForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        editingInvoice={editing}
        clientNames={clients.map((c) => c.name)}
      />
    </>
  )
}
