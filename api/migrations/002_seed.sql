-- Seed 001 — Dados iniciais (espelha os mockData.js)
-- Executa apenas se as tabelas estiverem vazias

BEGIN;

-- ===== CLIENTES =====
INSERT INTO clients (name, type, document, email, phone, status, tags, address, fiscal, created, updated)
VALUES
('Tech Solutions LTDA', 'PJ', '12.345.678/0001-90', 'contato@techsolutions.com.br', '(11) 98765-4321', 'active', '["Premium","Mensal"]', '{"street":"Av. Paulista","number":"1000","city":"São Paulo","state":"SP","zip":"01310-100","complement":"Sala 101"}', '{"inscricao_estadual":"123.456.789.123","inscricao_municipal":"1234567","regime_tributario":"Lucro Presumido"}', '2024-01-15', '2024-10-01'),
('João Silva Oliveira', 'PF', '123.456.789-01', 'joao.silva@email.com', '(21) 99876-5432', 'active', '["Pessoa Física"]', '{"street":"Rua das Flores","number":"250","city":"Rio de Janeiro","state":"RJ","zip":"20000-000","complement":"Apto 302"}', '{"inscricao_estadual":"","inscricao_municipal":"","regime_tributario":"Simples Nacional"}', '2024-03-20', '2024-09-15'),
('Comércio Beta ME', 'PJ', '98.765.432/0001-10', 'financeiro@comerciobeta.com.br', '(31) 97654-3210', 'prospect', '["Prospect","Simples"]', '{"street":"Rua da Bahia","number":"500","city":"Belo Horizonte","state":"MG","zip":"30160-000","complement":""}', '{"inscricao_estadual":"987.654.321.987","inscricao_municipal":"9876543","regime_tributario":"Simples Nacional"}', '2024-08-01', '2024-10-05'),
('Maria Fernanda Costa', 'PF', '987.654.321-09', 'maria.costa@email.com', '(85) 91234-5678', 'inactive', '["Pessoa Física","Inativo"]', '{"street":"Av. Beira Mar","number":"1200","city":"Fortaleza","state":"CE","zip":"60165-081","complement":""}', '{"inscricao_estadual":"","inscricao_municipal":"","regime_tributario":"MEI"}', '2023-11-10', '2024-06-30'),
('Indústria Gamma S/A', 'PJ', '45.678.901/0001-23', 'contato@gammaindustria.com.br', '(47) 93456-7890', 'active', '["Premium","Indústria","Mensal"]', '{"street":"Rod. BR-101","number":"Km 50","city":"Joinville","state":"SC","zip":"89200-000","complement":"Galpão 5"}', '{"inscricao_estadual":"456.789.012.345","inscricao_municipal":"4567890","regime_tributario":"Lucro Real"}', '2023-06-05', '2024-10-07')
ON CONFLICT DO NOTHING;

-- ===== CONTATOS =====
INSERT INTO contacts (name, email, phone, position, client_id, tags, created)
VALUES
('Carlos Eduardo Lima', 'carlos@techsolutions.com.br', '(11) 98765-4321', 'Diretor Financeiro', 1, '["Decisor"]', '2024-01-15'),
('Ana Paula Souza', 'ana@techsolutions.com.br', '(11) 97654-3210', 'Contadora', 1, '["Contato Técnico"]', '2024-01-20'),
('João Silva Oliveira', 'joao.silva@email.com', '(21) 99876-5432', 'Titular', 2, '[]', '2024-03-20'),
('Pedro Henrique Alves', 'pedro@comerciobeta.com.br', '(31) 97654-3210', 'Sócio', 3, '["Decisor","Prospect"]', '2024-08-01'),
('Roberto Mendes', 'roberto@gammaindustria.com.br', '(47) 93456-7890', 'CEO', 5, '["Decisor","Premium"]', '2023-06-05')
ON CONFLICT DO NOTHING;

-- ===== NOTAS DE CONTATO =====
INSERT INTO contact_notes (contact_id, author, content, created)
VALUES
(1, 'Equipe Contaux', 'Cliente solicitou revisão da declaração do IRPF. Agendar reunião para próxima semana.', '2024-09-28'),
(1, 'Equipe Contaux', 'Enviado proposta de renovação do contrato mensal.', '2024-09-15'),
(5, 'Equipe Contaux', 'Reunião sobre reestruturação fiscal agendada para 15/10.', '2024-10-01')
ON CONFLICT DO NOTHING;

