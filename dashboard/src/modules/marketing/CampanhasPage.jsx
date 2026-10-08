import { useState } from 'react'
import CampaignList from './CampaignList'
import CampaignForm from './CampaignForm'
import { useCollection } from '@/hooks/useCollection'

export default function CampanhasPage() {
  const { items: campaigns, create, update, loading } = useCollection('campaigns')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const handleNew = () => { setEditing(null); setFormOpen(true) }
  const handleEdit = (camp) => { setEditing(camp); setFormOpen(true) }

  const handleSave = async (data) => {
    if (editing) {
      await update(editing.id, data)
    } else {
      await create({
        ...data, status: 'draft',
        metrics: { sent: 0, opened: 0, clicked: 0, converted: 0 },
      })
    }
    setFormOpen(false)
  }

  return (
    <>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Campanhas de Marketing</h1>
        <p className="text-sm text-muted-foreground">Gestão de campanhas e métricas de conversão</p>
      </div>
      <CampaignList campaigns={campaigns} loading={loading} onNew={handleNew} onEdit={handleEdit} />
      <CampaignForm open={formOpen} onClose={() => setFormOpen(false)} onSave={handleSave} editingCampaign={editing} />
    </>
  )
}
