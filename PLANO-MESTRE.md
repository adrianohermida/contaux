# Plano-Mestre do Assistente Contaux

Data: 8 de outubro de 2026. Branch: `fix-main-2bf6db53fad0`, revisão `195f6b1b01`. App: `6ac662d96e17daa6cc43b266`. Ambiente: Docker compose (nginx → Vite + Express + PostgreSQL), preview na porta 3000. Não publicado.

## CQ-00 — Auditoria da versão efetivamente em uso

### Ambiente confirmado

| Item | Valor |
|---|---|
| App | 6ac662d96e17daa6cc43b266 |
| Branch | fix-main-2bf6db53fad0 |
| Revisão | 195f6b1b01d22c2427107bfffae516203a2291cb |
| Stack | React 18 + Vite 5 + Tailwind 3 (dashboard) / Express + PostgreSQL (API) |
| Preview | Porta 3000, todos os containers saudáveis |
| Publicado | Não |

### Achados confirmados

**Shell do assistente (branch, não na main):**
- `dashboard/src/components/assistant/` contém Provider, Widget, Panel, Messages e fixtures.
- Provider mantém mensagens em memória e simula respostas com `setTimeout` + fixtures — confirmado.
- Widget usa `<aside className="fixed ... lg:w-[420px]">` — sobreposição, não coluna docked. Backdrop mobile com `bg-black/40`. Confirmado.
- AppLayout monta `<AssistantProvider>` + `<AssistantWidget>` apenas para staff. PortalLayout não monta. Confirmado.
- ConhecimentoAssistant em `ConhecimentoPage.jsx` é um launcher separado que chama `/api/knowledge-base/ask`. Duplicação de launcher confirmada.

**Auth e sessão:**
- JWT em `localStorage` (`contaux-token`, `contaux-user`), expira em 7 dias. `fetchMe` desloga em qualquer erro. `api.js` limpa auth em 401. Confirmado.
- `JWT_SECRET = process.env.JWT_SECRET || 'contaux-dev-secret-change-me'` — fallback hardcoded em `api/middleware/auth.js:8`. Produção deve falhar fechada. Confirmado.
- Sem endpoints de PIN/OTP, refresh, conversas ou handoff. Confirmado.
- `PATCH /api/auth/users/:id` referencia `mfa_enabled` na linha 185 sem desestruturar do `req.body` na linha 176 — `ReferenceError` confirmada.

**CRUD e autorização:**
- CRUD usa `SELECT *`, aceita `tenant_id` do corpo em POST, inclui tabela `users` no CRUD genérico. Confirmado.
- `knowledge_base` tem `noTenant: true` — sem isolamento por tenant. Confirmado.
- Rotas sem `requireAuth` confirmadas: `/api/email/*`, `/api/inbox/*`, `/api/settings/*`, `/api/integration/offices*` e rotas administrativas de integração. `importRoutes` também sem auth.

**IA:**
- `aiService.js` tenta bridge LLM via função `aiAsk` (Base44), fallback PostgreSQL com `configured: false`. Deploy não comprovado.
- `/api/knowledge-base/ask` chama o serviço sem contexto de usuário/tenant. Busca não filtra tenant/visibilidade. Interface ignora `configured`. Confirmado.

### CQ-03 — Identidade, PIN e sessão persistente

**Status:** Concluída.

| Item | Estado |
|---|---|
| Access token curto (15min) + refresh cookie httpOnly (7d) | Implementado |
| `/api/auth/refresh` renova access token | Implementado |
| Logout revoga refresh + incrementa token_version | Implementado |
| `requirePin` middleware (X-PIN-Token, nonce one-time, 5min) | Implementado |
| `/api/auth/verify-pin` + `/api/auth/set-pin` | Implementado |
| DELETE sensível (invoices, payments, journal_entries, tax_invoices) exige PIN | Implementado |
| Frontend: AuthContext restaura sessão via cookie | Implementado |
| Frontend: api.js auto-refresh em 401 | Implementado |
| PinModal + PinManagementCard | Implementado |
| Migração 011 (pin_hash, token_version, refresh_tokens, pin_challenges) | Aplicada |

**Arquivos novos/alterados:**
- `api/middleware/pin.js` (novo)
- `api/routes/authRoutes.js` (+set-pin, +verify-pin)
- `api/routes/crud.js` (pinProtectedDelete)
- `api/server.js` (crudConfig com pinProtectedDelete)
- `dashboard/src/components/ui/PinModal.jsx` (novo)
- `dashboard/src/modules/admin/PinManagementCard.jsx` (novo)
- `dashboard/src/modules/admin/SegurancaPage.jsx` (+PinManagementCard)
- `dashboard/src/lib/api.js` (+pinDelete)
- `dashboard/src/context/AuthContext.jsx` (cookie-based refresh)

**Gate:** PIN errado/expirado/reutilizado negado ✓; reabrir navegador restaura sessão ✓; logout revoga ✓; widget isolado ✓.

### Classificação

| Achado | Status |
|---|---|
| Shell com fixtures em memória | Confirmado — corrigido em CQ-01 |
| Widget overlay em vez de docked | Confirmado — corrigido em CQ-01 |
| Launcher duplicado (ConhecimentoAssistant) | Confirmado — corrigido em CQ-01 |
| JWT_SECRET com fallback hardcoded | Confirmado — bloqueador P0 (CQ-02) |
| mfa_enabled não desestruturado | Confirmado — bug, bloqueador (CQ-02) |
| Rotas sem requireAuth | Confirmado — bloqueador P0 (CQ-02) |
| CRUD SELECT * + users no genérico | Confirmado — bloqueador P0 (CQ-02) |
| knowledge_base sem isolamento tenant | Confirmado — bloqueador P0 (CQ-02) |
| IA não comprovada | Confirmado — gate para CQ-03+ |
| PIN/OTP/conversas inexistentes | Confirmado — CQ-03+ |
| Sessão sem refresh | Confirmado — CQ-03 |

### Rollback

CQ-01: remover a coluna docked do AppLayout e restaurar `<AssistantWidget />` como overlay fixo. Reverter `AssistantProvider` para `isOpen` boolean. Reimportar `ConhecimentoAssistant` em `ConhecimentoPage`. Nenhuma migração de banco envolvida.