-- ===== ATIVIDADES DE CONTATO =====
INSERT INTO contact_activities (contact_id, type, description, created)
VALUES
(1, 'email', 'Email enviado com proposta de serviços', '2024-09-15'),
(1, 'call', 'Ligação de follow-up sobre proposta', '2024-09-20'),
(5, 'meeting', 'Reunião presencial sobre planejamento tributário', '2024-10-01')
ON CONFLICT DO NOTHING;

-- ===== FATURAS =====
INSERT INTO invoices (number, client_name, issue_date, due_date, items, discount, status)
VALUES
('NF-2024-001', 'Tech Solutions LTDA', '2024-09-01', '2024-09-15', '[{"description":"Serviços contábeis mensais","quantity":1,"unit_price":2500}]', 0, 'paid'),
('NF-2024-002', 'Indústria Gamma S/A', '2024-09-05', '2024-09-20', '[{"description":"Consultoria fiscal","quantity":10,"unit_price":350}]', 500, 'sent'),
('NF-2024-003', 'João Silva Oliveira', '2024-08-20', '2024-09-05', '[{"description":"Declaração IRPF","quantity":1,"unit_price":450}]', 0, 'overdue'),
('NF-2024-004', 'Comércio Beta ME', '2024-10-01', '2024-10-15', '[{"description":"Setup contábil","quantity":1,"unit_price":1800}]', 0, 'draft'),
('NF-2024-005', 'Tech Solutions LTDA', '2024-10-01', '2024-10-15', '[{"description":"Serviços contábeis mensais","quantity":1,"unit_price":2500}]', 0, 'sent')
ON CONFLICT DO NOTHING;

-- ===== ORÇAMENTOS =====
INSERT INTO quotes (number, client_name, issue_date, valid_until, items, discount, status)
VALUES
('ORC-2024-001', 'Comércio Beta ME', '2024-09-25', '2024-10-25', '[{"description":"Pacote contábil mensal","quantity":12,"unit_price":1200}]', 0, 'sent'),
('ORC-2024-002', 'Indústria Gamma S/A', '2024-09-10', '2024-10-10', '[{"description":"Auditoria fiscal completa","quantity":1,"unit_price":15000}]', 1000, 'accepted'),
('ORC-2024-003', 'João Silva Oliveira', '2024-08-15', '2024-09-15', '[{"description":"Planejamento tributário","quantity":1,"unit_price":2000}]', 0, 'expired')
ON CONFLICT DO NOTHING;

-- ===== PAGAMENTOS =====
INSERT INTO payments (invoice_number, client_name, amount, payment_date, method, status, reference)
VALUES
('NF-2024-001', 'Tech Solutions LTDA', 2500, '2024-09-10', 'pix', 'confirmed', 'PIX-987654'),
('', 'Indústria Gamma S/A', 3000, '2024-09-18', 'transfer', 'confirmed', 'TED-12345'),
('NF-2024-003', 'João Silva Oliveira', 450, '2024-10-05', 'boleto', 'pending', '')
ON CONFLICT DO NOTHING;

-- ===== PLANO DE CONTAS =====
INSERT INTO accounts (code, name, type, parent_id, level, active)
VALUES
('1', 'Ativo', 'asset', NULL, 1, true),
('1.1', 'Ativo Circulante', 'asset', 1, 2, true),
('1.1.1', 'Caixa', 'asset', 2, 3, true),
('1.1.2', 'Bancos', 'asset', 2, 3, true),
('1.1.3', 'Clientes a Receber', 'asset', 2, 3, true),
('2', 'Passivo', 'liability', NULL, 1, true),
('2.1', 'Passivo Circulante', 'liability', 6, 2, true),
('2.1.1', 'Fornecedores', 'liability', 7, 3, true),
('3', 'Receitas', 'revenue', NULL, 1, true),
('3.1', 'Receita de Serviços', 'revenue', 9, 2, true),
('4', 'Despesas', 'expense', NULL, 1, true),
('4.1', 'Despesas Operacionais', 'expense', 11, 2, true),
('4.1.1', 'Salários', 'expense', 12, 3, true),
('4.1.2', 'Aluguel', 'expense', 12, 3, true)
ON CONFLICT (code) DO NOTHING;

