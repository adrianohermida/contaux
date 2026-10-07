import { useState } from 'react'
import QuoteList from './QuoteList'
import QuoteForm from './QuoteForm'
import { mockQuotes } from './lib/mockData'

export default function QuotesPage() {
  const [quotes, setQuotes] = useState(mockQuotes)
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

  const handleSave = (data) => {
    if (editing) {
      setQuotes((prev) => prev.map((q) => (q.id === editing.id ? { ...q, ...data } : q)))
    } else {
      const num = `ORC-2024-${String(quotes.length + 1).padStart(3, '0')}`
      setQuotes((prev) => [{ ...data, id: String(Date.now()), number: num }, ...prev])
    }
    setFormOpen(false)
  }

  /** Converte orçamento aceito em fatura */
  const handleConvert = (quote) => {
    const invoiceNum = `NF-2024-${String(Date.now()).slice(-3)}`
    setQuotes((prev) =>
      prev.map((q) => (q.id === quote.id ? { ...q, status: 'accepted' } : q)),
    )
    // Em produção, isto criaria uma fatura via backend
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
