import React from 'react';

/**
 * InputValidator - Protege contra XSS, SQL injection e outros ataques
 * Validações de segurança em tempo real
 */

// XSS Attack patterns
const XSS_PATTERNS = [
  /<script[^>]*>[\s\S]*?<\/script>/gi,
  /on\w+\s*=/gi, // onload=, onclick=, etc
  /javascript:/gi,
  /data:text\/html/gi,
  /<iframe/gi,
  /<embed/gi,
];

// SQL Injection patterns
const SQL_PATTERNS = [
  /(\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
  /('|"|;|--|\bOR\b|\bAND\b)/gi,
];

/**
 * Sanitiza string removendo caracteres perigosos
 */
export function sanitizeInput(input, type = 'text') {
  if (!input) return '';

  let sanitized = String(input).trim();

  // XSS Prevention
  XSS_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });

  // Type-specific sanitization
  switch (type) {
    case 'email':
      // Apenas caracteres válidos em email
      sanitized = sanitized.replace(/[^a-zA-Z0-9.@_-]/g, '');
      break;
    case 'phone':
      // Apenas números, +, -, parênteses
      sanitized = sanitized.replace(/[^0-9+\-()]/g, '');
      break;
    case 'url':
      // Remove espaços e caracteres inválidos
      sanitized = sanitized.replace(/\s/g, '');
      break;
    case 'number':
      // Apenas números
      sanitized = sanitized.replace(/[^0-9.-]/g, '');
      break;
  }

  return sanitized;
}

/**
 * Valida se input contém caracteres suspeitos
 */
export function hasSecurityRisk(input) {
  if (!input) return false;

  const str = String(input).toLowerCase();

  // Check XSS
  for (const pattern of XSS_PATTERNS) {
    if (pattern.test(str)) {
      return true;
    }
  }

  // Check SQL injection
  for (const pattern of SQL_PATTERNS) {
    if (pattern.test(str)) {
      return true;
    }
  }

  return false;
}

/**
 * Valida email format
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida URL format
 */
export function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Hook para validação de input em tempo real
 */
export function useSecureInput(initialValue = '') {
  const [value, setValue] = React.useState(initialValue);
  const [risk, setRisk] = React.useState(null);

  const handleChange = (newValue, type = 'text') => {
    // Check for security risks
    if (hasSecurityRisk(newValue)) {
      setRisk('Entrada contém caracteres suspeitos');
      return;
    }

    // Sanitize
    const sanitized = sanitizeInput(newValue, type);
    setValue(sanitized);
    setRisk(null);
  };

  return { value, setValue: handleChange, risk, hasRisk: !!risk };
}

/**
 * Component para input seguro
 */
export const SecureInput = React.memo(function SecureInput({
  value,
  onChange,
  onSecurityRisk,
  type = 'text',
  ...props
}) {
  const handleChange = (e) => {
    const newValue = e.target.value;

    if (hasSecurityRisk(newValue)) {
      onSecurityRisk?.(true);
      return;
    }

    const sanitized = sanitizeInput(newValue, type);
    onSecurityRisk?.(false);
    onChange?.({ target: { ...e.target, value: sanitized } });
  };

  return (
    <input
      {...props}
      value={value}
      onChange={handleChange}
      className="w-full px-3 py-2 border border-slate-300 rounded-md disabled:opacity-60"
    />
  );
});

SecureInput.displayName = 'SecureInput';