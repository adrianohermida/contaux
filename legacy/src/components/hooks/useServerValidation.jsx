/**
 * useServerValidation Hook
 * Calls backend validation function for entities
 */

import { useCallback, useState } from 'react';
import { base44 } from '@/api/base44Client';

export function useServerValidation() {
  const [validating, setValidating] = useState(false);
  const [errors, setErrors] = useState({});

  const validateEntity = useCallback(async (entityType, data, operation = 'create') => {
    setValidating(true);
    setErrors({});

    try {
      const response = await base44.functions.invoke('validateEntityData', {
        entityType,
        data,
        operation,
      });

      if (!response.data.valid) {
        const errorMap = {};
        response.data.errors?.forEach(err => {
          errorMap[err.path] = err.message;
        });
        setErrors(errorMap);
        return false;
      }

      return true;
    } catch (error) {
      setErrors({ _server: error.message });
      return false;
    } finally {
      setValidating(false);
    }
  }, []);

  return {
    validateEntity,
    validating,
    errors,
  };
}

export default useServerValidation;