import { useState } from 'react'
import TaxInvoiceList from './TaxInvoiceList'
import TaxInvoiceForm from './TaxInvoiceForm'
import { useCollection } from '@/hooks/useCollection'

export default function TaxInvoicesPage() {
  const { items: invoices, create, update, loading } = useCollection('tax_invoices')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const handleNew = () => { setEditing(null); setFormOpen(true) }
  const handleEdit = (inv) => { setEditing(inv); setFormOpen(true) }

  const handleSave = async (data) => {
    if (editing) {
      await update(editing.id, data)
    } else {
      const num = `NFe-${String(invoices.length + 1).padStart(3, '0')}-2026`
      await create({ ...data, number: num, status: 'draft' })
    }
    setFormOpen(false)
  }

  const handleIssue = async (id) => {
    await update(id, { status: 'issued' })
  }

  const handleCancel = async (id) => {
    await update(id, { status: 'cancelled' })
  }

  return (
    <>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Notas Fiscais (NFe)</h1>
        <p className="text-sm text-muted-foreground">Emissão e gestão de notas fiscais eletrônicas</p>
      </div>
      <TaxInvoiceList invoices={invoices} loading={loading} onNew={handleNew} onEdit={handleEdit} onIssue={handleIssue} onCancel={handleCancel} />
      <TaxInvoiceForm open={formOpen} onClose={() => setFormOpen(false)} onSave={handleSave} editingInvoice={editing} />
    </>
  )
}
