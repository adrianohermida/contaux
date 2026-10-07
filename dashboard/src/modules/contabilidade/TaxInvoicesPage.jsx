import { useState } from 'react'
import TaxInvoiceList from './TaxInvoiceList'
import TaxInvoiceForm from './TaxInvoiceForm'
import { mockTaxInvoices } from './lib/mockData'

export default function TaxInvoicesPage() {
  const [invoices, setInvoices] = useState(mockTaxInvoices)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const handleNew = () => { setEditing(null); setFormOpen(true) }
  const handleEdit = (inv) => { setEditing(inv); setFormOpen(true) }

  const handleSave = (data) => {
    if (editing) {
      setInvoices((prev) => prev.map((i) => (i.id === editing.id ? { ...i, ...data } : i)))
    } else {
      const num = `NFe-${String(invoices.length + 1).padStart(3, '0')}-2026`
      setInvoices((prev) => [{ ...data, id: String(Date.now()), number: num, status: 'draft' }, ...prev])
    }
    setFormOpen(false)
  }

  const handleIssue = (id) => {
    setInvoices((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'issued' } : i)))
  }

  const handleCancel = (id) => {
    setInvoices((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'cancelled' } : i)))
  }

  return (
    <>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Notas Fiscais (NFe)</h1>
        <p className="text-sm text-muted-foreground">Emissão e gestão de notas fiscais eletrônicas</p>
      </div>
      <TaxInvoiceList invoices={invoices} onNew={handleNew} onEdit={handleEdit} onIssue={handleIssue} onCancel={handleCancel} />
      <TaxInvoiceForm open={formOpen} onClose={() => setFormOpen(false)} onSave={handleSave} editingInvoice={editing} />
    </>
  )
}
