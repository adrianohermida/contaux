/** Dados mock do módulo Administração */

export const roleLabels = {
  admin: 'Administrador',
  manager: 'Gerente',
  accountant: 'Contador',
  viewer: 'Visualizador',
}

export const roleVariants = {
  admin: 'default',
  manager: 'secondary',
  accountant: 'outline',
  viewer: 'outline',
}

export const mockUsers = [
  { id: '1', name: 'Administrador', email: 'admin@contaux.com.br', role: 'admin', mfa_enabled: true, last_login: '2026-10-07T18:00:00Z', active: true },
  { id: '2', name: 'Ana Paula Costa', email: 'ana@contaux.com.br', role: 'accountant', mfa_enabled: false, last_login: '2026-10-07T15:30:00Z', active: true },
  { id: '3', name: 'Carlos Eduardo Lima', email: 'carlos@contaux.com.br', role: 'manager', mfa_enabled: true, last_login: '2026-10-06T10:00:00Z', active: true },
  { id: '4', name: 'Visitante Externo', email: 'visitante@contaux.com.br', role: 'viewer', mfa_enabled: false, last_login: '2026-09-28T14:00:00Z', active: false },
]

export const mockAuditLogs = [
  { id: '1', user: 'admin@contaux.com.br', action: 'login', entity_type: 'auth', entity_id: '', details: 'Login bem-sucedido', ip: '189.45.x.x', timestamp: '2026-10-07T18:00:00Z' },
  { id: '2', user: 'ana@contaux.com.br', action: 'create', entity_type: 'invoice', entity_id: 'NF-2024-005', details: 'Fatura criada', ip: '200.150.x.x', timestamp: '2026-10-07T15:30:00Z' },
  { id: '3', user: 'carlos@contaux.com.br', action: 'update', entity_type: 'client', entity_id: '2', details: 'Cliente atualizado', ip: '201.80.x.x', timestamp: '2026-10-06T10:00:00Z' },
  { id: '4', user: 'admin@contaux.com.br', action: 'delete', entity_type: 'ticket', entity_id: '5', details: 'Ticket excluído', ip: '189.45.x.x', timestamp: '2026-10-05T09:00:00Z' },
  { id: '5', user: 'ana@contaux.com.br', action: 'export', entity_type: 'report', entity_id: '', details: 'Relatório financeiro exportado', ip: '200.150.x.x', timestamp: '2026-10-04T16:00:00Z' },
]

export const mockWorkflows = [
  { id: '1', name: 'Notificar novo ticket', trigger: 'event', conditions: ['Tipo: ticket', 'Status: open'], actions: ['Enviar email para responsável'], active: true },
  { id: '2', name: 'Lembrete de vencimento', trigger: 'schedule', conditions: ['Fatura vence em 3 dias'], actions: ['Enviar email ao cliente'], active: true },
  { id: '3', name: 'Backup semanal', trigger: 'schedule', conditions: ['Todo domingo às 02:00'], actions: ['Exportar dados', 'Enviar para storage'], active: false },
]

export const mockDocuments = [
  { id: '1', name: 'Contrato de Prestação de Serviços', type: 'contrato', category: 'Templates', updated: '2026-09-15' },
  { id: '2', name: 'Procuração Contábil', type: 'procuracao', category: 'Templates', updated: '2026-08-20' },
  { id: '3', name: 'Termo de Responsabilidade LGPD', type: 'termo', category: 'LGPD', updated: '2026-07-10' },
  { id: '4', name: 'Manual do Cliente - Onboarding', type: 'manual', category: 'Guias', updated: '2026-10-01' },
]

export const mockReports = [
  { id: '1', name: 'Relatório Financeiro Mensal', type: 'financeiro', format: 'pdf', schedule: 'monthly', last_run: '2026-10-01' },
  { id: '2', name: 'Relatório de Clientes Ativos', type: 'crm', format: 'xlsx', schedule: 'weekly', last_run: '2026-10-06' },
  { id: '3', name: 'Relatório de Tickets por SLA', type: 'suporte', format: 'pdf', schedule: 'monthly', last_run: '2026-10-01' },
  { id: '4', name: 'Exportação Completa (LGPD)', type: 'sistema', format: 'csv', schedule: 'on-demand', last_run: '2026-09-20' },
]
