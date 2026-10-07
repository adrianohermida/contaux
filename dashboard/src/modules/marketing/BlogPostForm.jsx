import { useState, useEffect } from 'react'
import { Dialog, DialogFooter, Button } from '@/components/ui/dialog'
import { Input, Label, Textarea } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { blogStatusLabels } from './lib/mockData'

export default function BlogPostForm({ open, onClose, onSave, editingPost }) {
  const [form, setForm] = useState({
    title: '', excerpt: '', category: '', author: '', status: 'draft',
    content: '', meta_title: '', meta_description: '', focus_keyword: '',
  })

  useEffect(() => {
    if (editingPost) {
      setForm({
        title: editingPost.title, excerpt: editingPost.excerpt || '',
        category: editingPost.category || '', author: editingPost.author || '',
        status: editingPost.status, content: editingPost.content || '',
        meta_title: editingPost.meta_title || '', meta_description: editingPost.meta_description || '',
        focus_keyword: editingPost.focus_keyword || '',
      })
    } else {
      setForm({ title: '', excerpt: '', category: '', author: '', status: 'draft', content: '', meta_title: '', meta_description: '', focus_keyword: '' })
    }
  }, [editingPost, open])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <Dialog open={open} onClose={onClose} title={editingPost ? 'Editar Post' : 'Novo Post'} className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="bp-title">Título</Label>
          <Input id="bp-title" placeholder="Título do post" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bp-excerpt">Resumo</Label>
          <Textarea id="bp-excerpt" placeholder="Resumo do post..." value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="bp-category">Categoria</Label>
            <Input id="bp-category" placeholder="Ex: Tributação" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bp-author">Autor</Label>
            <Input id="bp-author" placeholder="Nome do autor" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bp-status">Status</Label>
            <Select id="bp-status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {Object.entries(blogStatusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bp-content">Conteúdo</Label>
          <Textarea id="bp-content" placeholder="Conteúdo do post..." value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={6} />
        </div>
        <div className="rounded-md border border-border p-3 space-y-3">
          <p className="text-sm font-medium">SEO</p>
          <div className="space-y-1.5">
            <Label htmlFor="bp-meta-title" className="text-xs">Meta Title</Label>
            <Input id="bp-meta-title" placeholder="Título para SEO" value={form.meta_title} onChange={(e) => setForm({ ...form, meta_title: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bp-meta-desc" className="text-xs">Meta Description</Label>
            <Input id="bp-meta-desc" placeholder="Descrição para SEO" value={form.meta_description} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bp-keyword" className="text-xs">Palavra-chave</Label>
            <Input id="bp-keyword" placeholder="Palavra-chave principal" value={form.focus_keyword} onChange={(e) => setForm({ ...form, focus_keyword: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit">Salvar</Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
