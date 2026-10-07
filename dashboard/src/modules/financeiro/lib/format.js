/** Formatação de valores monetários e datas (pt-BR) */

export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0)
}

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function addDaysISO(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

/** Calcula subtotal, desconto e total a partir de itens */
export function calcTotals(items, discount = 0) {
  const subtotal = items.reduce((sum, it) => sum + (it.quantity * it.unit_price || 0), 0)
  const total = Math.max(0, subtotal - (discount || 0))
  return { subtotal, discount: discount || 0, total }
}

/** Verifica se uma fatura está vencida */
export function isOverdue(dueDate, status) {
  if (status === 'paid' || status === 'cancelled') return false
  return new Date(dueDate + 'T00:00:00') < new Date(new Date().toDateString())
}
