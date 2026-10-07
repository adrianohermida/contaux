/**
 * Dados mock para o módulo CRM (substituir por API real no futuro)
 */

export const mockClients = [
  {
    id: '1', name: 'Tech Solutions LTDA', type: 'PJ', document: '12.345.678/0001-90',
    email: 'contato@techsolutions.com.br', phone: '(11) 98765-4321',
    status: 'active', tags: ['Premium', 'Mensal'],
    address: { street: 'Av. Paulista', number: '1000', city: 'São Paulo', state: 'SP', zip: '01310-100', complement: 'Sala 101' },
    fiscal: { inscricao_estadual: '123.456.789.123', inscricao_municipal: '1234567', regime_tributario: 'Lucro Presumido' },
    created: '2024-01-15', updated: '2024-10-01',
  },
  {
    id: '2', name: 'João Silva Oliveira', type: 'PF', document: '123.456.789-01',
    email: 'joao.silva@email.com', phone: '(21) 99876-5432',
    status: 'active', tags: ['Pessoa Física'],
    address: { street: 'Rua das Flores', number: '250', city: 'Rio de Janeiro', state: 'RJ', zip: '20000-000', complement: 'Apto 302' },
    fiscal: { inscricao_estadual: '', inscricao_municipal: '', regime_tributario: 'Simples Nacional' },
    created: '2024-03-20', updated: '2024-09-15',
  },
  {
    id: '3', name: 'Comércio Beta ME', type: 'PJ', document: '98.765.432/0001-10',
    email: 'financeiro@comerciobeta.com.br', phone: '(31) 97654-3210',
    status: 'prospect', tags: ['Prospect', 'Simples'],
    address: { street: 'Rua da Bahia', number: '500', city: 'Belo Horizonte', state: 'MG', zip: '30160-000', complement: '' },
    fiscal: { inscricao_estadual: '987.654.321.987', inscricao_municipal: '9876543', regime_tributario: 'Simples Nacional' },
    created: '2024-08-01', updated: '2024-10-05',
  },
  {
    id: '4', name: 'Maria Fernanda Costa', type: 'PF', document: '987.654.321-09',
    email: 'maria.costa@email.com', phone: '(85) 91234-5678',
    status: 'inactive', tags: ['Pessoa Física', 'Inativo'],
    address: { street: 'Av. Beira Mar', number: '1200', city: 'Fortaleza', state: 'CE', zip: '60165-081', complement: '' },
    fiscal: { inscricao_estadual: '', inscricao_municipal: '', regime_tributario: 'MEI' },
    created: '2023-11-10', updated: '2024-06-30',
  },
  {
    id: '5', name: 'Indústria Gamma S/A', type: 'PJ', document: '45.678.901/0001-23',
    email: 'contato@gammaindustria.com.br', phone: '(47) 93456-7890',
    status: 'active', tags: ['Premium', 'Indústria', 'Mensal'],
    address: { street: 'Rod. BR-101', number: 'Km 50', city: 'Joinville', state: 'SC', zip: '89200-000', complement: 'Galpão 5' },
    fiscal: { inscricao_estadual: '456.789.012.345', inscricao_municipal: '4567890', regime_tributario: 'Lucro Real' },
    created: '2023-06-05', updated: '2024-10-07',
  },
]

export const mockContacts = [
  { id: '1', name: 'Carlos Eduardo Lima', email: 'carlos@techsolutions.com.br', phone: '(11) 98765-4321', position: 'Diretor Financeiro', clientId: '1', tags: ['Decisor'], created: '2024-01-15' },
  { id: '2', name: 'Ana Paula Souza', email: 'ana@techsolutions.com.br', phone: '(11) 97654-3210', position: 'Contadora', clientId: '1', tags: ['Contato Técnico'], created: '2024-01-20' },
  { id: '3', name: 'João Silva Oliveira', email: 'joao.silva@email.com', phone: '(21) 99876-5432', position: 'Titular', clientId: '2', tags: [], created: '2024-03-20' },
  { id: '4', name: 'Pedro Henrique Alves', email: 'pedro@comerciobeta.com.br', phone: '(31) 97654-3210', position: 'Sócio', clientId: '3', tags: ['Decisor', 'Prospect'], created: '2024-08-01' },
  { id: '5', name: 'Roberto Mendes', email: 'roberto@gammaindustria.com.br', phone: '(47) 93456-7890', position: 'CEO', clientId: '5', tags: ['Decisor', 'Premium'], created: '2023-06-05' },
]

export const mockNotes = [
  { id: '1', contactId: '1', author: 'Equipe Contaux', content: 'Cliente solicitou revisão da declaração do IRPF. Agendar reunião para próxima semana.', created: '2024-09-28' },
  { id: '2', contactId: '1', author: 'Equipe Contaux', content: 'Enviado proposta de renovação do contrato mensal.', created: '2024-09-15' },
  { id: '3', contactId: '5', author: 'Equipe Contaux', content: 'Reunião sobre reestruturação fiscal agendada para 15/10.', created: '2024-10-01' },
]

export const mockActivities = [
  { id: '1', contactId: '1', type: 'email', description: 'Email enviado com proposta de serviços', created: '2024-09-15' },
  { id: '2', contactId: '1', type: 'call', description: 'Ligação de follow-up sobre proposta', created: '2024-09-20' },
  { id: '3', contactId: '5', type: 'meeting', description: 'Reunião presencial sobre planejamento tributário', created: '2024-10-01' },
]

export const statusLabels = {
  active: 'Ativo',
  inactive: 'Inativo',
  prospect: 'Prospect',
}

export const statusVariants = {
  active: 'default',
  inactive: 'destructive',
  prospect: 'outline',
}

export const typeLabels = {
  PF: 'Pessoa Física',
  PJ: 'Pessoa Jurídica',
}
