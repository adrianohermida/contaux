import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Edit2, Trash2, Loader2, TrendingDown, AlertCircle, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function TaxCalculationPanel({ clientId, tenantId }) {
  const [fiscalData, setFiscalData] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    period_start: '',
    period_end: new Date().toISOString().split('T')[0],
    tax_regime: 'simple',
    pis_cst: '02',
    cofins_cst: '01',
    icms_rate: '18'
  });

  const TAX_REGIMES = [
    { value: 'simple', label: '📋 Simples Nacional' },
    { value: 'presumed_profit', label: '📊 Lucro Presumido' },
    { value: 'real_profit', label: '📈 Lucro Real' },
    { value: 'mei', label: '👤 MEI' }
  ];

  const PIS_OPTS = [
    { value: '02', label: 'Tributável' },
    { value: '07', label: 'Isenta' },
    { value: '08', label: 'Outras' }
  ];

  const COFINS_OPTS = [
    { value: '01', label: 'Cumulativa' },
    { value: '02', label: 'Não Cumulativa' },
    { value: '05', label: 'Isenta' }
  ];

  useEffect(() => {
    loadData();
  }, [clientId, tenantId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fiscalInfo, invData] = await Promise.all([
        base44.entities.FiscalData?.filter({
          tenant_id: tenantId,
          client_id: clientId
        }) || [],
        base44.entities.Invoice?.filter({
          tenant_id: tenantId,
          client_id: clientId
        }) || []
      ]);
      
      if (fiscalInfo.length > 0) {
        const fiscal = fiscalInfo[0];
        setFiscalData(fiscal);
        setFormData({
          period_start: formData.period_start || '',
          period_end: formData.period_end,
          tax_regime: fiscal.tax_regime || 'simple',
          pis_cst: fiscal.pis_cst || '02',
          cofins_cst: fiscal.cofins_cst || '01',
          icms_rate: '18'
        });
      }
      setInvoices(invData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTaxes = () => {
    const filtered = invoices.filter(inv => {
      if (formData.period_start) {
        const invDate = new Date(inv.issue_date);
        const startDate = new Date(formData.period_start);
        const endDate = new Date(formData.period_end);
        return invDate >= startDate && invDate <= endDate;
      }
      return true;
    });

    const totalGross = filtered.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
    const icmsValue = (totalGross * parseFloat(formData.icms_rate)) / 100;
    const pisValue = formData.pis_cst === '07' ? 0 : (totalGross * 1.65) / 100;
    const cofinsValue = formData.cofins_cst === '05' ? 0 : (totalGross * 7.6) / 100;
    const irValue = formData.tax_regime === 'real_profit' ? (totalGross * 15) / 100 : (totalGross * 8) / 100;

    const totalTaxes = icmsValue + pisValue + cofinsValue + irValue;

    return {
      totalGross,
      icms: icmsValue,
      pis: pisValue,
      cofins: cofinsValue,
      ir: irValue,
      totalTaxes,
      effectiveRate: totalGross > 0 ? (totalTaxes / totalGross) * 100 : 0,
      invoiceCount: filtered.length
    };
  };

  const handleSaveConfig = async () => {
    try {
      setLoading(true);

      const updateData = {
        pis_cst: formData.pis_cst,
        cofins_cst: formData.cofins_cst,
        tax_regime: formData.tax_regime
      };

      if (fiscalData?.id) {
        await base44.entities.FiscalData?.update(fiscalData.id, updateData);
        toast.success('Configuração de impostos atualizada!');
      } else {
        await base44.entities.FiscalData?.create({
          ...updateData,
          tenant_id: tenantId,
          client_id: clientId,
          state_registration: '',
          legal_nature: '',
          cnae_code: ''
        });
        toast.success('Configuração de impostos salva!');
      }

      await loadData();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar configuração');
    } finally {
      setLoading(false);
    }
  };

  const taxes = calculateTaxes();

  return (
    <div className="space-y-6">
      {/* Configuration Form */}
      <div className="bg-slate-50 p-4 rounded-lg space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Calculator className="w-4 h-4" /> Configuração de Cálculo de Impostos
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Período Inicial</label>
            <input
              type="date"
              value={formData.period_start}
              onChange={(e) => setFormData({ ...formData, period_start: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Período Final</label>
            <input
              type="date"
              value={formData.period_end}
              onChange={(e) => setFormData({ ...formData, period_end: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Regime Tributário</label>
            <select
              value={formData.tax_regime}
              onChange={(e) => setFormData({ ...formData, tax_regime: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              {TAX_REGIMES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Alíquota ICMS (%)</label>
            <input
              type="number"
              step="0.1"
              value={formData.icms_rate}
              onChange={(e) => setFormData({ ...formData, icms_rate: e.target.value })}
              placeholder="18"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">CST PIS</label>
            <select
              value={formData.pis_cst}
              onChange={(e) => setFormData({ ...formData, pis_cst: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              {PIS_OPTS.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">CST COFINS</label>
            <select
              value={formData.cofins_cst}
              onChange={(e) => setFormData({ ...formData, cofins_cst: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              {COFINS_OPTS.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        <Button
          onClick={handleSaveConfig}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Salvar Configuração
        </Button>
      </div>

      {/* Period Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Simulação de Cálculo
        </h3>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-slate-50 rounded-lg border">
            <p className="text-sm text-slate-600">Faturamento Bruto</p>
            <p className="text-2xl font-bold text-slate-900">
              R$ {taxes.totalGross.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-500 mt-1">{taxes.invoiceCount} faturas</p>
          </div>

          <div className="p-4 bg-red-50 rounded-lg border">
            <p className="text-sm text-slate-600">Total de Impostos</p>
            <p className="text-2xl font-bold text-red-600">
              R$ {taxes.totalTaxes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-500 mt-1">{taxes.effectiveRate.toFixed(2)}% da receita</p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg border">
            <p className="text-sm text-slate-600">Líquido</p>
            <p className="text-2xl font-bold text-green-600">
              R$ {(taxes.totalGross - taxes.totalTaxes).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-500 mt-1">Após impostos</p>
          </div>
        </div>

        {/* Tax Breakdown */}
        <div className="space-y-2">
          <h4 className="font-semibold mb-3">Discriminação de Impostos</h4>
          
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
            <span className="text-sm font-medium">ICMS ({formData.icms_rate}%)</span>
            <span className="text-sm font-bold text-blue-600">
              R$ {taxes.icms.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {formData.pis_cst !== '07' && (
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-sm font-medium">PIS (1.65%)</span>
              <span className="text-sm font-bold text-purple-600">
                R$ {taxes.pis.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}

          {formData.cofins_cst !== '05' && (
            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
              <span className="text-sm font-medium">COFINS (7.6%)</span>
              <span className="text-sm font-bold text-orange-600">
                R$ {taxes.cofins.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
            <span className="text-sm font-medium">
              IR ({formData.tax_regime === 'real_profit' ? '15' : '8'}%)
            </span>
            <span className="text-sm font-bold text-red-600">
              R$ {taxes.ir.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          <p className="font-semibold mb-2">💡 Sobre o Cálculo:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Valores simulados com base nas configurações</li>
            <li>CST PIS/COFINS isenta reduz alíquotas automáticamente</li>
            <li>IR varia conforme regime tributário</li>
            <li>Consulte contador para cálculos oficiais</li>
          </ul>
        </div>
      </div>

      {/* Tax Planning */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-4">Simulações de Cenários</h3>
        
        <div className="space-y-2">
          {[
            { name: 'Simples Nacional', regime: 'simple', pis: '02', cofins: '01' },
            { name: 'Lucro Presumido', regime: 'presumed_profit', pis: '02', cofins: '01' },
            { name: 'PIS/COFINS Isento', regime: 'simple', pis: '07', cofins: '05' }
          ].map((scenario, idx) => {
            const tempForm = { ...formData, ...scenario };
            const simulatedTaxes = (() => {
              const tg = taxes.totalGross;
              const icms = (tg * parseFloat(formData.icms_rate)) / 100;
              const pis = scenario.pis === '07' ? 0 : (tg * 1.65) / 100;
              const cofins = scenario.cofins === '05' ? 0 : (tg * 7.6) / 100;
              const ir = scenario.regime === 'real_profit' ? (tg * 15) / 100 : (tg * 8) / 100;
              return icms + pis + cofins + ir;
            })();

            return (
              <button
                key={idx}
                onClick={() => {
                  setFormData({
                    ...formData,
                    tax_regime: scenario.regime,
                    pis_cst: scenario.pis,
                    cofins_cst: scenario.cofins
                  });
                }}
                className="w-full p-3 text-left rounded-lg border bg-white hover:bg-slate-50 transition-all"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">{scenario.name}</span>
                  <span className="text-sm font-bold text-red-600">
                    R$ {simulatedTaxes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}