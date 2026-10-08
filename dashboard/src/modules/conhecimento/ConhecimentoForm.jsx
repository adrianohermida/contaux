import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogFooter, Button } from '@/components/ui/dialog'
import { Input, Label, Textarea } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'
import { UploadCloud, X, Lock, Globe, FileText } from 'lucide-react'
import { request } from '@/lib/api'

const AREA_TAGS = ['Tributário', 'Trabalhista', 'Societário', 'Fiscal', 'Contábil', 'LGPD']
const TYPES = [
  { value: 'article', label: 'Artigo' },
  { value: 'legislation', label: 'Legislação' },
  { value: 'book', label: 'Livro/PDF' },
  { value: 'faq', label: 'FAQ' },
]

export default function ConhecimentoForm({ open, onClose, onSave, editingItem }) {
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      setForm(editingItem ? { ...editingItem } : {
        title: '', type: 'article', summary: '', content: '',
        tags: [], visibility: 'private', author: '', source: '', status: 'draft',
        file_url: '', file_name: '',
      })
    }
  }, [open, editingItem])

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }))

  const toggleTag = (tag) => {
    setForm((p) => {
      const tags = p.tags || []
      return { ...p, tags: tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag] }
    })
  }

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('visibility', form.visibility || 'private')
      const res = await fetch('/api/knowledge-base/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('contaux-token')}` },
        body: fd,
      })
      if (!res.ok) throw new Error('Falha no upload')
      const data = await res.json()
      set('file_url', data.file_url)
      set('file_name', data.file_name)
      toast('Arquivo enviado com sucesso', 'success')
    } catch {
      toast('Erro ao enviar arquivo', 'error')
    }
    setUploading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title?.trim()) return toast('Título é obrigatório', 'error')
    setSaving(true)
    try {
      await onSave({ ...form, tags: form.tags || [] })
    } finally {
      setSaving(false)
    }
  }

  const showFileUpload = form.type === 'book' || form.type === 'legislation'
  const showContent = form.type === 'article' || form.type === 'faq'

  return (
    <Dialog open={open} onClose={onClose} title={editingItem ? 'Editar Item' : 'Novo Item'} description="Base de conhecimento — artigos, legislação, livros e FAQs" className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Título *</Label>
          <Input value={form.title || ''} onChange={(e) => set('title', e.target.value)} placeholder="Título do item" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Tipo</Label>
            <Select value={form.type || 'article'} onChange={(e) => set('type', e.target.value)}>
              {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </Select>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status || 'draft'} onChange={(e) => set('status', e.target.value)}>
              <option value="draft">Rascunho</option>
              <option value="published">Publicado</option>
            </Select>
          </div>
        </div>

        <div>
          <Label>Tags (área contábil)</Label>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {AREA_TAGS.map((tag) => (
              <button type="button" key={tag} onClick={() => toggleTag(tag)}>
                <Badge variant={(form.tags || []).includes(tag) ? 'default' : 'outline'} className="cursor-pointer">{tag}</Badge>
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label>Resumo</Label>
          <Textarea value={form.summary || ''} onChange={(e) => set('summary', e.target.value)} placeholder="Resumo curto para listagem" rows={2} />
        </div>

        {showContent && (
          <div>
            <Label>Conteúdo</Label>
            <Textarea value={form.content || ''} onChange={(e) => set('content', e.target.value)} placeholder="Corpo do texto" rows={8} />
          </div>
        )}

        {showFileUpload && (
          <div>
            <Label>Arquivo PDF</Label>
            {form.file_url ? (
              <div className="flex items-center justify-between rounded-md border border-border p-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm">{form.file_name}</span>
                </div>
                <button type="button" onClick={() => { set('file_url', ''); set('file_name', '') }}>
                  <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border p-6 hover:bg-muted/50"
              >
                <UploadCloud className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{uploading ? 'Enviando...' : 'Clique para enviar PDF'}</span>
                <input ref={fileRef} type="file" accept=".pdf,application/pdf" onChange={handleFile} className="hidden" />
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Autor</Label>
            <Input value={form.author || ''} onChange={(e) => set('author', e.target.value)} placeholder="Autor ou fonte" />
          </div>
          <div>
            <Label>Fonte / Referência</Label>
            <Input value={form.source || ''} onChange={(e) => set('source', e.target.value)} placeholder="ex: Lei 13.709/2018" />
          </div>
        </div>

        <div>
          <Label>Visibilidade do arquivo</Label>
          <div className="flex gap-2 mt-1">
            <button type="button" onClick={() => set('visibility', 'private')}>
              <Badge variant={form.visibility === 'private' ? 'default' : 'outline'} className="cursor-pointer">
                <Lock className="h-3 w-3 mr-1" /> Privado
              </Badge>
            </button>
            <button type="button" onClick={() => set('visibility', 'public')}>
              <Badge variant={form.visibility === 'public' ? 'default' : 'outline'} className="cursor-pointer">
                <Globe className="h-3 w-3 mr-1" /> Público
              </Badge>
            </button>
          </div>
        </div>
      </form>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} disabled={saving || uploading}>
          {saving ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
