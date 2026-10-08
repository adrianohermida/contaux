# Runbook Operacional — Assistente Contaux

Documento de operação e manutenção do Assistente Contaux, cobrindo CQ-01 a CQ-09.

## 1. Visão Geral

O Assistente Contaux é uma plataforma de comunicação workspace para gestão de atendimento multi-tenant com IA assistente, handoff humano, projetos privados e ferramentas operacionais.

### Arquitetura

```
nginx (porta 3000)
├── Site estático (HTML/CSS/JS)
├── /dashboard, /inbox, /crm... → Vite dev server (porta 5173)
└── /api/* → Express API (porta 3001)
    └── PostgreSQL (porta 5432)
```

### Componentes do Assistente

| Onda | Componente | Descrição |
|------|-----------|-----------|
| CQ-01 | Widget docked | Shell persistente (recolhido/expandido/fullscreen) |
| CQ-02 | Autorização | Isolamento multi-tenant, validação de tenant_id |
| CQ-03 | Sessão | JWT curto + refresh cookie, PIN para operações sensíveis |
| CQ-04 | Handoff | Fila de atendimento humano, participantes, eventos |
| CQ-05 | Ferramentas | 5 tools operacionais com ACL por role |
| CQ-06 | Memória/Anexos | Memória por escopo, anexos com validação MIME |
| CQ-07 | Proatividade | Sugestões automáticas com deduplicação e orçamento |
| CQ-07b | Segurança | Anexos com defense-in-depth, role server-side |
| CQ-08 | Projetos | Projetos privados com dots coloridos, membros, ACL |

## 2. Setup e Deploy

### Desenvolvimento (sandbox)

```bash
docker compose -f docker-compose.base44.yml up -d --build
```

