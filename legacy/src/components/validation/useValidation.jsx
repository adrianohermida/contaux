/**
 * useValidation Hook
 * Centralized form validation with Zod schemas
 */

import { useState, useCallback, useMemo } from 'react';
import { z } from 'zod';

export function useValidation(schema) {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validate = useCallback(
    (data) => {
      try {
        schema.parse(data);
        setErrors({});
        return true;
      } catch (error) {
        if (error instanceof z.ZodError) {
          const newErrors = {};
          error.errors.forEach((err) => {
            const path = err.path.join('.');
            newErrors[path] = err.message;
          });
          setErrors(newErrors);
        }
        return false;
      }
    },
    [schema]
  );

  const validateField = useCallback(
    (fieldName, value) => {
      try {
        // Create partial schema for single field validation
        const fieldSchema = schema.pick({ [fieldName]: true });
        fieldSchema.parse({ [fieldName]: value });
        
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
        return true;
      } catch (error) {
        if (error instanceof z.ZodError) {
          setErrors((prev) => ({
            ...prev,
            [fieldName]: error.errors[0].message,
          }));
        }
        return false;
      }
    },
    [schema]
  );

  const markTouched = useCallback((fieldName) => {
    setTouched((prev) => ({
      ...prev,
      [fieldName]: true,
    }));
  }, []);

  const reset = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  const getFieldError = useCallback(
    (fieldName) => {
      return touched[fieldName] ? errors[fieldName] : undefined;
    },
    [errors, touched]
  );

  const hasError = useMemo(() => {
    return Object.keys(errors).length > 0;
  }, [errors]);

  return {
    errors,
    touched,
    validate,
    validateField,
    markTouched,
    reset,
    getFieldError,
    hasError,
  };
}

export default useValidation;