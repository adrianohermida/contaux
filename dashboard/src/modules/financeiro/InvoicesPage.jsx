import { useState } from 'react'
import InvoiceList from './InvoiceList'
import InvoiceForm from './InvoiceForm'
import { mockInvoices } from './lib/mockData'
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
  const [invoices, setInvoices] = useState(() => applyOverdue(mockInvoices))
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const handleNew = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const handleEdit = (inv) => {
    setEditing(inv)
    setFormOpen(true)
  }

  const handleSave = (data) => {
    if (editing) {
      setInvoices((prev) =>
        prev.map((i) => (i.id === editing.id ? { ...i, ...data } : i)),
      )
    } else {
      const num = `NF-2024-${String(invoices.length + 1).padStart(3, '0')}`
      setInvoices((prev) => [
        { ...data, id: String(Date.now()), number: num },
        ...prev,
      ])
    }
    setFormOpen(false)
  }

  const handleCancel = (id) => {
    setInvoices((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: 'cancelled' } : i)),
    )
  }

  return (
    <>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Faturas</h1>
        <p className="text-sm text-muted-foreground">Gestão de faturamento e cobranças</p>
      </div>
      <InvoiceList
        invoices={invoices}
        onNew={handleNew}
        onEdit={handleEdit}
        onCancel={handleCancel}
      />
      <InvoiceForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        editingInvoice={editing}
      />
    </>
  )
}
