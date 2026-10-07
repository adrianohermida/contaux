import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Edit2, Trash2, Key, Loader2, AlertCircle, CheckCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function DigitalCertificateTab({ clientId, tenantId }) {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    certificate_type: 'a1',
    common_name: '',
    issuer: '',
    issue_date: new Date().toISOString().split('T')[0],
    expiry_date: '',
    serial_number: '',
    thumbprint: '',
    password: '',
    certificate_file: null,
    key_file: null,
    status: 'active',
    notes: ''
  });

  const CERTIFICATE_TYPES = [
    { value: 'a1', label: 'A1 (Arquivo)' },
    { value: 'a3', label: 'A3 (Token/Smartcard)' },
    { value: 'e-cnpj', label: 'e-CNPJ' },
    { value: 'e-cpf', label: 'e-CPF' }
  ];

  const STATUSES = [
    { value: 'active', label: '✓ Ativo', color: 'green' },
    { value: 'expiring_soon', label: '⚠ Vencendo em breve', color: 'yellow' },
    { value: 'expired', label: '✗ Expirado', color: 'red' },
    { value: 'revoked', label: '✗ Revogado', color: 'red' },
    { value: 'inactive', label: 'Inativo', color: 'gray' }
  ];

  useEffect(() => {
    loadCertificates();
  }, [clientId, tenantId]);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      const data = await base44.entities.DigitalCertificate.filter({
        tenant_id: tenantId,
        client_id: clientId
      });
      setCertificates(data);
    } catch (error) {
      console.error('Erro ao carregar certificados:', error);
      toast.error('Erro ao carregar certificados');
    } finally {
      setLoading(false);
    }
  };

  const checkCertificateStatus = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 30) return 'expiring_soon';
    return 'active';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.common_name || !formData.issuer || !formData.expiry_date) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    const expiryDate = new Date(formData.expiry_date);
    if (expiryDate < new Date()) {
      toast.error('Data de expiração não pode ser no passado');
      return;
    }

    try {
      setLoading(true);
      const status = formData.status !== 'inactive' ? checkCertificateStatus(formData.expiry_date) : 'inactive';

      const data = {
        ...formData,
        status,
        tenant_id: tenantId,
        client_id: clientId
      };

      if (editingId) {
        await base44.entities.DigitalCertificate.update(editingId, data);
        toast.success('Certificado atualizado com sucesso!');
      } else {
        await base44.entities.DigitalCertificate.create(data);
        toast.success('Certificado adicionado com sucesso!');
      }

      resetForm();
      await loadCertificates();
    } catch (error) {
      console.error('Erro ao salvar certificado:', error);
      toast.error('Erro ao salvar certificado');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Confirmar exclusão deste certificado?')) return;

    try {
      setLoading(true);
      await base44.entities.DigitalCertificate.delete(id);
      toast.success('Certificado removido');
      await loadCertificates();
    } catch (error) {
      console.error('Erro ao deletar certificado:', error);
      toast.error('Erro ao deletar certificado');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cert) => {
    setFormData({
      certificate_type: cert.certificate_type,
      common_name: cert.common_name,
      issuer: cert.issuer,
      issue_date: cert.issue_date,
      expiry_date: cert.expiry_date,
      serial_number: cert.serial_number,
      thumbprint: cert.thumbprint,
      password: cert.password,
      certificate_file: cert.certificate_file,
      key_file: cert.key_file,
      status: cert.status,
      notes: cert.notes
    });
    setEditingId(cert.id);
  };

  const resetForm = () => {
    setFormData({
      certificate_type: 'a1',
      common_name: '',
      issuer: '',
      issue_date: new Date().toISOString().split('T')[0],
      expiry_date: '',
      serial_number: '',
      thumbprint: '',
      password: '',
      certificate_file: null,
      key_file: null,
      status: 'active',
      notes: ''
    });
    setEditingId(null);
  };

  const getStatusColor = (status) => {
    const item = STATUSES.find(s => s.value === status);
    const colorMap = {
      green: 'bg-green-50 border-green-200 text-green-800',
      yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      red: 'bg-red-50 border-red-200 text-red-800',
      gray: 'bg-gray-50 border-gray-200 text-gray-800'
    };
    return colorMap[item?.color] || colorMap.gray;
  };

  const getExpiryWarning = (status) => {
    if (status === 'expired') {
      return <span className="text-xs font-medium text-red-700 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Expirado</span>;
    }
    if (status === 'expiring_soon') {
      return <span className="text-xs font-medium text-yellow-700 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Vencendo em breve</span>;
    }
    return <span className="text-xs font-medium text-green-700 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Válido</span>;
  };

  return (
    <div className="space-y-6">
      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-slate-50 p-4 rounded-lg space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tipo de Certificado *</label>
            <select
              value={formData.certificate_type}
              onChange={(e) => setFormData({ ...formData, certificate_type: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              {CERTIFICATE_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nome Comum (CN) *</label>
            <input
              type="text"
              value={formData.common_name}
              onChange={(e) => setFormData({ ...formData, common_name: e.target.value })}
              placeholder="Razão Social/Nome"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Emissor (Issuer) *</label>
            <input
              type="text"
              value={formData.issuer}
              onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
              placeholder="Ex: Certisign, ICP-Brasil"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Número de Série</label>
            <input
              type="text"
              value={formData.serial_number}
              onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
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
            <label className="block text-sm font-medium mb-1">Data de Expiração *</label>
            <input
              type="date"
              value={formData.expiry_date}
              onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Thumbprint (Hash SHA1)</label>
          <input
            type="text"
            value={formData.thumbprint}
            onChange={(e) => setFormData({ ...formData, thumbprint: e.target.value })}
            placeholder="Identificador único do certificado"
            className="w-full px-3 py-2 border rounded-lg font-mono text-xs"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Senha (se aplicável)</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Senha do certificado (armazenada com segurança)"
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
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {editingId ? 'Atualizar' : 'Adicionar'} Certificado
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

      {/* List */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Certificados Digitais Cadastrados</h3>
        {loading && !certificates.length ? (
          <div className="text-center py-8 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            Carregando...
          </div>
        ) : certificates.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Key className="w-6 h-6 mx-auto mb-2 opacity-50" />
            Nenhum certificado cadastrado
          </div>
        ) : (
          certificates.map((cert) => (
            <div key={cert.id} className={`rounded-lg border p-4 ${getStatusColor(cert.status)}`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{cert.common_name}</span>
                    <span className="text-xs bg-opacity-30 px-2 py-1 rounded">
                      {CERTIFICATE_TYPES.find(t => t.value === cert.certificate_type)?.label}
                    </span>
                  </div>
                  <p className="text-xs opacity-75 mb-2">{cert.issuer}</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    <span className="text-xs">
                      Expira: {new Date(cert.expiry_date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="mt-2">
                    {getExpiryWarning(cert.status)}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(cert)}
                    disabled={loading}
                    className="opacity-75"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(cert.id)}
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