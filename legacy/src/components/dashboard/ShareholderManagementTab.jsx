import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Edit2, Trash2, Users, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ShareholderManagementTab({ clientId, tenantId }) {
  const [shareholders, setShareholders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [totalParticipation, setTotalParticipation] = useState(0);
  const [formData, setFormData] = useState({
    shareholder_name: '',
    shareholder_cpf: '',
    participation_percentage: 0,
    admission_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadShareholders();
  }, [clientId, tenantId]);

  useEffect(() => {
    const total = shareholders.reduce((sum, s) => sum + parseFloat(s.participation_percentage || 0), 0);
    setTotalParticipation(total);
  }, [shareholders]);

  const loadShareholders = async () => {
    try {
      setLoading(true);
      const data = await base44.entities.ShareholderInfo.filter({
        tenant_id: tenantId,
        client_id: clientId
      });
      setShareholders(data);
    } catch (error) {
      console.error('Erro ao carregar sócios:', error);
      toast.error('Erro ao carregar sócios');
    } finally {
      setLoading(false);
    }
  };

  const formatCPF = (cpf) => {
    return cpf
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .slice(0, 14);
  };

  const validateCPF = (cpf) => {
    const clean = cpf.replace(/\D/g, '');
    return clean.length === 11;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.shareholder_name || !formData.shareholder_cpf) {
      toast.error('Preencha nome e CPF');
      return;
    }

    if (!validateCPF(formData.shareholder_cpf)) {
      toast.error('CPF inválido');
      return;
    }

    const participation = parseFloat(formData.participation_percentage || 0);
    if (participation < 0 || participation > 100) {
      toast.error('Participação deve estar entre 0 e 100%');
      return;
    }

    const estimatedTotal = editingId
      ? totalParticipation - parseFloat(shareholders.find(s => s.id === editingId)?.participation_percentage || 0) + participation
      : totalParticipation + participation;

    if (estimatedTotal > 100) {
      toast.error(`Participação total não pode exceder 100% (atual: ${estimatedTotal.toFixed(2)}%)`);
      return;
    }

    try {
      setLoading(true);
      const data = {
        ...formData,
        shareholder_cpf: formatCPF(formData.shareholder_cpf),
        tenant_id: tenantId,
        client_id: clientId,
        participation_percentage: participation
      };

      if (editingId) {
        await base44.entities.ShareholderInfo.update(editingId, data);
        toast.success('Sócio atualizado com sucesso!');
      } else {
        await base44.entities.ShareholderInfo.create(data);
        toast.success('Sócio adicionado com sucesso!');
      }

      resetForm();
      await loadShareholders();
    } catch (error) {
      console.error('Erro ao salvar sócio:', error);
      toast.error('Erro ao salvar sócio');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Confirmar exclusão deste sócio?')) return;

    try {
      setLoading(true);
      await base44.entities.ShareholderInfo.delete(id);
      toast.success('Sócio removido');
      await loadShareholders();
    } catch (error) {
      console.error('Erro ao deletar sócio:', error);
      toast.error('Erro ao deletar sócio');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (shareholder) => {
    setFormData({
      shareholder_name: shareholder.shareholder_name,
      shareholder_cpf: shareholder.shareholder_cpf,
      participation_percentage: shareholder.participation_percentage,
      admission_date: shareholder.admission_date
    });
    setEditingId(shareholder.id);
  };

  const resetForm = () => {
    setFormData({
      shareholder_name: '',
      shareholder_cpf: '',
      participation_percentage: 0,
      admission_date: new Date().toISOString().split('T')[0]
    });
    setEditingId(null);
  };

  const isParticipationWarning = totalParticipation > 100;

  return (
    <div className="space-y-6">
      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-slate-50 p-4 rounded-lg space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome do Sócio *</label>
            <input
              type="text"
              value={formData.shareholder_name}
              onChange={(e) => setFormData({ ...formData, shareholder_name: e.target.value })}
              placeholder="Nome completo"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">CPF *</label>
            <input
              type="text"
              value={formData.shareholder_cpf}
              onChange={(e) => setFormData({ ...formData, shareholder_cpf: formatCPF(e.target.value) })}
              placeholder="XXX.XXX.XXX-XX"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Participação (%)</label>
            <input
              type="number"
              value={formData.participation_percentage}
              onChange={(e) => setFormData({ ...formData, participation_percentage: e.target.value })}
              placeholder="0"
              step="0.01"
              min="0"
              max="100"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Data de Admissão</label>
            <input
              type="date"
              value={formData.admission_date}
              onChange={(e) => setFormData({ ...formData, admission_date: e.target.value })}
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
            {editingId ? 'Atualizar' : 'Adicionar'} Sócio
          </Button>
          {editingId && (
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
            >
              Cancelar
            </Button>
          )}
        </div>
      </form>

      {/* Summary */}
      <div className={`p-4 rounded-lg flex items-center justify-between ${isParticipationWarning ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'}`}>
        <div className="flex items-center gap-2">
          {isParticipationWarning && <AlertCircle className="w-5 h-5 text-red-600" />}
          <span className={isParticipationWarning ? 'text-red-800' : 'text-blue-800'}>
            <strong>Total de Participação:</strong> {totalParticipation.toFixed(2)}%
          </span>
        </div>
        {isParticipationWarning && (
          <span className="text-sm text-red-600">Acima de 100%!</span>
        )}
      </div>

      {/* List */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Sócios Cadastrados</h3>
        {loading && !shareholders.length ? (
          <div className="text-center py-8 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            Carregando...
          </div>
        ) : shareholders.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Users className="w-6 h-6 mx-auto mb-2 opacity-50" />
            Nenhum sócio cadastrado
          </div>
        ) : (
          shareholders.map((shareholder) => (
            <div key={shareholder.id} className="bg-white border rounded-lg p-4 flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{shareholder.shareholder_name}</span>
                  <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">{shareholder.participation_percentage}%</span>
                </div>
                <p className="text-sm text-slate-600">CPF: {shareholder.shareholder_cpf}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Admitido em: {new Date(shareholder.admission_date).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="flex gap-2 ml-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(shareholder)}
                  disabled={loading}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(shareholder.id)}
                  disabled={loading}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}