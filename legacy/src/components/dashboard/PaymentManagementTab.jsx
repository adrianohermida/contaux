import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Edit2, Trash2, DollarSign, Loader2, CheckCircle, Clock, AlertCircle, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function PaymentManagementTab({ clientId, tenantId }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    invoice_id: '',
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'bank_transfer',
    reference_number: '',
    status: 'completed',
    notes: ''
  });

  const PAYMENT_METHODS = [
    { value: 'bank_transfer', label: '🏦 Transferência Bancária' },
    { value: 'credit_card', label: '💳 Cartão de Crédito' },
    { value: 'debit_card', label: '💳 Cartão de Débito' },
    { value: 'pix', label: '📱 PIX' },
    { value: 'check', label: '📋 Cheque' },
    { value: 'cash', label: '💵 Dinheiro' },
    { value: 'other', label: 'Outro' }
  ];

  const STATUSES = [
    { value: 'pending', label: '⏳ Pendente', color: 'yellow' },
    { value: 'completed', label: '✓ Concluído', color: 'green' },
    { value: 'failed', label: '✗ Falhou', color: 'red' },
    { value: 'refunded', label: '↩ Reembolsado', color: 'gray' },
    { value: 'partially_paid', label: '⚠ Parcialmente Pago', color: 'blue' }
  ];

  useEffect(() => {
    loadPayments();
  }, [clientId, tenantId]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const data = await base44.entities.Payment.filter({
        tenant_id: tenantId,
        client_id: clientId
      });
      setPayments(data || []);
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error);
      toast.error('Erro ao carregar pagamentos');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Valor deve ser maior que zero');
      return false;
    }

    if (!formData.payment_date) {
      toast.error('Data de pagamento obrigatória');
      return false;
    }

    if (new Date(formData.payment_date) > new Date()) {
      toast.error('Data não pode ser no futuro');
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
        amount: parseFloat(formData.amount),
        tenant_id: tenantId,
        client_id: clientId
      };

      if (editingId) {
        await base44.entities.Payment.update(editingId, data);
        toast.success('Pagamento atualizado!');
      } else {
        await base44.entities.Payment.create(data);
        toast.success('Pagamento registrado!');
      }

      resetForm();
      await loadPayments();
    } catch (error) {
      console.error('Erro ao salvar pagamento:', error);
      toast.error('Erro ao salvar pagamento');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Confirmar exclusão?')) return;

    try {
      setLoading(true);
      await base44.entities.Payment.delete(id);
      toast.success('Pagamento removido');
      await loadPayments();
    } catch (error) {
      console.error('Erro ao deletar:', error);
      toast.error('Erro ao deletar pagamento');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (payment) => {
    setFormData({
      invoice_id: payment.invoice_id || '',
      amount: payment.amount.toString(),
      payment_date: payment.payment_date,
      payment_method: payment.payment_method,
      reference_number: payment.reference_number || '',
      status: payment.status,
      notes: payment.notes || ''
    });
    setEditingId(payment.id);
  };

  const resetForm = () => {
    setFormData({
      invoice_id: '',
      amount: '',
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'bank_transfer',
      reference_number: '',
      status: 'completed',
      notes: ''
    });
    setEditingId(null);
  };

  const getStatusColor = (status) => {
    const item = STATUSES.find(s => s.value === status);
    const colorMap = {
      yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      green: 'bg-green-50 border-green-200 text-green-800',
      red: 'bg-red-50 border-red-200 text-red-800',
      gray: 'bg-gray-50 border-gray-200 text-gray-800',
      blue: 'bg-blue-50 border-blue-200 text-blue-800'
    };
    return colorMap[item?.color] || colorMap.gray;
  };

  const getStatusIcon = (status) => {
    if (status === 'completed') return <CheckCircle className="w-4 h-4" />;
    if (status === 'pending') return <Clock className="w-4 h-4" />;
    if (status === 'failed') return <AlertCircle className="w-4 h-4" />;
    return null;
  };

  const filteredPayments = filterStatus === 'all' 
    ? payments 
    : payments.filter(p => p.status === filterStatus);

  const totalPaid = filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-slate-50 p-4 rounded-lg space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Valor (R$) *</label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0,00"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Data do Pagamento *</label>
            <input
              type="date"
              value={formData.payment_date}
              onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Método</label>
            <select
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              {PAYMENT_METHODS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Fatura (ID)</label>
            <input
              type="text"
              value={formData.invoice_id}
              onChange={(e) => setFormData({ ...formData, invoice_id: e.target.value })}
              placeholder="ID da fatura"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Referência</label>
            <input
              type="text"
              value={formData.reference_number}
              onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
              placeholder="Nº comprovante/protocolo"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

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
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Observações</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Notas adicionais"
            rows="2"
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {editingId ? 'Atualizar' : 'Registrar'} Pagamento
          </Button>
          {editingId && (
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancelar
            </Button>
          )}
        </div>
      </form>

      {/* Filters & Summary */}
      <div className="bg-white rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1 border rounded-lg text-sm"
          >
            <option value="all">Todos</option>
            {STATUSES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-600">Total Pago</p>
          <p className="text-2xl font-bold text-green-600">
            R$ {totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Pagamentos Registrados</h3>
        {loading && !payments.length ? (
          <div className="text-center py-8 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            Carregando...
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <DollarSign className="w-6 h-6 mx-auto mb-2 opacity-50" />
            Nenhum pagamento encontrado
          </div>
        ) : (
          filteredPayments.map((payment) => (
            <div key={payment.id} className={`rounded-lg border p-4 ${getStatusColor(payment.status)}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-lg">
                      R$ {payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    {getStatusIcon(payment.status)}
                    <span className="text-xs px-2 py-1 bg-opacity-30 rounded">
                      {PAYMENT_METHODS.find(m => m.value === payment.payment_method)?.label}
                    </span>
                  </div>
                  <p className="text-sm text-opacity-75">
                    {new Date(payment.payment_date).toLocaleDateString('pt-BR')}
                  </p>
                  {payment.reference_number && (
                    <p className="text-xs text-opacity-75 mt-1">Ref: {payment.reference_number}</p>
                  )}
                  {payment.notes && (
                    <p className="text-xs text-opacity-75 mt-1 italic">{payment.notes}</p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(payment)}
                    disabled={loading}
                    className="opacity-75"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(payment.id)}
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