Verificação:
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/          # 200 (site)
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/dashboard  # 200 (SPA)
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health  # 200 (API)
```

### Produção

Ver `docs/DEPLOYMENT.md` para o passo a passo completo.

Variáveis de ambiente obrigatórias (produção):
- `JWT_SECRET` — chave de assinatura JWT
- `DATABASE_URL` — string de conexão PostgreSQL
- `OPENAI_API_KEY` — para respostas em linguagem natural (opcional no sandbox)
- `SMTP_*` — para envio de email transacional
- `CLOUDFLARE_*` — para email routing e workers

## 3. Contas de Demo

| Email | Senha | Role | Tenant |
|-------|-------|------|--------|
| admin@contaux.com.br | contaux123 | superadmin | Contaux |
| contador@contaux.com.br | contaux123 | accountant | Contaux |
| admin@hermidamaia.com.br | contaux123 | admin | Hermida Maia |

## 4. Migrações

As migrações rodam automaticamente na inicialização da API (`api/migrations/index.js`).

Migrações do assistente:
- `014` — Tabelas assistant_conversations + assistant_messages
- `015` — conversation_id em tasks
- `016` — execution_log, started_at, completed_at em tasks
- `017` — status/origin/visitor, assistant_participants, event_type
- `018` — assistant_memory, assistant_attachments
- `019` — assistant_suggestions, assistant_budget, settings de proatividade
- `020` — conversation_kind em conversations
- `021` — assistant_projects, assistant_project_members, project_id em conversations

## 5. Endpoints do Assistente

### Conversas
- `GET /api/assistant/conversations` — listar (com project_color, project_name)
- `POST /api/assistant/conversations` — criar
- `GET /api/assistant/conversations/:id` — buscar com mensagens
- `DELETE /api/assistant/conversations/:id` — deletar
- `POST /api/assistant/conversations/:id/messages` — enviar mensagem (role sempre 'user')
- `PATCH /api/assistant/conversations/:id/project` — atribuir/desatribuir projeto

### Handoff (CQ-04)
- `POST /api/assistant/conversations/:id/handoff` — solicitar handoff
- `POST /api/assistant/conversations/:id/accept` — aceitar (staff)
- `POST /api/assistant/conversations/:id/close` — fechar
- `GET /api/assistant/conversations/queue` — fila de atendimento

### Ferramentas (CQ-05)
- `GET /api/assistant/tools` — listar tools disponíveis
- `POST /api/assistant/tools/execute` — executar tool (com aprovação se escrita)

### Memória e Anexos (CQ-06)
- `GET/POST/DELETE /api/assistant/memory` — CRUD de memória
- `POST /api/assistant/conversations/:id/attachments` — upload (validação MIME)
- `GET /api/assistant/conversations/:id/attachments` — listar
- `GET /api/assistant/conversations/:id/attachments/:aid` — download
- `DELETE /api/assistant/conversations/:id/attachments/:aid` — deletar

### Proatividade (CQ-07)
- `GET /api/assistant/proactive/status` — status (enabled, budget)
- `GET /api/assistant/suggestions` — listar sugestões
- `POST /api/assistant/suggestions/generate` — gerar sugestões
- `POST /api/assistant/suggestions/:id/dismiss` — dispensar
- `POST /api/assistant/suggestions/:id/act` — agir (navegar)

### Projetos (CQ-08)
- `GET /api/assistant/projects` — listar (com is_member, member_role, conversation_count)
- `POST /api/assistant/projects` — criar (name, color, visibility)
- `PATCH /api/assistant/projects/:id` — atualizar (owner only)
- `DELETE /api/assistant/projects/:id` — deletar (owner only)
- `GET /api/assistant/projects/:id/conversations` — conversas do projeto
- `GET /api/assistant/projects/:id/members` — listar membros
- `POST /api/assistant/projects/:id/members` — adicionar membro (owner only)
- `DELETE /api/assistant/projects/:id/members/:userId` — remover membro (owner only)

## 6. Segurança

### Isolamento Multi-Tenant
- Todas as queries filtram por `tenant_id` via `getAccessibleTenantIds()`
- CRUD POST valida `tenant_id` do body contra tenants autorizados (403 se forjado)
- Knowledge base filtra por `tenant_id = ANY(...) OR tenant_id IS NULL`
- Projetos usam `checkProjectAccess()` (tenant + participante)

### Autoria de Mensagens
- `POST /conversations/:id/messages` sempre define `role = 'user'` (ignora body)
- Mensagens `assistant` e `system` são criadas exclusivamente pelo servidor
- Anexos com defense-in-depth: `checkConversationAccess` + `a.tenant_id = conv.tenant_id`

### PIN de Operações Sensíveis
- DELETE em invoices, payments, journal_entries, tax_invoices exige `X-PIN-Token`
- PIN token: JWT com nonce one-time, 5 min de validade

### Kill Switch de Proatividade
- `settings.assistant_proactive_enabled = false` desliga sugestões automáticas
- `settings.assistant_budget_daily_tokens = 0` bloqueia consumo de IA
- Portal do cliente permanece funcional mesmo com proatividade desligada

## 7. Troubleshooting

### API não inicia
```bash
docker compose -f docker-compose.base44.yml logs api --tail=50
```
Causas comuns: `JWT_SECRET` ausente, banco indisponível, migração falhou.

### Widget não aparece
- Verificar `AssistantProvider` montado em `AppLayout.jsx`
- Verificar `panelMode` no localStorage (`contaux-assistant`)
- Hard refresh: limpar localStorage e recarregar

### IA responde apenas com busca textual
- `OPENAI_API_KEY` não configurada → fallback de busca textual
- Verificar orçamento: `GET /api/assistant/proactive/status`

### Handoff não aparece na fila
- Verificar `conversation_kind = 'support'` e `status = 'waiting_human'`
- Staff deve ter role admin/superadmin/accountant

### Projeto não aparece para outro usuário
- Verificar membro em `assistant_project_members`
- Verificar `visibility` (private = apenas membros, shared = tenant, internal = staff)

## 8. Plano de Rollout (CQ-09)

### Fase 1 — Piloto interno (semana 1)
- Ativar proatividade apenas para admin (kill switch em settings)
- Usar projetos privados para organizar conversas internas
- Validar handoff com 2+ atendentes simultâneos

### Fase 2 — Piloto limitado (semana 2)
- Convidar 2-3 clientes para testar chat público
- Monitorar fila de atendimento e tempo de resposta
- Verificar orçamento de tokens diário

### Fase 3 — Rollout geral (semana 3+)
- Ativar proatividade para todo staff
- Definir orçamento de tokens por usuário/dia
- Documentar fluxos de valor para treinamento

### Critérios de aceite
- [x] Zero P0 (segurança: tenant isolation, role enforcement, MIME validation)
- [x] Fluxos de valor demonstrados (conversas, handoff, ferramentas, projetos)
- [ ] Orçamento de tokens definido (configurar em settings)
- [ ] Aceite humano (piloto interno)

## 9. Regressão Automatizada

Script de regressão: `/tmp/regression_test.sh` (não commitado — recriar conforme necessário).

Cobertura: 25 testes across CQ-01 a CQ-08 (login, tenant isolation, conversas, mensagens, tools, memória, proatividade, projetos, membros, ACL cross-tenant, handoff, fila, aceitar, fechar).

Resultado última execução: **25 pass | 0 fail | 1 skip** (refresh token não testável via curl simples).
