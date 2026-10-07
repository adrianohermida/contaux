/**
 * useFieldHints Hook
 * Context-aware field hints and validation suggestions
 */

import { useState, useCallback, useMemo } from 'react';

const HINT_PATTERNS = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    hint: 'Enter a valid email (e.g., user@example.com)',
    errorMessage: 'Invalid email format',
  },
  phone: {
    pattern: /^[\d\s\-\+\(\)]+$/,
    hint: 'Enter phone number with optional +/() format',
    errorMessage: 'Invalid phone format',
  },
  cpf: {
    pattern: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
    hint: 'Format: XXX.XXX.XXX-XX',
    errorMessage: 'Invalid CPF format',
  },
  cnpj: {
    pattern: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
    hint: 'Format: XX.XXX.XXX/XXXX-XX',
    errorMessage: 'Invalid CNPJ format',
  },
  url: {
    pattern: /^https?:\/\/.+/,
    hint: 'Enter a valid URL (http:// or https://)',
    errorMessage: 'Invalid URL format',
  },
  number: {
    pattern: /^\d+(\.\d{1,2})?$/,
    hint: 'Enter a numeric value',
    errorMessage: 'Only numbers allowed',
  },
  zipcode: {
    pattern: /^\d{5}-?\d{3}$/,
    hint: 'Format: XXXXX-XXX or XXXXXXXX',
    errorMessage: 'Invalid zip code format',
  },
};

export function useFieldHints() {
  const [activeField, setActiveField] = useState(null);
  const [validationState, setValidationState] = useState({});

  // Get hint for field type
  const getHint = useCallback((fieldType) => {
    return HINT_PATTERNS[fieldType?.toLowerCase()]?.hint || null;
  }, []);

  // Validate field with hint
  const validateField = useCallback((fieldName, value, fieldType) => {
    const config = HINT_PATTERNS[fieldType?.toLowerCase()];
    
    if (!config) {
      return { isValid: true, message: null };
    }

    const isValid = config.pattern.test(value);
    
    setValidationState(prev => ({
      ...prev,
      [fieldName]: {
        isValid,
        message: isValid ? null : config.errorMessage,
        hint: isValid ? config.hint : config.errorMessage,
      },
    }));

    return {
      isValid,
      message: isValid ? null : config.errorMessage,
    };
  }, []);

  // Get suggestion based on field context
  const getSuggestion = useCallback((fieldName, value, fieldType, context) => {
    const validationResult = validationState[fieldName];
    
    // Provide contextual suggestions
    const suggestions = {
      email: value && !HINT_PATTERNS.email.pattern.test(value) 
        ? 'Check email format (missing @ or domain)' 
        : null,
      phone: value && value.length < 10 
        ? 'Phone number seems incomplete' 
        : null,
      cpf: value && value.length < 14 
        ? 'CPF requires format XXX.XXX.XXX-XX' 
        : null,
      cnpj: value && value.length < 18 
        ? 'CNPJ requires format XX.XXX.XXX/XXXX-XX' 
        : null,
    };

    return suggestions[fieldType?.toLowerCase()] || null;
  }, [validationState]);

  return {
    getHint,
    validateField,
    getSuggestion,
    validationState,
    setActiveField,
    activeField,
  };
}

export default useFieldHints;