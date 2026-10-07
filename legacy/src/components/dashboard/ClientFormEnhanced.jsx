import React, { useMemo, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useFormState } from '@/components/modals/useFormState';
import { useFormValidation } from '@/components/hooks/useFormValidation';
import { useFormSubmit } from '@/components/modals/useFormSubmit';
import { useViaCEP, formatCEP, validateCEP } from '@/components/hooks/useViaCEP';
import ModalWrapper from '@/components/modals/ModalWrapper';
import FormField from '@/components/modals/FormField';
import FormActions from '@/components/modals/FormActions';
import { AlertCircle, CheckCircle, MapPin, Loader, Wifi, WifiOff } from 'lucide-react';
import { toast } from 'sonner';

const VALIDATION_RULES = {
  company_name: {
    label: 'Razão Social / Nome Completo',
    required: true,
    minLength: 2
  },
  email: {
    label: 'Email',
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    patternMessage: 'Email inválido'
  },
  cpf: {
    label: 'CPF',
    pattern: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
    patternMessage: 'CPF deve estar no formato: XXX.XXX.XXX-XX'
  },
  cnpj: {
    label: 'CNPJ',
    pattern: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
    patternMessage: 'CNPJ deve estar no formato: XX.XXX.XXX/XXXX-XX'
  }
};

function formatCPF(value) {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .slice(0, 14);
}

function formatCNPJ(value) {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .slice(0, 18);
}

