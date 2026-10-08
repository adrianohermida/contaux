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

## CQ-01 — Shell docked persistente e responsivo

**Status:** Concluída. Branch: `global-assistant-widget`.

### Implementação

| Item | Estado |
|---|---|
| Três estados (recolhido/expandido/fullscreen) | Implementado |
| Rail desktop 56px (recolhido) sem sobreposição | Implementado |
| Painel lateral docked 420px (expandido) | Implementado |
| Fullscreen overlay em qualquer viewport | Implementado |
| Orb flutuante mobile (recolhido) | Implementado |
| Painel fullscreen mobile com safe areas | Implementado |
| Persistência em localStorage (conversa, rascunho, modo, estado) | Implementado |
| Contexto explícito (módulo, contador, empresa, competência) | Implementado |
| Modo de contexto (acompanhar tela ↔ travar contexto) | Implementado |
| Demonstrações identificadas (3 cards tracejados) | Implementado |
| Badge de não lidas + indicador de atividade no recolhido | Implementado |
| Launcher duplicado removido | Já removido (pré-CQ-01) |

### Arquivos alterados

- `dashboard/src/components/assistant/moduleContext.js` (novo) — resolução de módulo por rota + demonstrações
- `dashboard/src/components/assistant/AssistantProvider.jsx` — persistência, modo de contexto, não lidas, resolução de módulo
- `dashboard/src/components/assistant/AssistantWidget.jsx` — badge de não lidas, indicador de atividade, safe areas
- `dashboard/src/components/assistant/AssistantPanel.jsx` — barra de contexto com modo, demonstrações, safe areas
- `ONDAS.md` — CQ-01 marcada como concluída; bloqueios da Onda 2 documentados

### Testes executados (preview)

- Abrir painel a partir do rail desktop ✓
- Ver contexto (módulo, contador, empresa, competência) ✓
- Alternar modo de contexto (acompanhar ↔ travar) ✓
- Navegar Dashboard → Financeiro: contexto atualizado, conversa preservada ✓
- Tela cheia ✓
- Fechar e voltar ao recolhido ✓
- Mobile: orb flutuante ✓
- Mobile: painel fullscreen com safe areas ✓
- Persistência em localStorage confirmada ✓

### Bloqueios da Onda 2 (CQ-02 / AC-GLOBAL-02+)

1. **Rotas sem requireAuth** — `/api/email/*`, `/api/inbox/*`, `/api/settings/*`, `/api/integration/offices*` permitem acesso não autenticado. O assistente não pode buscar e-mails, configurações ou integrações sem autorização comprovada.
2. **knowledge_base sem isolamento por tenant** — `noTenant: true` na configuração do CRUD. Buscas do assistente vazariam dados entre empresas.
3. **CRUD genérico aceita tenant_id do corpo** — risco de injeção de tenant em criações/edições propostas pelo assistente.
4. **JWT_SECRET com fallback hardcoded** — tokens forjáveis se o fallback estiver ativo.
5. **Bug mfa_enabled** — `ReferenceError` em `PATCH /api/auth/users/:id` impede gestão de usuários.
6. **IA não comprovada** — `aiService.js` tenta bridge LLM via Base44 com fallback PostgreSQL `configured: false`. Sem IA operacional, o assistente não responde além da base de conhecimento.
7. **Sem endpoints de conversas** — não há persistência de conversas no backend; o histórico depende apenas de localStorage (não sobrevive a logout ou troca de dispositivo).
8. **Sem mecanismo de tarefas duráveis** — não há fila ou executor para tarefas propostas pelo assistente.

## CQ-02 — Saneamento de autorização (P0)

**Status:** Concluída. Branch: `global-assistant-widget`.

### Achados — já corrigidos antes desta onda

| Achado do CQ-00 | Estado real |
|---|---|
| JWT_SECRET com fallback hardcoded | Corrigido — `process.exit(1)` se ausente |
| Rotas sem requireAuth | Corrigido — todas as rotas privadas têm auth |
| Bug mfa_enabled (ReferenceError) | Corrigido — desestruturação correta em userRoutes.js |
| users no CRUD genérico | Corrigido — users fora do crudConfig, gestão via userRoutes.js |
| knowledge_base com noTenant: true | Corrigido — usa `includeNullTenant: true` (isolado + compartilhados) |

### Corrigidos nesta onda

| Item | Arquivo | Correção |
|---|---|---|
| CRUD aceita tenant_id do body sem validação | `api/routes/crud.js` | POST valida tenant_id contra `getAccessibleTenantIds`; rejeita com 403 |
| KB ask sem filtro de tenant | `api/services/aiService.js` | `searchKnowledgeBase` agora filtra por `tenant_id = ANY(...) OR tenant_id IS NULL` |
| Endpoint ask sem contexto de usuário | `api/server.js` | Passa `tenantIds` do usuário autenticado para `aiService.ask` |

### Testes executados (curl)

- Tenant forjado (99999) → 403 "Tenant não autorizado" ✓
- Criação válida → tenant_id do usuário aplicado ✓
- KB ask "LGPD" → 1 fonte compartilhada (null-tenant) ✓
- KB ask "teste" → 0 fontes (sem match) ✓
- Delete de registro de teste → sucesso ✓

### Bloqueios remanescentes (não-P0, para ondas futuras)

- **IA não comprovada** — `aiService.js` tenta LLM via Base44 com fallback `configured: false`. Sem LLM operacional, o assistente responde apenas com busca textual.
- **Sem endpoints de conversas no backend** — histórico depende apenas de localStorage (CQ-04).
- **Sem mecanismo de tarefas duráveis** — sem fila/executor (CQ-05).
- **SELECT * no CRUD** — sem campos sensíveis nas tabelas configuradas, mas projeção explícita seria mais robusto.
