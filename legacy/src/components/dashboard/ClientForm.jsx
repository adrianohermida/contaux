import React, { useMemo, useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useFormState } from '@/components/modals/useFormState';
import { useFormValidation } from '@/components/hooks/useFormValidation';
import { useFormSubmit } from '@/components/modals/useFormSubmit';
import { useViaCEP, formatCEP, validateCEP } from '@/components/hooks/useViaCEP';
import ModalWrapper from '@/components/modals/ModalWrapper';
import FormField from '@/components/modals/FormField';
import FormActions from '@/components/modals/FormActions';
import { AlertCircle, CheckCircle, MapPin, Loader } from 'lucide-react';
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

export default function ClientForm({ client, onSave, onCancel, tenantId, isOpen = true }) {
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
  const closeModalRef = useRef(null);

  const currencyOptions = [
    { value: 'BRL', label: 'Real (BRL)' },
    { value: 'USD', label: 'Dólar (USD)' },
    { value: 'EUR', label: 'Euro (EUR)' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Ativo' },
    { value: 'inactive', label: 'Inativo' }
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
      const response = await base44.functions.invoke('validateClientDocument', {
        document: value,
        type: field,
        tenantId,
        excludeClientId: client?.id
      });

      const isValid = response.data.valid;
      setDocumentValidation(prev => ({
        ...prev,
        [field]: isValid ? { valid: true } : { valid: false, message: response.data.message }
      }));

      return isValid;
    } catch (error) {
      console.error('Erro na validação:', error);
      return false;
    }
  };

  const handleDocumentChange = async (field, value) => {
    const formatted = field === 'cpf' ? formatCPF(value) : formatCNPJ(value);
    setFieldValue(field, formatted);
    
    if (formatted.match(/\d/g)?.length === (field === 'cpf' ? 11 : 14)) {
      await validateDocument(field, formatted);
    }
  };

  const handleCEPChange = async (e) => {
    const cepValue = e.target.value;
    setFieldValue('cep', cepValue);
    clearCepError();

    if (validateCEP(cepValue)) {
      const addressData = await fetchAddress(cepValue);
      if (addressData) {
        setFieldValue('endereco', addressData.endereco);
        setFieldValue('bairro', addressData.bairro);
        setFieldValue('cidade', addressData.cidade);
        setFieldValue('uf', addressData.uf);
        // Limpar erro de CEP após sucesso
        clearErrors();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearErrors();

    if (!validateForm(formData, VALIDATION_RULES)) {
      return;
    }

    // Validar documentos se necessário
    if (formData.client_type === 'pf' && formData.cpf) {
      const cpfValid = await validateDocument('cpf', formData.cpf);
      if (!cpfValid) {
        setFieldError('cpf', 'CPF inválido ou duplicado');
        return;
      }
    }

    if (formData.client_type === 'pj' && formData.cnpj) {
      const cnpjValid = await validateDocument('cnpj', formData.cnpj);
      if (!cnpjValid) {
        setFieldError('cnpj', 'CNPJ inválido ou duplicado');
        return;
      }
    }

    await submit(
      async () => {
        if (client?.id) {
          await base44.entities.Client.update(client.id, formData);
        } else {
          await base44.entities.Client.create(formData);
        }
      },
      {
        onSuccess: () => {
          reset();
          onSave();
        },
        successMessage: client ? 'Cliente atualizado com sucesso!' : 'Cliente criado com sucesso!',
        errorMessage: 'Erro ao salvar cliente. Tente novamente.',
        tenantId,
        entityType: 'Client',
        action: client ? 'update' : 'create'
      }
    );
  };

  return (
    <ModalWrapper 
      isOpen={isOpen} 
      onClose={onCancel}
      title={client ? 'Editar Cliente' : 'Novo Cliente'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-[var(--spacing-md)]">
         <div className="grid grid-cols-2 gap-[var(--spacing-md)]">
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
                <div className={`mt-[var(--spacing-xs)] flex items-center gap-[var(--spacing-sm)] text-[var(--font-size-sm)] ${
                  documentValidation.cpf.valid ? 'text-emerald-600' : 'text-[var(--color-error)]'
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
                <div className={`mt-[var(--spacing-xs)] flex items-center gap-[var(--spacing-sm)] text-[var(--font-size-sm)] ${
                  documentValidation.cnpj.valid ? 'text-emerald-600' : 'text-[var(--color-error)]'
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
          <FormField
            label="CEP"
            name="cep"
            placeholder="XXXXX-XXX"
            value={formData.cep}
            onChange={handleCEPChange}
            error={cepError}
          />
          <FormField
            label="Rua"
            name="endereco"
            value={formData.endereco}
            onChange={handleChange}
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
          />
          <FormField
            label="Cidade"
            name="cidade"
            value={formData.cidade}
            onChange={handleChange}
          />
          <FormField
            label="UF"
            name="uf"
            value={formData.uf}
            onChange={handleChange}
            maxLength="2"
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
          loading={loading}
          submitLabel={client ? 'Atualizar' : 'Criar'}
          isDirty={isDirty}
        />
      </form>
    </ModalWrapper>
  );
}