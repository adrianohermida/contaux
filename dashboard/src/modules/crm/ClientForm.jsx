import { useState, useEffect } from 'react'
import { Dialog, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input, Label, Textarea } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { validateDocument, formatDocument, formatPhone, formatCEP } from './lib/validation'
import { lookupCEP } from './lib/cep'

const emptyClient = {
  name: '', type: 'PJ', document: '', email: '', phone: '', status: 'active', tags: '',
  address: { street: '', number: '', city: '', state: '', zip: '', complement: '' },
  fiscal: { inscricao_estadual: '', inscricao_municipal: '', regime_tributario: 'Simples Nacional' },
}

export default function ClientForm({ open, onClose, onSave, editingClient }) {
  const [form, setForm] = useState(emptyClient)
  const [errors, setErrors] = useState({})
  const [cepLoading, setCepLoading] = useState(false)

  useEffect(() => {
    if (editingClient) {
      setForm({ ...emptyClient, ...editingClient, tags: (editingClient.tags || []).join(', ') })
    } else {
      setForm(emptyClient)
    }
    setErrors({})
  }, [editingClient, open])

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }))
  const updateAddress = (field, value) => setForm((f) => ({ ...f, address: { ...f.address, [field]: value } }))
  const updateFiscal = (field, value) => setForm((f) => ({ ...f, fiscal: { ...f.fiscal, [field]: value } }))

  const handleCepBlur = async () => {
    const zip = form.address.zip.replace(/\D/g, '')
    if (zip.length !== 8) return
    setCepLoading(true)
    const data = await lookupCEP(zip)
    setCepLoading(false)
    if (data) {
      updateAddress('street', data.street)
      updateAddress('city', data.city)
      updateAddress('state', data.state)
    }
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Nome é obrigatório'
    if (!form.document.trim()) e.document = 'Documento é obrigatório'
    else if (!validateDocument(form.document, form.type)) e.document = form.type === 'PF' ? 'CPF inválido' : 'CNPJ inválido'
    if (!form.email.trim()) e.email = 'Email é obrigatório'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email inválido'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean)
    onSave({ ...form, tags })
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editingClient ? 'Editar Cliente' : 'Novo Cliente'}
      description="Preencha os dados do cliente. Campos com * são obrigatórios."
      className="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Tipo e Status */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Tipo *</Label>
            <Select value={form.type} onChange={(e) => update('type', e.target.value)} className="mt-1">
              <option value="PJ">Pessoa Jurídica</option>
              <option value="PF">Pessoa Física</option>
            </Select>
          </div>
          <div>
            <Label>Status *</Label>
            <Select value={form.status} onChange={(e) => update('status', e.target.value)} className="mt-1">
              <option value="active">Ativo</option>
              <option value="prospect">Prospect</option>
              <option value="inactive">Inativo</option>
            </Select>
          </div>
        </div>

        {/* Nome */}
        <div>
          <Label>Nome / Razão Social *</Label>
          <Input value={form.name} onChange={(e) => update('name', e.target.value)} className="mt-1" />
          {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
        </div>

        {/* Documento */}
        <div>
          <Label>{form.type === 'PF' ? 'CPF' : 'CNPJ'} *</Label>
          <Input
            value={form.document}
            onChange={(e) => update('document', formatDocument(e.target.value, form.type))}
            className="mt-1"
            placeholder={form.type === 'PF' ? '000.000.000-00' : '00.000.000/0000-00'}
          />
          {errors.document && <p className="mt-1 text-xs text-destructive">{errors.document}</p>}
        </div>

        {/* Email e Telefone */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <Label>Email *</Label>
            <Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="mt-1" />
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
          </div>
          <div>
            <Label>Telefone</Label>
            <Input value={form.phone} onChange={(e) => update('phone', formatPhone(e.target.value))} className="mt-1" placeholder="(00) 00000-0000" />
          </div>
        </div>

        {/* Endereço */}
        <div className="rounded-md border border-border p-3">
          <p className="mb-3 text-sm font-medium">Endereço</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="col-span-2 sm:col-span-1">
              <Label className="text-xs">CEP</Label>
              <Input
                value={form.address.zip}
                onChange={(e) => updateAddress('zip', formatCEP(e.target.value))}
                onBlur={handleCepBlur}
                className="mt-1"
                placeholder="00000-000"
              />
              {cepLoading && <p className="mt-1 text-xs text-muted-foreground">Buscando...</p>}
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Logradouro</Label>
              <Input value={form.address.street} onChange={(e) => updateAddress('street', e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Número</Label>
              <Input value={form.address.number} onChange={(e) => updateAddress('number', e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Cidade</Label>
              <Input value={form.address.city} onChange={(e) => updateAddress('city', e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Estado</Label>
              <Input maxLength="2" value={form.address.state} onChange={(e) => updateAddress('state', e.target.value.toUpperCase())} className="mt-1" />
            </div>
            <div className="col-span-2 sm:col-span-3">
              <Label className="text-xs">Complemento</Label>
              <Input value={form.address.complement} onChange={(e) => updateAddress('complement', e.target.value)} className="mt-1" />
            </div>
          </div>
        </div>

        {/* Dados Fiscais (apenas PJ) */}
        {form.type === 'PJ' && (
          <div className="rounded-md border border-border p-3">
            <p className="mb-3 text-sm font-medium">Dados Fiscais</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs">Inscrição Estadual</Label>
                <Input value={form.fiscal.inscricao_estadual} onChange={(e) => updateFiscal('inscricao_estadual', e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Inscrição Municipal</Label>
                <Input value={form.fiscal.inscricao_municipal} onChange={(e) => updateFiscal('inscricao_municipal', e.target.value)} className="mt-1" />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Regime Tributário</Label>
                <Select value={form.fiscal.regime_tributario} onChange={(e) => updateFiscal('regime_tributario', e.target.value)} className="mt-1">
                  <option>Simples Nacional</option>
                  <option>Lucro Presumido</option>
                  <option>Lucro Real</option>
                  <option>MEI</option>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Tags */}
        <div>
          <Label>Tags (separadas por vírgula)</Label>
          <Input value={form.tags} onChange={(e) => update('tags', e.target.value)} className="mt-1" placeholder="Premium, Mensal" />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit}>{editingClient ? 'Salvar' : 'Criar'}</Button>
      </DialogFooter>
    </Dialog>
  )
}