-- ===== LANÇAMENTOS CONTÁBEIS =====
INSERT INTO journal_entries (date, description, reference, status, lines)
VALUES
('2026-10-01', 'Recebimento de cliente - Tech Solutions', 'NF-2024-001', 'posted', '[{"account_code":"1.1.2","account_name":"Bancos","debit":2500,"credit":0},{"account_code":"1.1.3","account_name":"Clientes a Receber","debit":0,"credit":2500}]'),
('2026-10-02', 'Pagamento de aluguel', 'DOC-001', 'posted', '[{"account_code":"4.1.2","account_name":"Aluguel","debit":3000,"credit":0},{"account_code":"1.1.2","account_name":"Bancos","debit":0,"credit":3000}]'),
('2026-10-03', 'Reconhecimento de receita de serviços', 'NF-2024-005', 'draft', '[{"account_code":"1.1.3","account_name":"Clientes a Receber","debit":2500,"credit":0},{"account_code":"3.1","account_name":"Receita de Serviços","debit":0,"credit":2500}]')
ON CONFLICT DO NOTHING;

-- ===== NOTAS FISCAIS =====
INSERT INTO tax_invoices (number, model, series, issue_date, client_name, items, taxes, total, status)
VALUES
('NFe-001-2026', '55', '1', '2026-10-01', 'Tech Solutions LTDA', '[{"description":"Serviços contábeis mensais","quantity":1,"unit_price":2500}]', '{"icms":0,"pis":0,"cofins":0,"iss":125,"irpj":0}', 2500, 'issued'),
('NFe-002-2026', '55', '1', '2026-10-03', 'Comércio Beta ME', '[{"description":"Setup contábil","quantity":1,"unit_price":1800}]', '{"icms":0,"pis":0,"cofins":0,"iss":90,"irpj":0}', 1800, 'draft')
ON CONFLICT DO NOTHING;

-- ===== OBRIGAÇÕES FISCAIS =====
INSERT INTO obligations (title, description, due_date, type, frequency, status)
VALUES
('DCTF Outubro', 'Declaração de Débitos e Créditos Tributários Federais', '2026-10-15', 'federal', 'monthly', 'pending'),
('GPS - INSS', 'Guia da Previdência Social', '2026-10-20', 'federal', 'monthly', 'pending'),
('GIA - ICMS', 'Guia de Informação do ICMS', '2026-10-10', 'state', 'monthly', 'overdue'),
('ISS - Prefeitura', 'Guia do Imposto Sobre Serviços', '2026-10-05', 'municipal', 'monthly', 'done'),
('ECD - Escrituração Contábil Digital', 'Entrega anual da ECD', '2026-12-31', 'federal', 'annual', 'pending')
ON CONFLICT DO NOTHING;

-- ===== TICKETS =====
INSERT INTO tickets (client_name, subject, description, priority, status, category, assigned_to, created_date, messages)
VALUES
('Tech Solutions LTDA', 'Dúvida sobre guia de ISS', 'Preciso de esclarecimento sobre o cálculo do ISS do mês de outubro.', 'medium', 'open', 'Fiscal', 'Ana Paula', '2026-10-05', '[{"sender":"client","content":"Preciso de esclarecimento sobre o cálculo do ISS do mês de outubro.","date":"2026-10-05T10:00:00Z"},{"sender":"agent","content":"Olá! Vamos verificar o cálculo e retornamos em breve.","date":"2026-10-05T11:00:00Z"}]'),
('João Silva Oliveira', 'Erro na declaração do IRPF', 'Identifiquei um erro na minha declaração e preciso de correção urgente.', 'urgent', 'in_progress', 'Pessoal', 'Carlos Eduardo', '2026-10-06', '[{"sender":"client","content":"Identifiquei um erro na minha declaração e preciso de correção urgente.","date":"2026-10-06T14:00:00Z"}]'),
('Comércio Beta ME', 'Solicitação de relatório gerencial', 'Gostaria de um relatório de fluxo de caixa do trimestre.', 'low', 'resolved', 'Gerencial', 'Ana Paula', '2026-09-28', '[{"sender":"client","content":"Gostaria de um relatório de fluxo de caixa do trimestre.","date":"2026-09-28T09:00:00Z"},{"sender":"agent","content":"Relatório enviado por email!","date":"2026-09-29T10:00:00Z"}]'),
('Indústria Gamma S/A', 'Dúvida sobre SPED', 'Como funciona a entrega do SPED neste mês?', 'high', 'open', 'Fiscal', '', '2026-10-07', '[]')
ON CONFLICT DO NOTHING;

