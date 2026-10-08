import { useState } from 'react'
import AccountList from './AccountList'
import AccountForm from './AccountForm'
import { useCollection } from '@/hooks/useCollection'

export default function AccountsPage() {
  const { items: accounts, create, update, loading } = useCollection('accounts')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const handleNew = () => { setEditing(null); setFormOpen(true) }
  const handleEdit = (acc) => { setEditing(acc); setFormOpen(true) }

  const handleSave = async (data) => {
    if (editing) {
      await update(editing.id, data)
    } else {
      await create({ ...data, active: true })
    }
    setFormOpen(false)
  }

  const handleToggle = async (id) => {
    const acc = accounts.find((a) => String(a.id) === String(id))
    if (acc) await update(id, { active: !acc.active })
  }

  return (
    <>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Plano de Contas</h1>
        <p className="text-sm text-muted-foreground">Estrutura hierárquica de contas contábeis</p>
      </div>
      <AccountList
        accounts={accounts}
        loading={loading}
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
