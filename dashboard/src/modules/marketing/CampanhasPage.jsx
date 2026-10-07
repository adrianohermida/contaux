import { useState } from 'react'
import CampaignList from './CampaignList'
import CampaignForm from './CampaignForm'
import { mockCampaigns } from './lib/mockData'

export default function CampanhasPage() {
  const [campaigns, setCampaigns] = useState(mockCampaigns)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const handleNew = () => { setEditing(null); setFormOpen(true) }
  const handleEdit = (camp) => { setEditing(camp); setFormOpen(true) }

  const handleSave = (data) => {
    if (editing) {
      setCampaigns((prev) => prev.map((c) => (c.id === editing.id ? { ...c, ...data } : c)))
    } else {
      setCampaigns((prev) => [{ ...data, id: String(Date.now()), status: 'draft', metrics: { sent: 0, opened: 0, clicked: 0, converted: 0 } }, ...prev])
    }
    setFormOpen(false)
  }

  return (
    <>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Campanhas de Marketing</h1>
        <p className="text-sm text-muted-foreground">Gestão de campanhas e métricas de conversão</p>
      </div>
      <CampaignList campaigns={campaigns} onNew={handleNew} onEdit={handleEdit} />
      <CampaignForm open={formOpen} onClose={() => setFormOpen(false)} onSave={handleSave} editingCampaign={editing} />
    </>
  )
}
