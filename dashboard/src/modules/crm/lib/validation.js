/**
 * Validação de CPF e CNPJ com dígito verificador.
 * CNPJ suporta formato alfanumérico (IN RFB nº 2.229/2024, a partir de jul/2026).
 */

function calcCheckDigit(digits, weights) {
  const sum = digits.reduce((acc, d, i) => acc + d * weights[i], 0)
  const remainder = sum % 11
  return remainder < 2 ? 0 : 11 - remainder
}

/**
 * Converte um caractere alfanumérico para seu valor numérico no cálculo do DV.
 * Digits 0-9 → 0-9 (ASCII - 48). Letras A-Z → 17-42 (ASCII - 48).
 */
function charToValue(ch) {
  const code = ch.charCodeAt(0)
  return code - 48
}

/** Valida CPF (11 dígitos) */
export function validateCPF(cpf) {
  const clean = cpf.replace(/\D/g, '')
  if (clean.length !== 11) return false
  if (/^(\d)\1{10}$/.test(clean)) return false

  const digits = clean.split('').map(Number)
  const w1 = [10, 9, 8, 7, 6, 5, 4, 3, 2]
  const w2 = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]

  const d1 = calcCheckDigit(digits.slice(0, 9), w1)
  const d2 = calcCheckDigit(digits.slice(0, 9).concat(d1), w2)

  return d1 === digits[9] && d2 === digits[10]
}

/**
 * Valida CNPJ (14 posições).
 * Aceita formato numérico (antigo) e alfanumérico (novo, a partir de jul/2026).
 * Os 2 últimos caracteres (dígitos verificadores) são sempre numéricos.
 */
export function validateCNPJ(cnpj) {
  // Remove formatação visual (., /, -) preservando letras e dígitos
  const clean = cnpj.replace(/[.\-/]/g, '').toUpperCase()
  if (clean.length !== 14) return false
  // Todos iguais → inválido
  if (/^(.)\1{13}$/.test(clean)) return false
  // Os 2 DVs (posições 13-14) devem ser dígitos
  if (!/\d{2}$/.test(clean)) return false
  // Caracteres válidos: apenas 0-9 e A-Z (sem I, O, Q, F por recomendação, mas aceitos)
  if (!/^[0-9A-Z]{14}$/.test(clean)) return false

  const values = clean.split('').map(charToValue)
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

  const d1 = calcCheckDigit(values.slice(0, 12), w1)
  const d2 = calcCheckDigit(values.slice(0, 12).concat(d1), w2)

  return d1 === values[12] && d2 === values[13]
}

/** Valida documento (CPF ou CNPJ) baseado no tipo */
export function validateDocument(doc, type) {
  return type === 'PF' ? validateCPF(doc) : validateCNPJ(doc)
}

/** Formata CPF: 123.456.789-01 */
export function formatCPF(cpf) {
  const c = cpf.replace(/\D/g, '').slice(0, 11)
  return c
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

/** Formata CNPJ: 12.345.678/0001-90 ou AB12.CD34.EF56/0001-90 (alfanumérico) */
export function formatCNPJ(cnpj) {
  // Remove formatação visual preservando letras e dígitos
  const c = cnpj.replace(/[.\-/]/g, '').toUpperCase().slice(0, 14)
  return c
    .replace(/^([0-9A-Z]{2})([0-9A-Z])/, '$1.$2')
    .replace(/^([0-9A-Z]{2})\.([0-9A-Z]{3})([0-9A-Z])/, '$1.$2.$3')
    .replace(/^([0-9A-Z]{2})\.([0-9A-Z]{3})\.([0-9A-Z]{3})([0-9A-Z])/, '$1.$2.$3/$4')
    .replace(/([0-9A-Z]{4})([0-9A-Z]{1,2})$/, '$1-$2')
}

/** Formata documento conforme o tipo */
export function formatDocument(doc, type) {
  return type === 'PF' ? formatCPF(doc) : formatCNPJ(doc)
}

/** Formata telefone: (11) 98765-4321 */
export function formatPhone(phone) {
  const c = phone.replace(/\D/g, '').slice(0, 11)
  if (c.length <= 10) {
    return c.replace(/(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3')
  }
  return c.replace(/(\d{2})(\d{5})(\d{0,4})$/, '($1) $2-$3')
}

/** Formata CEP: 12345-678 */
export function formatCEP(cep) {
  const c = cep.replace(/\D/g, '').slice(0, 8)
  return c.replace(/(\d{5})(\d{0,3})$/, '$1-$2')
}