export default function ClientFormEnhanced({ client, onSave, onCancel, tenantId }) {
  const initialData = useMemo(() => client || {
    tenant_id: tenantId,
    client_type: 'pj',
    company_name: '',
    cpf: '',
    cnpj: '',
    email: '',
    phone: '',
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    fiscal_year_start: '',
    currency: 'BRL',
    status: 'active'
  }, [client, tenantId]);

  const { formData, handleChange, setFieldValue, isDirty, reset } = useFormState(initialData);
  const { errors, validateForm, setFieldError, clearErrors } = useFormValidation();
  const { loading, submit } = useFormSubmit();
  const { fetchAddress, loading: cepLoading, error: cepError, clearError: clearCepError } = useViaCEP();
  const [documentValidation, setDocumentValidation] = useState({});
  const [addressReadOnly, setAddressReadOnly] = useState(false);
  const [saving, setSaving] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [apiError, setApiError] = useState(null);

  const currencyOptions = [
    { value: 'BRL', label: 'Real (BRL)' },
    { value: 'USD', label: 'Dólar (USD)' },
    { value: 'EUR', label: 'Euro (EUR)' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Ativo' },
    { value: 'inactive', label: 'Inativo' },
    { value: 'suspended', label: 'Suspenso' },
    { value: 'cancelled', label: 'Cancelado' }
  ];

  const clientTypeOptions = [
    { value: 'pf', label: 'Pessoa Física (PF)' },
    { value: 'pj', label: 'Pessoa Jurídica (PJ)' }
  ];

  const validateDocument = async (field, value) => {
    if (!value) {
      setDocumentValidation(prev => ({ ...prev, [field]: null }));
      return true;
    }

    try {
      setApiError(null);
      const response = await base44.functions.invoke('validateClientDocument', {
        document: value,
        type: field,
        tenantId,
        excludeClientId: client?.id
      });

      const isValid = response?.data?.valid ?? true;
      setDocumentValidation(prev => ({
        ...prev,
        [field]: isValid ? { valid: true } : { valid: false, message: response?.data?.message || 'Inválido' }
      }));

      return isValid;
    } catch (error) {
      console.error('Erro na validação de documento:', error);
      const errMsg = error?.message || 'Erro ao validar documento';
      
      // Detectar erro de conexão
      if (error?.code === 'ECONNREFUSED' || error?.status >= 500 || !navigator.onLine) {
        setConnectionError(`Erro de conexão ao validar ${field === 'cpf' ? 'CPF' : 'CNPJ'}. Verifique sua internet.`);
      } else {
        setApiError(`Erro ao validar ${field === 'cpf' ? 'CPF' : 'CNPJ'}: ${errMsg}`);
      }
      
      setDocumentValidation(prev => ({ ...prev, [field]: { valid: true } }));
      return true;
    }
  };

  const handleDocumentChange = async (field, value) => {
    const formatted = field === 'cpf' ? formatCPF(value) : formatCNPJ(value);
    setFieldValue(field, formatted);
    
    // CPF: 11 dígitos, CNPJ: 14 dígitos
    const requiredDigits = field === 'cpf' ? 11 : 14;
    const digitCount = formatted.match(/\d/g)?.length || 0;
    
    // Remover validação automática pois estava causando timeout
    // Apenas permitir salvar quando documento estiver completo
    if (digitCount === requiredDigits) {
      setDocumentValidation(prev => ({
        ...prev,
        [field]: { valid: true }
      }));
    }
  };

  const handleCEPChange = async (e) => {
    const cepValue = e.target.value;
    setFieldValue('cep', cepValue);
    clearCepError();
    setAddressReadOnly(false);

    if (validateCEP(cepValue)) {
      const addressData = await fetchAddress(cepValue);
      if (addressData) {
        setFieldValue('endereco', addressData.endereco);
        setFieldValue('bairro', addressData.bairro);
        setFieldValue('cidade', addressData.cidade);
        setFieldValue('uf', addressData.uf);
        setAddressReadOnly(true);
        clearErrors();
        toast.success('Endereço preenchido automaticamente!', { duration: 2 });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearErrors();

    if (!validateForm(formData, VALIDATION_RULES)) {
      toast.error('Preencha todos os campos obrigatórios corretamente');
      return;
    }

    // Validar documentos se necessário
    if (formData.client_type === 'pf' && formData.cpf) {
      const cpfValid = await validateDocument('cpf', formData.cpf);
      if (!cpfValid) {
        setFieldError('cpf', 'CPF inválido ou duplicado');
        toast.error('CPF inválido ou já cadastrado');
        return;
      }
    }

    if (formData.client_type === 'pj' && formData.cnpj) {
      const cnpjValid = await validateDocument('cnpj', formData.cnpj);
      if (!cnpjValid) {
        setFieldError('cnpj', 'CNPJ inválido ou duplicado');
        toast.error('CNPJ inválido ou já cadastrado');
        return;
      }
    }

    try {
      setSaving(true);
      setConnectionError(null);
      setApiError(null);
      
      // Validação básica de documentos antes de salvar
      const isPF = formData.client_type === 'pf';
      const document = isPF ? formData.cpf : formData.cnpj;
      
      if (!document) {
        const docType = isPF ? 'CPF' : 'CNPJ';
        setApiError(`${docType} é obrigatório para ${isPF ? 'Pessoa Física' : 'Pessoa Jurídica'}`);
        setSaving(false);
        return;
      }
      
      const digitCount = document.match(/\d/g)?.length || 0;
      if (digitCount !== (isPF ? 11 : 14)) {
        const docType = isPF ? 'CPF' : 'CNPJ';
        setApiError(`${docType} incompleto. Verifique o formato.`);
        setSaving(false);
        return;
      }
      
      // Preparar dados apenas com campos necessários
      const clientData = {
        tenant_id: formData.tenant_id,
        client_type: formData.client_type,
        company_name: formData.company_name,
        email: formData.email,
        phone: formData.phone,
        cpf: formData.cpf || undefined,
        cnpj: formData.cnpj || undefined,
        cep: formData.cep,
        endereco: formData.endereco,
        numero: formData.numero,
        complemento: formData.complemento,
        bairro: formData.bairro,
        cidade: formData.cidade,
        uf: formData.uf,
        fiscal_year_start: formData.fiscal_year_start,
        currency: formData.currency,
        status: formData.status
      };

      let createdClientId;
      if (client?.id) {
        await base44.entities.Client.update(client.id, clientData);
      } else {
        const newClient = await base44.entities.Client.create(clientData);
        createdClientId = newClient.id;
      }
      
      const successMsg = client ? 'Cliente atualizado com sucesso!' : 'Cliente criado com sucesso!';
      toast.success(successMsg);
      reset();
      
      setTimeout(() => {
        onCancel?.();
        onSave?.(createdClientId);
      }, 600);
    } catch (err) {
      console.error('Erro ao salvar cliente:', err);
      
      // Detectar tipo de erro
      if (!navigator.onLine) {
        setConnectionError('Sem conexão com a internet. Verifique sua rede e tente novamente.');
        toast.error('Sem conexão com a internet');
      } else if (err?.status >= 500) {
        const statusMsg = err.status === 500 ? '500 - Erro no servidor' : `${err.status} - Erro do servidor`;
        setApiError(`Problema no servidor (${statusMsg}). Tente novamente em alguns instantes.`);
        toast.error(`Erro do servidor: ${statusMsg}`);
      } else if (err?.message?.includes('WebSocket') || err?.code === 'ECONNREFUSED') {
        setConnectionError('Erro de conexão com o servidor. Verifique sua internet e tente novamente.');
        toast.error('Erro de conexão');
      } else {
        setApiError(err?.message || 'Erro ao salvar cliente. Tente novamente.');
        toast.error(err?.message || 'Erro ao salvar cliente');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalWrapper 
      isOpen={true} 
      onClose={onCancel}
      title={client ? 'Editar Cliente' : 'Novo Cliente'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Erro de Conexão */}
        {connectionError && (
          <div className="flex gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <WifiOff className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-700 dark:text-red-300 text-sm">Erro de Conexão</p>
              <p className="text-red-600 dark:text-red-400 text-xs mt-1">{connectionError}</p>
              <button
                type="button"
                onClick={() => setConnectionError(null)}
                className="text-xs text-red-600 dark:text-red-400 hover:underline mt-2"
              >
                Descartar aviso
              </button>
            </div>
          </div>
        )}

        {/* Erro de API */}
        {apiError && (
          <div className="flex gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-orange-700 dark:text-orange-300 text-sm">Erro na Operação</p>
              <p className="text-orange-600 dark:text-orange-400 text-xs mt-1">{apiError}</p>
              <button
                type="button"
                onClick={() => setApiError(null)}
                className="text-xs text-orange-600 dark:text-orange-400 hover:underline mt-2"
              >
                Descartar aviso
              </button>
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Tipo de Cliente"
            type="select"
            name="client_type"
            value={formData.client_type}
            onChange={(value) => setFieldValue('client_type', value)}
            options={clientTypeOptions}
            required
          />
          <FormField
            label={formData.client_type === 'pf' ? 'Nome Completo' : 'Razão Social'}
            name="company_name"
            value={formData.company_name}
            onChange={handleChange}
            error={errors.company_name}
            required
          />
          {formData.client_type === 'pf' && (
            <div>
              <FormField
                label="CPF"
                name="cpf"
                placeholder="XXX.XXX.XXX-XX"
                value={formData.cpf}
                onChange={(e) => handleDocumentChange('cpf', e.target.value)}
                error={errors.cpf}
              />
              {documentValidation.cpf && (
                <div className={`mt-1 flex items-center gap-2 text-sm ${
                  documentValidation.cpf.valid ? 'text-green-600' : 'text-red-600'
                }`}>
                  {documentValidation.cpf.valid ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  {documentValidation.cpf.message || 'CPF válido'}
                </div>
              )}
            </div>
          )}
          {formData.client_type === 'pj' && (
            <div>
              <FormField
                label="CNPJ"
                name="cnpj"
                placeholder="XX.XXX.XXX/XXXX-XX"
                value={formData.cnpj}
                onChange={(e) => handleDocumentChange('cnpj', e.target.value)}
                error={errors.cnpj}
              />
              {documentValidation.cnpj && (
                <div className={`mt-1 flex items-center gap-2 text-sm ${
                  documentValidation.cnpj.valid ? 'text-green-600' : 'text-red-600'
                }`}>
                  {documentValidation.cnpj.valid ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  {documentValidation.cnpj.message || 'CNPJ válido'}
                </div>
              )}
            </div>
          )}
          <FormField
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
          />
          <FormField
            label="Telefone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
          
          {/* CEP com ViaCEP */}
          <div className="col-span-2">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <FormField
                  label="CEP"
                  name="cep"
                  placeholder="XXXXX-XXX"
                  value={formData.cep}
                  onChange={handleCEPChange}
                  error={cepError}
                />
              </div>
              {cepLoading && (
                <div className="pb-2 text-xs text-slate-500 flex items-center gap-1">
                  <Loader className="w-4 h-4 animate-spin" />
                  Buscando...
                </div>
              )}
            </div>
          </div>

          {/* Campos de endereço (read-only após ViaCEP) */}
          <FormField
            label="Rua"
            name="endereco"
            value={formData.endereco}
            onChange={handleChange}
            readOnly={addressReadOnly}
            className={addressReadOnly ? 'bg-slate-100' : ''}
          />
          <FormField
            label="Número"
            name="numero"
            value={formData.numero}
            onChange={handleChange}
          />
          <FormField
            label="Complemento"
            name="complemento"
            value={formData.complemento}
            onChange={handleChange}
          />
          <FormField
            label="Bairro"
            name="bairro"
            value={formData.bairro}
            onChange={handleChange}
            readOnly={addressReadOnly}
            className={addressReadOnly ? 'bg-slate-100' : ''}
          />
          <FormField
            label="Cidade"
            name="cidade"
            value={formData.cidade}
            onChange={handleChange}
            readOnly={addressReadOnly}
            className={addressReadOnly ? 'bg-slate-100' : ''}
          />
          <FormField
            label="UF"
            name="uf"
            value={formData.uf}
            onChange={handleChange}
            maxLength="2"
            readOnly={addressReadOnly}
            className={addressReadOnly ? 'bg-slate-100' : ''}
          />

          <FormField
            label="Início do Ano Fiscal"
            type="date"
            name="fiscal_year_start"
            value={formData.fiscal_year_start}
            onChange={handleChange}
          />
          <FormField
            label="Moeda"
            type="select"
            name="currency"
            value={formData.currency}
            onChange={(value) => setFieldValue('currency', value)}
            options={currencyOptions}
          />
          <FormField
            label="Status"
            type="select"
            name="status"
            value={formData.status}
            onChange={(value) => setFieldValue('status', value)}
            options={statusOptions}
          />
        </div>

        <FormActions
          onCancel={onCancel}
          onSubmit={handleSubmit}
          loading={saving || loading}
          submitLabel={client ? 'Atualizar' : 'Criar'}
          isDirty={isDirty}
        />
      </form>
    </ModalWrapper>
  );
}