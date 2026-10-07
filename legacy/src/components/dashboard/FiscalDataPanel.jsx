import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Edit2, Loader2, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function FiscalDataPanel({ clientId, tenantId }) {
  const [fiscalData, setFiscalData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    state_registration: '',
    municipal_registration: '',
    tax_regime: 'simple',
    legal_nature: '',
    cnae_code: '',
    cnae_description: '',
    cnd_status: 'unknown',
    cnd_check_date: new Date().toISOString().split('T')[0],
    pis_cst: '',
    cofins_cst: '',
    icms_taxpayer: true,
    notes: ''
  });

  const TAX_REGIMES = [
    { value: 'simple', label: 'Simples Nacional' },
    { value: 'presumed_profit', label: 'Lucro Presumido' },
    { value: 'real_profit', label: 'Lucro Real' },
    { value: 'mei', label: 'MEI' }
  ];

  const CND_STATUSES = [
    { value: 'clear', label: '✓ Liberado', color: 'green' },
    { value: 'restricted', label: '⚠ Restringido', color: 'yellow' },
    { value: 'suspended', label: '✗ Suspenso', color: 'red' },
    { value: 'unknown', label: '? Desconhecido', color: 'gray' }
  ];

  useEffect(() => {
    loadFiscalData();
  }, [clientId, tenantId]);

  const loadFiscalData = async () => {
    try {
      setLoading(true);
      const data = await base44.entities.FiscalData.filter({
        tenant_id: tenantId,
        client_id: clientId
      });
      
      if (data.length > 0) {
        setFiscalData(data[0]);
        setFormData(data[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar dados fiscais:', error);
      toast.error('Erro ao carregar dados fiscais');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.state_registration || !formData.tax_regime || !formData.legal_nature || !formData.cnae_code) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setLoading(true);
      const data = {
        ...formData,
        tenant_id: tenantId,
        client_id: clientId
      };

      if (fiscalData?.id) {
        await base44.entities.FiscalData.update(fiscalData.id, data);
        toast.success('Dados fiscais atualizados!');
      } else {
        const created = await base44.entities.FiscalData.create(data);
        setFiscalData(created);
        toast.success('Dados fiscais criados!');
      }

      setEditing(false);
      await loadFiscalData();
    } catch (error) {
      console.error('Erro ao salvar dados fiscais:', error);
      toast.error('Erro ao salvar dados fiscais');
    } finally {
      setLoading(false);
    }
  };

  const getCNDStatusColor = (status) => {
    const item = CND_STATUSES.find(s => s.value === status);
    const colorMap = {
      green: 'text-green-600 bg-green-50',
      yellow: 'text-yellow-600 bg-yellow-50',
      red: 'text-red-600 bg-red-50',
      gray: 'text-gray-600 bg-gray-50'
    };
    return colorMap[item?.color] || colorMap.gray;
  };

  if (loading && !fiscalData && !editing) {
    return (
      <div className="text-center py-8">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
        <span className="text-slate-500">Carregando dados fiscais...</span>
      </div>
    );
  }

  if (editing) {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Registros */}
        <div className="bg-slate-50 p-4 rounded-lg space-y-4">
          <h3 className="font-semibold text-slate-900">Registros</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">IE (Estadual) *</label>
              <input
                type="text"
                value={formData.state_registration}
                onChange={(e) => setFormData({ ...formData, state_registration: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">IM (Municipal)</label>
              <input
                type="text"
                value={formData.municipal_registration}
                onChange={(e) => setFormData({ ...formData, municipal_registration: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Natureza Jurídica */}
        <div className="bg-slate-50 p-4 rounded-lg space-y-4">
          <h3 className="font-semibold text-slate-900">Natureza</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Regime Tributário *</label>
              <select
                value={formData.tax_regime}
                onChange={(e) => setFormData({ ...formData, tax_regime: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                {TAX_REGIMES.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Natureza Jurídica *</label>
              <input
                type="text"
                value={formData.legal_nature}
                onChange={(e) => setFormData({ ...formData, legal_nature: e.target.value })}
                placeholder="Ex: Ltda, S.A."
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* CNAE */}
        <div className="bg-slate-50 p-4 rounded-lg space-y-4">
          <h3 className="font-semibold text-slate-900">CNAE</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Código CNAE *</label>
            <input
              type="text"
              value={formData.cnae_code}
              onChange={(e) => setFormData({ ...formData, cnae_code: e.target.value })}
              placeholder="Ex: 6202-3/00"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descrição CNAE</label>
            <input
              type="text"
              value={formData.cnae_description}
              onChange={(e) => setFormData({ ...formData, cnae_description: e.target.value })}
              placeholder="Descrição da atividade"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>

        {/* Classificação Fiscal */}
        <div className="bg-slate-50 p-4 rounded-lg space-y-4">
          <h3 className="font-semibold text-slate-900">Classificação Fiscal</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">PIS CST</label>
              <input
                type="text"
                value={formData.pis_cst}
                onChange={(e) => setFormData({ ...formData, pis_cst: e.target.value })}
                placeholder="Ex: 07"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">COFINS CST</label>
              <input
                type="text"
                value={formData.cofins_cst}
                onChange={(e) => setFormData({ ...formData, cofins_cst: e.target.value })}
                placeholder="Ex: 01"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.icms_taxpayer}
              onChange={(e) => setFormData({ ...formData, icms_taxpayer: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">Contribuinte de ICMS</span>
          </label>
        </div>

        {/* CND */}
        <div className="bg-slate-50 p-4 rounded-lg space-y-4">
          <h3 className="font-semibold text-slate-900">CND</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status CND</label>
              <select
                value={formData.cnd_status}
                onChange={(e) => setFormData({ ...formData, cnd_status: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                {CND_STATUSES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Data da Verificação</label>
              <input
                type="date"
                value={formData.cnd_check_date}
                onChange={(e) => setFormData({ ...formData, cnd_check_date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Notas */}
        <div className="bg-slate-50 p-4 rounded-lg">
          <label className="block text-sm font-medium mb-1">Observações</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Notas adicionais"
            rows="3"
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Salvar Dados Fiscais
          </Button>
          <Button type="button" variant="outline" onClick={() => setEditing(false)}>
            Cancelar
          </Button>
        </div>
      </form>
    );
  }

  if (!fiscalData) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <Info className="w-8 h-8 mx-auto mb-3 text-blue-600" />
        <p className="text-slate-700 mb-4">Nenhum dado fiscal cadastrado</p>
        <Button
          onClick={() => setEditing(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Adicionar Dados Fiscais
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Dados Fiscais</h2>
          <p className="text-sm text-slate-600 mt-1">Informações tributárias e fiscais</p>
        </div>
        <Button
          onClick={() => setEditing(true)}
          variant="outline"
          size="sm"
        >
          <Edit2 className="w-4 h-4 mr-2" />
          Editar
        </Button>
      </div>

      {/* Registros */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold text-slate-900 mb-3">Registros</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-600">IE (Estadual)</p>
            <p className="font-medium text-slate-900">{fiscalData.state_registration || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600">IM (Municipal)</p>
            <p className="font-medium text-slate-900">{fiscalData.municipal_registration || '-'}</p>
          </div>
        </div>
      </div>

      {/* Natureza */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold text-slate-900 mb-3">Natureza</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-600">Regime Tributário</p>
            <p className="font-medium text-slate-900">
              {TAX_REGIMES.find(r => r.value === fiscalData.tax_regime)?.label || fiscalData.tax_regime}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-600">Natureza Jurídica</p>
            <p className="font-medium text-slate-900">{fiscalData.legal_nature || '-'}</p>
          </div>
        </div>
      </div>

      {/* CNAE */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold text-slate-900 mb-3">CNAE</h3>
        <div>
          <p className="text-xs text-slate-600">Código</p>
          <p className="font-medium text-slate-900 mb-2">{fiscalData.cnae_code || '-'}</p>
        </div>
        {fiscalData.cnae_description && (
          <div>
            <p className="text-xs text-slate-600">Descrição</p>
            <p className="text-sm text-slate-700">{fiscalData.cnae_description}</p>
          </div>
        )}
      </div>

      {/* Classificação Fiscal */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold text-slate-900 mb-3">Classificação Fiscal</h3>
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <p className="text-xs text-slate-600">PIS CST</p>
            <p className="font-medium text-slate-900">{fiscalData.pis_cst || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600">COFINS CST</p>
            <p className="font-medium text-slate-900">{fiscalData.cofins_cst || '-'}</p>
          </div>
        </div>
        <div>
          <p className="text-sm text-slate-700">
            {fiscalData.icms_taxpayer ? '✓ Contribuinte de ICMS' : '✗ Não é contribuinte de ICMS'}
          </p>
        </div>
      </div>

      {/* CND Status */}
      <div className={`rounded-lg p-4 ${getCNDStatusColor(fiscalData.cnd_status)}`}>
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          {fiscalData.cnd_status === 'clear' && <CheckCircle className="w-4 h-4" />}
          {fiscalData.cnd_status === 'restricted' && <AlertCircle className="w-4 h-4" />}
          {fiscalData.cnd_status === 'suspended' && <AlertCircle className="w-4 h-4" />}
          CND - Certidão de Débitos
        </h3>
        <p className="text-sm mb-1">
          Status: <strong>{CND_STATUSES.find(s => s.value === fiscalData.cnd_status)?.label || 'Desconhecido'}</strong>
        </p>
        <p className="text-xs opacity-75">
          Verificado em: {new Date(fiscalData.cnd_check_date).toLocaleDateString('pt-BR')}
        </p>
      </div>

      {/* Notas */}
      {fiscalData.notes && (
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-semibold text-slate-900 mb-2">Observações</h3>
          <p className="text-sm text-slate-700">{fiscalData.notes}</p>
        </div>
      )}
    </div>
  );
}