-- ===== PROCESSOS JURÍDICOS =====
INSERT INTO processes (client_name, process_number, court, subject, status, start_date, lawyer, value, notes)
VALUES
('Comércio Beta ME', '1001234-56.2026.8.26.0100', '1ª Vara Cível - Manaus/AM', 'Cobrança indevida', 'active', '2026-08-15', 'Dr. Roberto Lima', 25000, 'Audiência marcada para 20/11/2026.'),
('Tech Solutions LTDA', '0805678-90.2025.8.26.0100', 'Vara do Trabalho - Manaus/AM', 'Reclamação trabalhista', 'active', '2025-11-10', 'Dra. Fernanda Souza', 45000, 'Aguardando perícia técnica.'),
('João Silva Oliveira', '0701234-12.2024.8.26.0100', '2ª Vara Cível - Manaus/AM', 'Divórcio consensual', 'concluded', '2024-03-01', 'Dr. Roberto Lima', 0, 'Sentença homologada. Caso encerrado.')
ON CONFLICT DO NOTHING;

-- ===== CAMPANHAS =====
INSERT INTO campaigns (name, channel, audience, status, start_date, end_date, metrics)
VALUES
('Campanha IRPF 2026', 'email', 'Todos os clientes PF', 'completed', '2026-02-01', '2026-03-31', '{"sent":150,"opened":98,"clicked":45,"converted":22}'),
('Promoção Setup Contábil', 'whatsapp', 'Prospects', 'running', '2026-10-01', '2026-10-31', '{"sent":80,"opened":72,"clicked":30,"converted":8}'),
('Newsletter Mensal - Outubro', 'email', 'Newsletter', 'scheduled', '2026-10-15', '2026-10-15', '{"sent":0,"opened":0,"clicked":0,"converted":0}'),
('Lembrete DCTF', 'sms', 'Clientes PJ', 'draft', NULL, NULL, '{"sent":0,"opened":0,"clicked":0,"converted":0}')
ON CONFLICT DO NOTHING;

-- ===== BLOG =====
INSERT INTO blog_posts (title, slug, excerpt, category, author, status, published_date, views)
VALUES
('Como declarar investimentos no IRPF 2026', 'como-declarar-investimentos-irpf-2026', 'Guia completo para declarar rendimentos de investimentos no Imposto de Renda.', 'Imposto de Renda', 'Ana Paula', 'published', '2026-02-15', 1250),
('Mudanças na tributação de MEIs em 2026', 'mudancas-tributacao-meis-2026', 'Saiba o que mudou para os Microempreendedores Individuais neste ano.', 'Tributação', 'Carlos Eduardo', 'published', '2026-09-20', 850),
('Planejamento tributário para o final do ano', 'planejamento-tributario-final-ano', 'Dicas de planejamento tributário para encerrar o ano com eficiência.', 'Planejamento', 'Ana Paula', 'draft', NULL, 0)
ON CONFLICT (slug) DO NOTHING;

-- ===== FIDELIDADE =====
INSERT INTO loyalty_programs (name, description, points_per_real, active, tier_thresholds, rewards)
VALUES
('Programa Contaux Premium', 'Pontos por faturas pagas', 1, true, '[{"tier":"bronze","min_points":0},{"tier":"silver","min_points":1000},{"tier":"gold","min_points":5000},{"tier":"diamond","min_points":15000}]', '[{"id":"r1","name":"Desconto de 10% na próxima fatura","points_cost":500},{"id":"r2","name":"Consultoria tributária gratuita","points_cost":3000}]')
ON CONFLICT DO NOTHING;

INSERT INTO customer_points (client_name, points_balance, tier, program_id)
VALUES
('Tech Solutions LTDA', 8500, 'gold', 1),
('João Silva Oliveira', 1200, 'silver', 1),
('Comércio Beta ME', 320, 'bronze', 1),
('Indústria Gamma S/A', 16000, 'diamond', 1)
ON CONFLICT DO NOTHING;

-- ===== USUÁRIOS =====
INSERT INTO users (name, email, role, mfa_enabled, last_login, active)
VALUES
('Administrador', 'admin@contaux.com.br', 'admin', true, '2026-10-07T18:00:00Z', true),
('Ana Paula Costa', 'ana@contaux.com.br', 'accountant', false, '2026-10-07T15:30:00Z', true),
('Carlos Eduardo Lima', 'carlos@contaux.com.br', 'manager', true, '2026-10-06T10:00:00Z', true),
('Visitante Externo', 'visitante@contaux.com.br', 'viewer', false, '2026-09-28T14:00:00Z', false)
ON CONFLICT (email) DO NOTHING;

