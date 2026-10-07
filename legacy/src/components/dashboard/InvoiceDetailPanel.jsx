import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Edit2, Trash2, FileText, Loader2, AlertCircle, CheckCircle, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function InvoiceDetailPanel({ clientId, tenantId }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    invoice_number: '',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: '',
    total_amount: '',
    tax_amount: '',
    paid_amount: '',
    status: 'draft',
    items: [],
    notes: ''
  });

  const STATUSES = [
    { value: 'draft', label: '📝 Rascunho', color: 'gray' },
    { value: 'sent', label: '📤 Enviado', color: 'blue' },
    { value: 'viewed', label: '👁 Visualizado', color: 'blue' },
    { value: 'paid', label: '✓ Pago', color: 'green' },
    { value: 'overdue', label: '⚠ Vencido', color: 'red' },
    { value: 'cancelled', label: '✗ Cancelado', color: 'red' }
  ];

  useEffect(() => {
    loadInvoices();
  }, [clientId, tenantId]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await base44.entities.Invoice.filter({
        tenant_id: tenantId,
        client_id: clientId
      });
      setInvoices(data || []);
    } catch (error) {
      console.error('Erro ao carregar faturas:', error);
      toast.error('Erro ao carregar faturas');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.invoice_number) {
      toast.error('Número da fatura obrigatório');
      return false;
    }

    if (!formData.due_date) {
      toast.error('Data de vencimento obrigatória');
      return false;
    }

    if (!formData.total_amount || parseFloat(formData.total_amount) <= 0) {
      toast.error('Valor total deve ser maior que zero');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      const data = {
        ...formData,
        total_amount: parseFloat(formData.total_amount),
        tax_amount: parseFloat(formData.tax_amount || 0),
        paid_amount: parseFloat(formData.paid_amount || 0),
        tenant_id: tenantId,
        client_id: clientId
      };

      if (editingId) {
        await base44.entities.Invoice.update(editingId, data);
        toast.success('Fatura atualizada!');
      } else {
        await base44.entities.Invoice.create(data);
        toast.success('Fatura criada!');
      }

      resetForm();
      await loadInvoices();
    } catch (error) {
      console.error('Erro ao salvar fatura:', error);
      toast.error('Erro ao salvar fatura');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Confirmar exclusão?')) return;

    try {
      setLoading(true);
      await base44.entities.Invoice.delete(id);
      toast.success('Fatura removida');
      await loadInvoices();
    } catch (error) {
      console.error('Erro ao deletar:', error);
      toast.error('Erro ao deletar fatura');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (invoice) => {
    setFormData({
      invoice_number: invoice.invoice_number,
      issue_date: invoice.issue_date,
      due_date: invoice.due_date,
      total_amount: invoice.total_amount.toString(),
      tax_amount: (invoice.tax_amount || 0).toString(),
      paid_amount: (invoice.paid_amount || 0).toString(),
      status: invoice.status,
      items: invoice.items || [],
      notes: invoice.notes || ''
    });
    setEditingId(invoice.id);
  };

  const resetForm = () => {
    setFormData({
      invoice_number: '',
      issue_date: new Date().toISOString().split('T')[0],
      due_date: '',
      total_amount: '',
      tax_amount: '',
      paid_amount: '',
      status: 'draft',
      items: [],
      notes: ''
    });
    setEditingId(null);
  };

  const getStatusColor = (status) => {
    const item = STATUSES.find(s => s.value === status);
    const colorMap = {
      gray: 'bg-gray-50 border-gray-200 text-gray-800',
      blue: 'bg-blue-50 border-blue-200 text-blue-800',
      green: 'bg-green-50 border-green-200 text-green-800',
      red: 'bg-red-50 border-red-200 text-red-800'
    };
    return colorMap[item?.color] || colorMap.gray;
  };

  const getStatusIcon = (status) => {
    if (status === 'paid') return <CheckCircle className="w-4 h-4" />;
    if (status === 'overdue') return <AlertCircle className="w-4 h-4" />;
    if (status === 'cancelled') return <AlertCircle className="w-4 h-4" />;
    return null;
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-slate-50 p-4 rounded-lg space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Número da Fatura *</label>
            <input
              type="text"
              value={formData.invoice_number}
              onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
              placeholder="NF-001"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Data de Emissão</label>
            <input
              type="date"
              value={formData.issue_date}
              onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Data de Vencimento *</label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Valor Total (R$) *</label>
            <input
              type="number"
              step="0.01"
              value={formData.total_amount}
              onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
              placeholder="0,00"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Impostos (R$)</label>
            <input
              type="number"
              step="0.01"
              value={formData.tax_amount}
              onChange={(e) => setFormData({ ...formData, tax_amount: e.target.value })}
              placeholder="0,00"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Valor Pago (R$)</label>
            <input
              type="number"
              step="0.01"
              value={formData.paid_amount}
              onChange={(e) => setFormData({ ...formData, paid_amount: e.target.value })}
              placeholder="0,00"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              {STATUSES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Observações</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notas da fatura"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {editingId ? 'Atualizar' : 'Criar'} Fatura
          </Button>
          {editingId && (
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancelar
            </Button>
          )}
        </div>
      </form>

      {/* List */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Faturas</h3>
        {loading && !invoices.length ? (
          <div className="text-center py-8 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            Carregando...
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <FileText className="w-6 h-6 mx-auto mb-2 opacity-50" />
            Nenhuma fatura criada
          </div>
        ) : (
          invoices.map((invoice) => (
            <div key={invoice.id} className={`rounded-lg border p-4 ${getStatusColor(invoice.status)}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-lg">
                      {invoice.invoice_number}
                    </span>
                    {getStatusIcon(invoice.status)}
                    <span className="text-xs px-2 py-1 bg-opacity-30 rounded">
                      {STATUSES.find(s => s.value === invoice.status)?.label}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 text-sm text-opacity-75 mt-2">
                    <div>
                      <p className="text-xs opacity-75">Emissão</p>
                      <p>{new Date(invoice.issue_date).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div>
                      <p className="text-xs opacity-75">Vencimento</p>
                      <p>
                        {new Date(invoice.due_date).toLocaleDateString('pt-BR')}
                        {isOverdue(invoice.due_date) && invoice.status !== 'paid' && (
                          <span className="text-red-600 ml-1">⚠ Vencido</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 text-sm mt-3 font-medium">
                    <div>
                      <p className="text-xs opacity-75">Total</p>
                      <p className="text-base">R$ {invoice.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                    {invoice.paid_amount > 0 && (
                      <div>
                        <p className="text-xs opacity-75">Pago</p>
                        <p className="text-base text-green-600">R$ {invoice.paid_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      </div>
                    )}
                    {invoice.total_amount - invoice.paid_amount > 0 && (
                      <div>
                        <p className="text-xs opacity-75">Pendente</p>
                        <p className="text-base text-orange-600">R$ {(invoice.total_amount - invoice.paid_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      </div>
                    )}
                  </div>

                  {invoice.notes && (
                    <p className="text-xs text-opacity-75 mt-2 italic">{invoice.notes}</p>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(invoice)}
                    disabled={loading}
                    className="opacity-75"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(invoice.id)}
                    disabled={loading}
                    className="opacity-75"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}