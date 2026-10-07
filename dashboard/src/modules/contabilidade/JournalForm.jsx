import { useState, useEffect } from 'react'
import { Dialog, DialogFooter, Button } from '@/components/ui/dialog'
import { Input, Label } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { mockAccounts } from './lib/mockData'
import { formatCurrency } from './lib/format'
import { Plus, Trash2 } from 'lucide-react'

export default function JournalForm({ open, onClose, onSave, editingEntry }) {
  const [date, setDate] = useState('')
  const [description, setDescription] = useState('')
  const [reference, setReference] = useState('')
  const [lines, setLines] = useState([
    { account_code: '', debit: 0, credit: 0 },
    { account_code: '', debit: 0, credit: 0 },
  ])

  useEffect(() => {
    if (editingEntry) {
      setDate(editingEntry.date)
      setDescription(editingEntry.description)
      setReference(editingEntry.reference)
      setLines(editingEntry.lines.map((l) => ({ account_code: l.account_code, debit: l.debit, credit: l.credit })))
    } else {
      setDate(new Date().toISOString().slice(0, 10))
      setDescription('')
      setReference('')
      setLines([{ account_code: '', debit: 0, credit: 0 }, { account_code: '', debit: 0, credit: 0 }])
    }
  }, [editingEntry, open])

  const totalDebit = lines.reduce((s, l) => s + (Number(l.debit) || 0), 0)
  const totalCredit = lines.reduce((s, l) => s + (Number(l.credit) || 0), 0)
  const balanced = totalDebit === totalCredit && totalDebit > 0

  const updateLine = (idx, field, value) => {
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, [field]: value } : l)))
  }

  const addLine = () => setLines((prev) => [...prev, { account_code: '', debit: 0, credit: 0 }])
  const removeLine = (idx) => setLines((prev) => prev.filter((_, i) => i !== idx))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!balanced) return
    const enrichedLines = lines
      .filter((l) => l.account_code)
      .map((l) => ({
        ...l,
        account_name: mockAccounts.find((a) => a.code === l.account_code)?.name || '',
        debit: Number(l.debit) || 0,
        credit: Number(l.credit) || 0,
      }))
    onSave({ date, description, reference, lines: enrichedLines })
  }

  return (
    <Dialog open={open} onClose={onClose} title={editingEntry ? 'Editar Lançamento' : 'Novo Lançamento'} className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="je-date">Data</Label>
            <Input id="je-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="je-ref">Referência</Label>
            <Input id="je-ref" placeholder="Ex: NF-2024-001" value={reference} onChange={(e) => setReference(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="je-desc">Descrição</Label>
          <Input id="je-desc" placeholder="Descrição do lançamento" value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>

        <div className="space-y-2">
          <Label>Partidas (Débito = Crédito)</Label>
          {lines.map((line, idx) => (
            <div key={idx} className="flex flex-wrap items-end gap-2">
              <div className="flex-1 min-w-[140px]">
                <Select value={line.account_code} onChange={(e) => updateLine(idx, 'account_code', e.target.value)}>
                  <option value="">Selecione a conta</option>
                  {mockAccounts.filter((a) => a.level >= 2).map((a) => (
                    <option key={a.id} value={a.code}>{a.code} - {a.name}</option>
                  ))}
                </Select>
              </div>
              <div className="w-24">
                <Input type="number" step="0.01" placeholder="Débito" value={line.debit || ''} onChange={(e) => updateLine(idx, 'debit', e.target.value)} />
              </div>
              <div className="w-24">
                <Input type="number" step="0.01" placeholder="Crédito" value={line.credit || ''} onChange={(e) => updateLine(idx, 'credit', e.target.value)} />
              </div>
              {lines.length > 2 && (
                <Button type="button" variant="ghost" size="icon" onClick={() => removeLine(idx)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addLine}>
            <Plus className="h-4 w-4" /> Adicionar Linha
          </Button>
        </div>

        <div className="flex items-center justify-between rounded-md border border-border p-3 text-sm">
          <span>Débito: <strong className="font-mono">{formatCurrency(totalDebit)}</strong></span>
          <span>Crédito: <strong className="font-mono">{formatCurrency(totalCredit)}</strong></span>
          <span className={balanced ? 'text-primary font-medium' : 'text-destructive font-medium'}>
            {balanced ? '✓ Equilibrado' : '✗ Desequilibrado'}
          </span>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={!balanced}>Salvar</Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
