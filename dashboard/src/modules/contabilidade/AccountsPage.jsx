import { useState } from 'react'
import AccountList from './AccountList'
import AccountForm from './AccountForm'
import { mockAccounts, accountTypeLabels } from './lib/mockData'

export default function AccountsPage() {
  const [accounts, setAccounts] = useState(mockAccounts)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const handleNew = () => { setEditing(null); setFormOpen(true) }
  const handleEdit = (acc) => { setEditing(acc); setFormOpen(true) }

  const handleSave = (data) => {
    if (editing) {
      setAccounts((prev) => prev.map((a) => (a.id === editing.id ? { ...a, ...data } : a)))
    } else {
      setAccounts((prev) => [...prev, { ...data, id: String(Date.now()), active: true }])
    }
    setFormOpen(false)
  }

  const handleToggle = (id) => {
    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a)))
  }

  return (
    <>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Plano de Contas</h1>
        <p className="text-sm text-muted-foreground">Estrutura hierárquica de contas contábeis</p>
      </div>
      <AccountList
        accounts={accounts}
        onNew={handleNew}
        onEdit={handleEdit}
        onToggle={handleToggle}
      />
      <AccountForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        editingAccount={editing}
        accounts={accounts}
      />
    </>
  )
}
