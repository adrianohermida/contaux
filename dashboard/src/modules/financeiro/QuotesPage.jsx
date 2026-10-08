import { useState } from 'react'
import QuoteList from './QuoteList'
import QuoteForm from './QuoteForm'
import { useCollection } from '@/hooks/useCollection'

export default function QuotesPage() {
  const { items: quotes, create, update, loading } = useCollection('quotes')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const handleNew = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const handleEdit = (q) => {
    setEditing(q)
    setFormOpen(true)
  }

  const handleSave = async (data) => {
    if (editing) {
      await update(editing.id, data)
    } else {
      const num = `ORC-2024-${String(quotes.length + 1).padStart(3, '0')}`
      await create({ ...data, number: num })
    }
    setFormOpen(false)
  }

  const handleConvert = async (quote) => {
    await update(quote.id, { status: 'accepted' })
    const invoiceNum = `NF-2024-${String(Date.now()).slice(-3)}`
    alert(`Orçamento ${quote.number} convertido em fatura ${invoiceNum}.`)
  }

  return (
    <>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Orçamentos</h1>
        <p className="text-sm text-muted-foreground">Propostas e orçamentos enviados aos clientes</p>
      </div>
      <QuoteList
        quotes={quotes}
        loading={loading}
        onNew={handleNew}
        onEdit={handleEdit}
        onConvert={handleConvert}
      />
      <QuoteForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        editingQuote={editing}
      />
    </>
  )
}
