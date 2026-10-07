import { useState, useCallback, useMemo } from 'react';

/**
 * Hook para gerenciar estado de formulário
 * Padroniza inicialização, mudanças e reset
 */
export function useFormState(initialData = {}) {
  const [formData, setFormData] = useState(initialData);
  const [isDirty, setIsDirty] = useState(false);

  const memoizedInitialData = useMemo(() => initialData, [JSON.stringify(initialData)]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setIsDirty(true);
  }, []);

  const setFieldValue = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  }, []);

  const reset = useCallback(() => {
    setFormData(memoizedInitialData);
    setIsDirty(false);
  }, [memoizedInitialData]);

  const resetDirty = useCallback(() => {
    setIsDirty(false);
  }, []);

  return {
    formData,
    setFormData,
    handleChange,
    setFieldValue,
    reset,
    resetDirty,
    isDirty
  };
}