-- ===== LOGS DE AUDITORIA =====
INSERT INTO audit_logs ("user", action, entity_type, entity_id, details, ip, timestamp)
VALUES
('admin@contaux.com.br', 'login', 'auth', '', 'Login bem-sucedido', '189.45.x.x', '2026-10-07T18:00:00Z'),
('ana@contaux.com.br', 'create', 'invoice', 'NF-2024-005', 'Fatura criada', '200.150.x.x', '2026-10-07T15:30:00Z'),
('carlos@contaux.com.br', 'update', 'client', '2', 'Cliente atualizado', '201.80.x.x', '2026-10-06T10:00:00Z'),
('admin@contaux.com.br', 'delete', 'ticket', '5', 'Ticket excluído', '189.45.x.x', '2026-10-05T09:00:00Z'),
('ana@contaux.com.br', 'export', 'report', '', 'Relatório financeiro exportado', '200.150.x.x', '2026-10-04T16:00:00Z')
ON CONFLICT DO NOTHING;

-- ===== WORKFLOWS =====
INSERT INTO workflows (name, trigger, conditions, actions, active)
VALUES
('Notificar novo ticket', 'event', '["Tipo: ticket","Status: open"]', '["Enviar email para responsável"]', true),
('Lembrete de vencimento', 'schedule', '["Fatura vence em 3 dias"]', '["Enviar email ao cliente"]', true),
('Backup semanal', 'schedule', '["Todo domingo às 02:00"]', '["Exportar dados","Enviar para storage"]', false)
ON CONFLICT DO NOTHING;

-- ===== DOCUMENTOS =====
INSERT INTO documents (name, type, category, updated)
VALUES
('Contrato de Prestação de Serviços', 'contrato', 'Templates', '2026-09-15'),
('Procuração Contábil', 'procuracao', 'Templates', '2026-08-20'),
('Termo de Responsabilidade LGPD', 'termo', 'LGPD', '2026-07-10'),
('Manual do Cliente - Onboarding', 'manual', 'Guias', '2026-10-01')
ON CONFLICT DO NOTHING;

-- ===== RELATÓRIOS =====
INSERT INTO reports (name, type, format, schedule, last_run)
VALUES
('Relatório Financeiro Mensal', 'financeiro', 'pdf', 'monthly', '2026-10-01'),
('Relatório de Clientes Ativos', 'crm', 'xlsx', 'weekly', '2026-10-06'),
('Relatório de Tickets por SLA', 'suporte', 'pdf', 'monthly', '2026-10-01'),
('Exportação Completa (LGPD)', 'sistema', 'csv', 'on-demand', '2026-09-20')
ON CONFLICT DO NOTHING;

-- ===== EMAILS =====
INSERT INTO emails ("from", "to", subject, body, received_at, read, starred, folder)
VALUES
('joao.silva@email.com', 'contato@contaux.com.br', 'Documentos para declaração de IRPF 2025', 'Olá, segue em anexo os documentos para a declaração do IRPF deste ano.', '2026-10-07T14:30:00Z', false, true, 'inbox'),
('tech.solutions@empresa.com.br', 'contato@contaux.com.br', 'Re: Fatura de serviços contábeis - Outubro', 'Recebemos a fatura NF-2024-005. O pagamento será feito via PIX até o vencimento.', '2026-10-07T10:15:00Z', false, false, 'inbox'),
('receita@sefaz.gov.br', 'contato@contaux.com.br', 'Lembrete: Entrega da DCTF - Outubro/2026', 'Prezado contribuinte, lembramos que o prazo para entrega da DCTF se encerra em 15/10.', '2026-10-06T16:00:00Z', true, false, 'inbox'),
('maria.fernanda@email.com', 'contato@contaux.com.br', 'Dúvida sobre planejamento tributário', 'Boa tarde, gostaria de agendar uma reunião para discutir estratégias de planejamento tributário.', '2026-10-05T09:45:00Z', true, true, 'inbox'),
('contato@contaux.com.br', 'joao.silva@email.com', 'Confirmação de recebimento de documentos', 'Olá João, confirmamos o recebimento dos seus documentos para a declaração do IRPF.', '2026-10-07T15:00:00Z', true, false, 'sent')
ON CONFLICT DO NOTHING;

COMMIT;
