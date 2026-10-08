import { useState, useCallback } from 'react';
import { sanitizeInput, hasSecurityRisk } from '../../security/InputValidator';
import { 
  validateContactForm, 
  validateEmailUniqueness,
  validateCPF,
  validateCNPJ,
  validatePhone,
  validateCEP,
  validateEmail
} from '@/functions/validators';
import {
  formatCPF,
  formatCNPJ,
  formatPhone,
  formatCEP
} from '@/functions/formatters';

export function useContactForm(initialData, contactId, workspaceId, base44, onSuccess, onError) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;

    if (hasSecurityRisk(value)) {
      setErrors(prev => ({ ...prev, [name]: 'Entrada contém caracteres suspeitos' }));
      return;
    }

    const fieldType = name === 'email' ? 'email' : name === 'phone' ? 'phone' : 'text';
    let newValue = sanitizeInput(value, fieldType);

    // Apply formatters to specific fields
    if (name === 'cpf' && formData.client_type === 'pf') {
      newValue = formatCPF(newValue);
    } else if (name === 'cnpj' && formData.client_type === 'pj') {
      newValue = formatCNPJ(newValue);
    } else if (name === 'phone') {
      newValue = formatPhone(newValue);
    } else if (name === 'cep') {
      newValue = formatCEP(newValue);
    }

    if (name === 'client_type' && formData.client_type !== newValue) {
      setFormData(prev => ({ 
        ...prev, 
        [name]: newValue,
        cpf: '',
        cnpj: ''
      }));
      setErrors(prev => ({
        ...prev,
        [name]: null,
        cpf: null,
        cnpj: null
      }));
    } else if (name === 'cpf' && formData.client_type === 'pj') {
      setErrors(prev => ({ ...prev, [name]: 'CPF não é permitido para Pessoa Jurídica' }));
      return;
    } else if (name === 'cnpj' && formData.client_type === 'pf') {
      setErrors(prev => ({ ...prev, [name]: 'CNPJ não é permitido para Pessoa Física' }));
      return;
    } else {
      setFormData(prev => ({ ...prev, [name]: newValue }));
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: null }));
      }
    }
    setHasChanges(true);
  }, [formData.client_type, errors]);

  const validateForm = useCallback(async () => {
    const formErrors = validateContactForm(formData);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      onError('Corrija os erros no formulário');
      return false;
    }

    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('timeout')), 5000)
      );
      const validationPromise = validateEmailUniqueness(base44, formData.email, contactId, workspaceId);
      const isEmailUnique = await Promise.race([validationPromise, timeoutPromise]);
      
      if (!isEmailUnique) {
        setErrors({ email: 'Este email já está em uso por outro contato' });
        onError('Email já existe no sistema');
        return false;
      }
    } catch (err) {
      if (err.message !== 'timeout') throw err;
    }

    setErrors({});
    return true;
  }, [formData, contactId, workspaceId, base44, onError]);

  const reset = useCallback((originalData) => {
    setFormData(originalData);
    setErrors({});
    setHasChanges(false);
  }, []);

  return {
    formData,
    setFormData,
    errors,
    hasChanges,
    handleInputChange,
    validateForm,
    reset
  };
}