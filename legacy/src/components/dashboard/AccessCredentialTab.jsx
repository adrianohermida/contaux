import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Edit2, Trash2, Lock, Loader2, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function AccessCredentialTab({ clientId, tenantId }) {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showPasswords, setShowPasswords] = useState({});
  const [formData, setFormData] = useState({
    credential_type: 'nfe',
    username: '',
    password: '',
    cnpj_certificate: '',
    environment: 'production',
    access_key: '',
    token: '',
    expiry_date: '',
    provider: '',
    status: 'active',
    notes: ''
  });

  const CREDENTIAL_TYPES = [
    { value: 'nfe', label: 'NFe (Nota Fiscal Eletrônica)' },
    { value: 'nfse', label: 'NFSe (Nota Fiscal de Serviço)' },
    { value: 'ecf', label: 'ECF (Emissor de Cupom Fiscal)' },
    { value: 'mdfe', label: 'MDFe (Manifesto de Documento Fiscal)' },
    { value: 'cte', label: 'CTe (Conhecimento de Transporte)' },
    { value: 'other', label: 'Outro' }
  ];

  const ENVIRONMENTS = [
    { value: 'production', label: '🟢 Produção' },
    { value: 'sandbox', label: '🟡 Testes/Sandbox' },
    { value: 'development', label: '⚫ Desenvolvimento' }
  ];

  const STATUSES = [
    { value: 'active', label: '✓ Ativo', color: 'green' },
    { value: 'inactive', label: 'Inativo', color: 'gray' },
    { value: 'expired', label: '✗ Expirado', color: 'red' },
    { value: 'revoked', label: '✗ Revogado', color: 'red' },
    { value: 'pending_validation', label: '⏳ Aguardando', color: 'yellow' }
  ];

  const PROVIDERS = [
    'SEFAZ',
    'Prefeitura Local',
    'SEMAD',
    'SIMPLENACIONAL',
    'Outro'
  ];

  useEffect(() => {
    loadCredentials();
  }, [clientId, tenantId]);

  const loadCredentials = async () => {
    try {
      setLoading(true);
      const data = await base44.entities.AccessCredential.filter({
        tenant_id: tenantId,
        client_id: clientId
      });
      setCredentials(data);
    } catch (error) {
      console.error('Erro ao carregar credenciais:', error);
      toast.error('Erro ao carregar credenciais');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.credential_type) {
      toast.error('Selecione o tipo de credencial');
      return false;
    }

    if (!formData.username && !formData.cnpj_certificate) {
      toast.error('Informe usuário ou certificado CNPJ');
      return false;
    }

    if (formData.password && formData.password.length < 6) {
      toast.error('Senha deve ter no mínimo 6 caracteres');
      return false;
    }

    if (formData.expiry_date && new Date(formData.expiry_date) < new Date()) {
      toast.error('Data de expiração não pode ser no passado');
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
        tenant_id: tenantId,
        client_id: clientId
      };

      if (editingId) {
        await base44.entities.AccessCredential.update(editingId, data);
        toast.success('Credencial atualizada com sucesso!');
      } else {
        await base44.entities.AccessCredential.create(data);
        toast.success('Credencial adicionada com sucesso!');
      }

      resetForm();
      await loadCredentials();
    } catch (error) {
      console.error('Erro ao salvar credencial:', error);
      toast.error('Erro ao salvar credencial');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Confirmar exclusão desta credencial?')) return;

    try {
      setLoading(true);
      await base44.entities.AccessCredential.delete(id);
      toast.success('Credencial removida');
      await loadCredentials();
    } catch (error) {
      console.error('Erro ao deletar credencial:', error);
      toast.error('Erro ao deletar credencial');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cred) => {
    setFormData({
      credential_type: cred.credential_type,
      username: cred.username,
      password: cred.password || '',
      cnpj_certificate: cred.cnpj_certificate || '',
      environment: cred.environment,
      access_key: cred.access_key || '',
      token: cred.token || '',
      expiry_date: cred.expiry_date || '',
      provider: cred.provider || '',
      status: cred.status,
      notes: cred.notes || ''
    });
    setEditingId(cred.id);
  };

  const resetForm = () => {
    setFormData({
      credential_type: 'nfe',
      username: '',
      password: '',
      cnpj_certificate: '',
      environment: 'production',
      access_key: '',
      token: '',
      expiry_date: '',
      provider: '',
      status: 'active',
      notes: ''
    });
    setEditingId(null);
  };

  const togglePasswordVisibility = (id) => {
    setShowPasswords({
      ...showPasswords,
      [id]: !showPasswords[id]
    });
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

  const getStatusIcon = (status) => {
    if (status === 'active') return <CheckCircle className="w-4 h-4" />;
    if (status === 'expired' || status === 'revoked') return <AlertCircle className="w-4 h-4" />;
    return null;
  };

  const maskPassword = (password) => {
    return password ? '•'.repeat(Math.min(password.length, 12)) : '';
  };

  return (
    <div className="space-y-6">
      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-slate-50 p-4 rounded-lg space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tipo de Credencial *</label>
            <select
              value={formData.credential_type}
              onChange={(e) => setFormData({ ...formData, credential_type: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              {CREDENTIAL_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Ambiente</label>
            <select
              value={formData.environment}
              onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              {ENVIRONMENTS.map(e => (
                <option key={e.value} value={e.value}>{e.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Usuário</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="Usuário de acesso"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">CNPJ/CPF do Certificado</label>
            <input
              type="text"
              value={formData.cnpj_certificate}
              onChange={(e) => setFormData({ ...formData, cnpj_certificate: e.target.value })}
              placeholder="CNPJ ou CPF do certificado"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Senha</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Senha de acesso"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Token/API Key</label>
            <input
              type="password"
              value={formData.token}
              onChange={(e) => setFormData({ ...formData, token: e.target.value })}
              placeholder="Token ou chave API"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Chave de Acesso</label>
            <input
              type="text"
              value={formData.access_key}
              onChange={(e) => setFormData({ ...formData, access_key: e.target.value })}
              placeholder="Chave de acesso específica"
              className="w-full px-3 py-2 border rounded-lg font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Data de Expiração</label>
            <input
              type="date"
              value={formData.expiry_date}
              onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Provedor</label>
            <select
              value={formData.provider}
              onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Selecione...</option>
              {PROVIDERS.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
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
            placeholder="Notas adicionais sobre esta credencial"
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
            {editingId ? 'Atualizar' : 'Adicionar'} Credencial
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
        <h3 className="text-lg font-semibold">Credenciais de Acesso Cadastradas</h3>
        {loading && !credentials.length ? (
          <div className="text-center py-8 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            Carregando...
          </div>
        ) : credentials.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Lock className="w-6 h-6 mx-auto mb-2 opacity-50" />
            Nenhuma credencial cadastrada
          </div>
        ) : (
          credentials.map((cred) => (
            <div key={cred.id} className={`rounded-lg border p-4 ${getStatusColor(cred.status)}`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">
                      {CREDENTIAL_TYPES.find(t => t.value === cred.credential_type)?.label}
                    </span>
                    {getStatusIcon(cred.status)}
                    <span className="text-xs px-2 py-1 bg-opacity-30 rounded">
                      {ENVIRONMENTS.find(e => e.value === cred.environment)?.label}
                    </span>
                  </div>

                  {cred.username && (
                    <p className="text-sm text-opacity-75 mb-1">👤 {cred.username}</p>
                  )}

                  {cred.cnpj_certificate && (
                    <p className="text-sm text-opacity-75 mb-1">📜 {cred.cnpj_certificate}</p>
                  )}

                  {cred.provider && (
                    <p className="text-xs text-opacity-75 mb-2">Provedor: {cred.provider}</p>
                  )}

                  {cred.expiry_date && (
                    <p className="text-xs text-opacity-75">
                      Expira: {new Date(cred.expiry_date).toLocaleDateString('pt-BR')}
                    </p>
                  )}

                  {cred.password && (
                    <div className="flex items-center gap-2 mt-2 text-xs">
                      <Lock className="w-3 h-3" />
                      <span>
                        {showPasswords[cred.id] ? cred.password : maskPassword(cred.password)}
                      </span>
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility(cred.id)}
                        className="opacity-50 hover:opacity-100 ml-auto"
                      >
                        {showPasswords[cred.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                    </div>
                  )}

                  {cred.notes && (
                    <p className="text-xs text-opacity-75 mt-2 italic">{cred.notes}</p>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(cred)}
                    disabled={loading}
                    className="opacity-75"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(cred.id)}
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