import { useState, useEffect } from 'react'
import { Dialog, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input, Label, Textarea } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

const emptyDoc = {
  name: '',
  category: '',
  type: 'template',
  content: '',
}

const typeLabels = {
  template: 'Template',
  contract: 'Contrato',
  guide: 'Guia',
  policy: 'Política',
  other: 'Outro',
}

export default function DocumentForm({ open, onClose, onSave, editingDocument }) {
  const [form, setForm] = useState(emptyDoc)

  useEffect(() => {
    if (editingDocument) {
      setForm({
        name: editingDocument.name || '',
        category: editingDocument.category || '',
        type: editingDocument.type || 'template',
        content: editingDocument.content || '',
      })
    } else {
      setForm(emptyDoc)
    }
  }, [editingDocument, open])

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      ...form,
      updated: new Date().toISOString().slice(0, 10),
    })
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editingDocument ? 'Editar Documento' : 'Novo Documento'}
      description="Cadastre templates e documentos do escritório"
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="doc-name">Nome *</Label>
          <Input id="doc-name" placeholder="Nome do documento" value={form.name} onChange={(e) => update('name', e.target.value)} required />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="doc-category">Categoria</Label>
            <Input id="doc-category" placeholder="Ex: Fiscal, Trabalhista" value={form.category} onChange={(e) => update('category', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="doc-type">Tipo</Label>
            <Select id="doc-type" value={form.type} onChange={(e) => update('type', e.target.value)}>
              {Object.entries(typeLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </Select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="doc-content">Conteúdo / Descrição</Label>
          <Textarea id="doc-content" placeholder="Conteúdo ou descrição do documento..." value={form.content} onChange={(e) => update('content', e.target.value)} rows={6} />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit">{editingDocument ? 'Salvar' : 'Criar'}</Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
