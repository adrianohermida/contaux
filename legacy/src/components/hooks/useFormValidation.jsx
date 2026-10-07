import { useState, useCallback } from 'react';

/**
 * Hook para validação de formulários
 * Suporta validações customizadas e erros por campo
 */
export function useFormValidation(initialErrors = {}) {
  const [errors, setErrors] = useState(initialErrors);

  const validateField = useCallback((name, value, rules) => {
    if (!rules) return null;

    if (rules.required && (!value || value.toString().trim() === '')) {
      return `${rules.label || name} é obrigatório`;
    }

    if (rules.minLength && value.length < rules.minLength) {
      return `${rules.label || name} deve ter pelo menos ${rules.minLength} caracteres`;
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      return rules.patternMessage || `${rules.label || name} é inválido`;
    }

    if (rules.custom) {
      const customError = rules.custom(value);
      if (customError) return customError;
    }

    return null;
  }, []);

  const validateForm = useCallback((formData, validationRules) => {
    const newErrors = {};

    Object.keys(validationRules).forEach(field => {
      const error = validateField(field, formData[field], validationRules[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [validateField]);

  const setFieldError = useCallback((field, error) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const clearFieldError = useCallback((field) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    validateField,
    validateForm,
    setFieldError,
    clearFieldError,
    clearErrors,
    hasErrors: Object.keys(errors).length > 0
  };
}