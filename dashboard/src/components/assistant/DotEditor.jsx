import { useState, useEffect } from 'react'
import { Dialog, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const PRESET_COLORS = ['#3763EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#6366F1']

/**
 * Editor de Dots (assistentes configuráveis).
 * Modal com nome, descrição, system prompt e cor.
 */
export default function DotEditor({ open, dot, onSave, onClose }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [systemPrompt, setSystemPrompt] = useState('')
  const [color, setColor] = useState('#3763EB')

  useEffect(() => {
    if (dot) {
      setName(dot.name || '')
      setDescription(dot.description || '')
      setSystemPrompt(dot.system_prompt || '')
      setColor(dot.color || '#3763EB')
    } else {
      setName('')
      setDescription('')
      setSystemPrompt('')
      setColor('#3763EB')
    }
  }, [dot, open])

  const handleSave = () => {
    if (!name.trim()) return
    onSave({ name: name.trim(), description: description.trim(), system_prompt: systemPrompt.trim(), color })
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={dot ? 'Editar Assistente' : 'Novo Assistente'}
      description="Configure um assistente personalizado com instruções específicas."
    >
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Nome *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Assistente Tributário"
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            autoFocus
          />
        </div>
        <div>
          <label className="text-sm font-medium">Descrição</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Especialista em questões tributárias e fiscais"
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Instruções (System Prompt)</label>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="Ex: Você é um especialista em tributação brasileira. Responda sempre com base na legislação atual..."
            rows={5}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Estas instruções substituem o comportamento padrão do assistente.
          </p>
        </div>
        <div>
          <label className="text-sm font-medium">Cor</label>
          <div className="mt-1 flex items-center gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`h-7 w-7 rounded-full transition-transform ${
                  color === c ? 'ring-2 ring-offset-2 ring-ring scale-110' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: c }}
                aria-label={`Cor ${c}`}
              />
            ))}
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} disabled={!name.trim()}>Salvar</Button>
      </DialogFooter>
    </Dialog>
  )
}
