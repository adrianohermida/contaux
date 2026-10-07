import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Send, FileText, AlertCircle, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function NFeIntegrationPanel({ clientId, tenantId }) {
  const [digitalCerts, setDigitalCerts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [issuedNFes, setIssuedNFes] = useState([]);
  const [formData, setFormData] = useState({
    nfe_type: 'nfe',
    operation: 'sales',
    intermediary_cnpj: '',
    reference_event: ''
  });

  const NFE_TYPES = [
    { value: 'nfe', label: '📄 NF-e (Produto)' },
    { value: 'nfce', label: '🛒 NFC-e (Consumidor)' },
    { value: 'cte', label: '📦 CT-e (Transporte)' }
  ];

  const OPERATIONS = [
    { value: 'sales', label: 'Venda' },
    { value: 'return', label: 'Devolução' },
    { value: 'adjust', label: 'Ajuste' },
    { value: 'cancel', label: 'Cancelamento' }
  ];

  const NFE_STATUS = {
    draft: { label: 'Rascunho', color: 'gray', icon: FileText },
    approved: { label: 'Aprovado', color: 'green', icon: CheckCircle2 },
    rejected: { label: 'Rejeitado', color: 'red', icon: XCircle },
    authorized: { label: 'Autorizado', color: 'blue', icon: CheckCircle2 },
    cancelled: { label: 'Cancelado', color: 'red', icon: XCircle },
    event_registered: { label: 'Evento Registrado', color: 'blue', icon: CheckCircle2 }
  };

  useEffect(() => {
    loadData();
  }, [clientId, tenantId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [certs, invs] = await Promise.all([
        base44.entities.DigitalCertificate?.filter({
          tenant_id: tenantId,
          client_id: clientId,
          is_active: true
        }) || [],
        base44.entities.Invoice?.filter({
          tenant_id: tenantId,
          client_id: clientId
        }) || []
      ]);
      setDigitalCerts(certs || []);
      setInvoices(invs || []);
      
      // Simular NFes emitidas (em prod, viria do BD)
      setIssuedNFes([]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectInvoice = (invoiceId) => {
    setSelectedInvoices(prev =>
      prev.includes(invoiceId)
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  const handleIssueNFe = async () => {
    if (!selectedCert) {
      toast.error('Selecione um certificado digital');
      return;
    }

    if (selectedInvoices.length === 0) {
      toast.error('Selecione pelo menos uma fatura');
      return;
    }

    try {
      setLoading(true);

      // Simular emissão (em produção, chamaria Sefaz)
      const newNFes = selectedInvoices.map(invId => {
        const invoice = invoices.find(i => i.id === invId);
        return {
          id: `nfe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          invoice_id: invId,
          nfe_number: Math.floor(Math.random() * 999999999),
          series: 1,
          type: formData.nfe_type,
          status: 'authorized',
          issued_at: new Date().toISOString(),
          authorization_code: Math.random().toString(36).substr(2, 13).toUpperCase(),
          verification_key: Math.random().toString(10).substr(2, 44),
          xml_url: `#`,
          recipient: invoice?.company_name,
          total_amount: invoice?.total_amount || 0
        };
      });

      setIssuedNFes(prev => [...prev, ...newNFes]);
      setSelectedInvoices([]);
      toast.success(`${newNFes.length} NF-e(s) emitida(s) com sucesso!`);
    } catch (error) {
      console.error('Erro ao emitir NF-e:', error);
      toast.error('Erro ao emitir NF-e');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadXML = (nfe) => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<NFe>
  <infNFe Id="NFe${nfe.verification_key}">
    <ide>
      <cUF>35</cUF>
      <natOp>${formData.operation}</natOp>
      <mod>${formData.nfe_type === 'nfe' ? '55' : '65'}</mod>
      <serie>${nfe.series}</serie>
      <nNF>${nfe.nfe_number}</nNF>
      <dEmi>${new Date(nfe.issued_at).toISOString().split('T')[0].replace(/-/g, '')}</dEmi>
    </ide>
    <emit>
      <CNPJ>${clientId}</CNPJ>
    </emit>
    <dest>
      <CNPJ>00000000000000</CNPJ>
    </dest>
    <total>
      <ICMSTot>
        <vBC>0.00</vBC>
        <vICMS>0.00</vICMS>
        <vICMSST>0.00</vICMSST>
        <vProducts>${nfe.total_amount}</vProducts>
        <vFrete>0.00</vFrete>
        <vSeg>0.00</vSeg>
        <vDesc>0.00</vDesc>
        <vII>0.00</vII>
        <vIPI>0.00</vIPI>
        <vPIS>0.00</vPIS>
        <vCOFINS>0.00</vCOFINS>
        <vOutro>0.00</vOutro>
        <vNF>${nfe.total_amount}</vNF>
      </ICMSTot>
    </total>
  </infNFe>
</NFe>`;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/xml;charset=utf-8,' + encodeURIComponent(xml));
    element.setAttribute('download', `NFe${nfe.nfe_number}.xml`);
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('XML baixado');
  };

  return (
    <div className="space-y-6">
      {/* Certificate Selection */}
      <div className="bg-slate-50 p-4 rounded-lg space-y-3">
        <h3 className="font-semibold flex items-center gap-2">
          🔐 Certificado Digital
        </h3>
        {digitalCerts.length === 0 ? (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
            ⚠️ Nenhum certificado digital ativo encontrado
          </div>
        ) : (
          <select
            value={selectedCert?.id || ''}
            onChange={(e) => setSelectedCert(digitalCerts.find(c => c.id === e.target.value))}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">Selecione um certificado...</option>
            {digitalCerts.map(cert => (
              <option key={cert.id} value={cert.id}>
                {cert.holder_name} - Válido até {new Date(cert.expiration_date).toLocaleDateString('pt-BR')}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Configuration */}
      <div className="bg-slate-50 p-4 rounded-lg space-y-3">
        <h3 className="font-semibold">⚙️ Configuração</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tipo de Documento</label>
            <select
              value={formData.nfe_type}
              onChange={(e) => setFormData({ ...formData, nfe_type: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              {NFE_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Operação</label>
            <select
              value={formData.operation}
              onChange={(e) => setFormData({ ...formData, operation: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              {OPERATIONS.map(op => (
                <option key={op.value} value={op.value}>{op.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Invoice Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          📊 Selecionar Faturas ({selectedInvoices.length})
        </h3>

        {invoices.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <AlertCircle className="w-6 h-6 mx-auto mb-2 opacity-50" />
            Nenhuma fatura disponível
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {invoices.map(invoice => (
              <label
                key={invoice.id}
                className="flex items-center p-3 rounded-lg border hover:bg-slate-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedInvoices.includes(invoice.id)}
                  onChange={() => handleSelectInvoice(invoice.id)}
                  className="w-4 h-4"
                />
                <div className="ml-3 flex-1">
                  <p className="font-medium text-sm">{invoice.invoice_number}</p>
                  <p className="text-xs text-slate-600">
                    R$ {invoice.total_amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'} • 
                    {' ' + new Date(invoice.issue_date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </label>
            ))}
          </div>
        )}

        <Button
          onClick={handleIssueNFe}
          disabled={loading || selectedInvoices.length === 0 || !selectedCert}
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
        >
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
          Emitir NF-e
        </Button>
      </div>

      {/* Issued NFes */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-4">📋 NF-es Emitidas</h3>

        {issuedNFes.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <FileText className="w-6 h-6 mx-auto mb-2 opacity-50" />
            Nenhuma NF-e emitida
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {issuedNFes.map(nfe => {
              const statusConfig = NFE_STATUS[nfe.status] || NFE_STATUS.draft;
              const StatusIcon = statusConfig.icon;

              return (
                <div key={nfe.id} className="p-4 rounded-lg border bg-white">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-semibold">NFe {nfe.nfe_number}</p>
                        <span className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 bg-${statusConfig.color}-50 text-${statusConfig.color}-700`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-1">
                        Chave: {nfe.verification_key}
                      </p>
                      <p className="text-sm text-slate-600 mb-1">
                        Código: {nfe.authorization_code}
                      </p>
                      <p className="text-sm font-medium">
                        R$ {nfe.total_amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadXML(nfe)}
                      >
                        XML
                      </Button>
                      <Button size="sm" variant="outline">
                        PDF
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        <p className="font-semibold mb-2">💡 Sobre NF-e:</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>NF-e é obrigatória para empresas em regime lucro real/presumido</li>
          <li>Emissão requer certificado digital A1 ou A3</li>
          <li>A Sefaz retorna código de autorização em segundos</li>
          <li>XML com chave de acesso deve ser mantido pelo prazo fiscal</li>
        </ul>
      </div>
    </div>
  );
}