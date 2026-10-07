/**
 * Validação de CPF e CNPJ com dígito verificador
 */

function calcCheckDigit(digits, weights) {
  const sum = digits.reduce((acc, d, i) => acc + d * weights[i], 0)
  const remainder = sum % 11
  return remainder < 2 ? 0 : 11 - remainder
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

/** Valida CNPJ (14 dígitos) */
export function validateCNPJ(cnpj) {
  const clean = cnpj.replace(/\D/g, '')
  if (clean.length !== 14) return false
  if (/^(\d)\1{13}$/.test(clean)) return false

  const digits = clean.split('').map(Number)
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

  const d1 = calcCheckDigit(digits.slice(0, 12), w1)
  const d2 = calcCheckDigit(digits.slice(0, 12).concat(d1), w2)

  return d1 === digits[12] && d2 === digits[13]
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

/** Formata CNPJ: 12.345.678/0001-90 */
export function formatCNPJ(cnpj) {
  const c = cnpj.replace(/\D/g, '').slice(0, 14)
  return c
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
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
