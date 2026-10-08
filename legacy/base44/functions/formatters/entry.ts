/**
 * Formatters Utility - Centraliza todas as funções de formatação
 * Evita duplicação entre componentes e hooks
 */

export const formatCPF = (value) => {
  if (!value) return '';
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{2})$/, '$1-$2');
};

export const formatCNPJ = (value) => {
  if (!value) return '';
  return value
    .replace(/\D/g, '')
    .slice(0, 14)
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
};

export const formatPhone = (value) => {
  if (!value) return '';
  const clean = value.replace(/\D/g, '');
  if (clean.length <= 10) {
    return clean.replace(/(\d{2})(\d{4})(\d)/, '($1) $2-$3');
  }
  return clean.replace(/(\d{2})(\d{5})(\d)/, '($1) $2-$3');
};

export const formatCEP = (value) => {
  if (!value) return '';
  return value.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2');
};

export const formatCurrency = (value, currency = 'BRL') => {
  if (!value) return '0,00';
  const formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency,
  });
  return formatter.format(value);
};

export const formatDate = (date, format = 'DD/MM/YYYY') => {
  if (!date) return '';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  if (format === 'DD/MM/YYYY') return `${day}/${month}/${year}`;
  if (format === 'YYYY-MM-DD') return `${year}-${month}-${day}`;
  return `${day}/${month}/${year}`;
};

export const formatPercentage = (value) => {
  if (!value) return '0%';
  return `${Number(value).toFixed(2)}%`;
};