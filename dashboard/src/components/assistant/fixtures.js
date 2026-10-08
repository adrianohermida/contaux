// Dados fictícios para demonstração do Assistente Contaux (Onda 1)
// Nenhum dado real, credencial ou API de negócio é usado.

export const DEMO_SUGGESTIONS = [
  { id: 'checklist', label: 'Prepare o checklist do fechamento deste mês' },
  { id: 'conciliation', label: 'Explique a diferença de conciliação' },
  { id: 'draft', label: 'Rascunhe uma cobrança' },
]

// Rotas já existentes e autorizadas no shell staff
export const SAFE_ROUTES = {
  checklist: { label: 'Abrir Tarefas', path: '/tarefas' },
  conciliation: { label: 'Abrir Contabilidade', path: '/contabilidade' },
  draft: { label: 'Abrir Financeiro', path: '/financeiro' },
}

// Correspondência por palavras-chave
export function matchFixture(text) {
  const lower = text.toLowerCase()
  if (lower.includes('checklist') || lower.includes('fechamento')) return 'checklist'
  if (lower.includes('concilia') || lower.includes('diferen')) return 'conciliation'
  if (lower.includes('cobran') || lower.includes('rascunho')) return 'draft'
  return null
}

export function getFixtureResponse(id) {
  switch (id) {
    case 'checklist':
      return {
        kind: 'checklist',
        title: 'Checklist de Fechamento — Demonstração',
        company: 'Empresa Modelo Ltda (fictícia)',
        period: '10/2026 (fictícia)',
        items: [
          { label: 'Conciliação bancária', status: 'Pendente' },
          { label: 'Apuração de impostos (PIS/COFINS)', status: 'Pendente' },
          { label: 'Geração de DCTF', status: 'Pendente' },
          { label: 'Geração de SPED EFD', status: 'Pendente' },
          { label: 'Fechamento do razão', status: 'Pendente' },
        ],
      }
    case 'conciliation':
      return {
        kind: 'conciliation',
        title: 'Explicação de Conciliação — Demonstração',
        explanation:
          'A diferença de conciliação ocorre quando o saldo bancário (extrato) e o saldo contábil (razão) não coincidem. Causas comuns: cheques emitidos não compensados, taxas bancárias não lançadas ou recebimentos em trânsito.',
        values: [
          { label: 'Saldo bancário (extrato)', value: 'R$ 15.420,30' },
          { label: 'Saldo contábil (razão)', value: 'R$ 14.890,10' },
          { label: 'Diferença apurada', value: 'R$ 530,20' },
        ],
        formula: 'Diferença = Saldo bancário − Saldo contábil = 15.420,30 − 14.890,10 = 530,20',
        note: 'Valores fictícios para fins educacionais. Nenhum lançamento corretivo foi realizado.',
      }
    case 'draft':
      return {
        kind: 'draft',
        title: 'Rascunho de Cobrança — Demonstração',
        recipient: 'cliente.exemplo@ficticio.com',
        subject: 'Lembrete de pagamento — NF 00123 (fictícia)',
        body:
          'Prezado(a) Cliente Exemplo,\n\nVerificamos que a Nota Fiscal 00123 (fictícia), ' +
          'com vencimento em 31/10/2026, encontra-se em aberto no valor de R$ 2.500,00.\n\n' +
          'Solicitamos a regularização do pagamento. Em caso de dúvida, estamos à disposição.\n\n' +
          'Atenciosamente,\nEquipe Contaux (demonstração)',
        note: 'Texto editável. Nenhum envio será realizado.',
      }
    default:
      return null
  }
}
