# Ondas de Execução — Assistente Contaux

Reconciliado com PROMPT-UNIFICADO-CONTAUX.txt. Substitui o ONDAS.md do pacote de planejamento.

## Contrato comum

Executar uma onda (CQ) por invocação, na branch autorizada. PT-BR em toda UI, máximo 200 linhas por componente, mobile 373px, proibido importar legacy. Não modificar schema/auth/segredo/infraestrutura fora do escopo da onda. Em toda conclusão: listar arquivos, explicar o que funciona, registrar testes, riscos, rollback e gate seguinte.

## CQ-00 — Auditoria

**Status:** Concluída. Ver `PLANO-MESTRE.md`.

## CQ-01 — Shell docked persistente e responsivo; remover demos do runtime

**Status:** Concluída.

**Foco:** coluna direita docked no layout (não overlay), três estados (recolhido/expandido/fullscreen), responsivo desktop/tablet/mobile, conversa persistente entre rotas, remoção de fixtures do runtime, unificação do launcher duplicado.

**Arquivos:** AppLayout.jsx, AssistantProvider.jsx, AssistantWidget.jsx, AssistantPanel.jsx, ConhecimentoPage.jsx, moduleContext.js (novo).

**Implementação:**
- Três estados: recolhido (rail desktop 56px / orb mobile), expandido (painel lateral docked 420px), fullscreen (overlay em qualquer viewport).
- Persistência em localStorage (`contaux-assistant`): conversa, rascunho, modo de contexto e estado do painel sobrevivem a recarregar a página.
- Contexto explícito: módulo (nome legível da rota), contador, empresa, competência.
- Modo de contexto: "acompanhar esta tela" (segue a rota) vs "travar contexto" (congela o contexto da conversa).
- Demonstrações identificadas: três cards com borda tracejada claramente rotulados como "Demonstrações" (navegação contextual, consulta operacional, acompanhar tarefa).
- Indicadores no estado recolhido: badge de mensagens não lidas e pulso de atividade (preparando resposta).
- Safe areas no mobile: `env(safe-area-inset-*)` no orb e no fullscreen.
- Launcher duplicado já removido (ConhecimentoAssistant); assistente unificado no AppLayout.

**Testes executados (preview desktop + mobile):**
- Abrir painel a partir do rail desktop ✓
- Expandir e ver contexto (módulo, contador, empresa, competência) ✓
- Alternar modo de contexto (acompanhar ↔ travar) ✓
- Navegar de Dashboard → Financeiro e ver contexto atualizado ✓
- Tela cheia ✓
- Fechar e voltar ao estado recolhido ✓
- Mobile: orb flutuante ✓
- Mobile: painel fullscreen com safe areas ✓
- Persistência em localStorage confirmada ✓

**Gate:** dock sem sobreposição no desktop ✓; fullscreen no mobile ✓; navegação sem perda de conversa/rascunho ✓; demonstrações identificadas ✓; portal cliente intacto ✓; build registrado ✓.

## CQ-02 — Saneamento de autorização (P0)

**Status:** Concluída.

**Foco:** requireAuth em todas as rotas privadas, remoção do fallback JWT hardcoded, correção do bug mfa_enabled, projeções/campos permitidos, isolamento de knowledge_base por tenant, recursos privilegiados fora do CRUD genérico.

**Implementação:**
- `JWT_SECRET` sem fallback hardcoded — `process.exit(1)` se não definido (pré-existente, confirmado).
- requireAuth em todas as rotas privadas (pré-existente, confirmado): emailRoutes, inboxRoutes, settingsRoutes, integrationRoutes, importRoutes.
- Bug `mfa_enabled` corrigido (pré-existente) — `PATCH /api/auth/users/:id` desestrutura `mfa_enabled` do body corretamente.
- `users` fora do CRUD genérico (pré-existente) — gestão via userRoutes.js com projeção de campos (sem `password_hash`).
- **CRUD tenant_id injection corrigido** — POST agora valida `tenant_id` do body contra `getAccessibleTenantIds`; rejeita tenant não autorizado com 403.
- **knowledge_base ask com isolamento por tenant** — `aiService.searchKnowledgeBase` agora filtra por `tenant_id = ANY(...) OR tenant_id IS NULL`; endpoint `/api/knowledge-base/ask` passa `tenantIds` do usuário autenticado.

**Arquivos alterados:**
- `api/routes/crud.js` — validação de tenant_id no POST
- `api/services/aiService.js` — filtro de tenant em searchKnowledgeBase + ask aceita userContext
- `api/server.js` — endpoint ask passa tenantIds do usuário

**Testes executados (curl):**
- Criar cliente sem tenant_id → usa tenant do usuário ✓
- Criar cliente com tenant_id forjado (99999) → 403 "Tenant não autorizado" ✓
- Criar cliente com dados válidos → sucesso, tenant_id correto ✓
- Deletar registro de teste → sucesso ✓
- KB ask "LGPD" → 1 fonte (null-tenant, visível a todos) ✓
- KB ask "teste" → 0 fontes (sem match) ✓

**Gate:** tenant forjado negado ✓; credenciais protegidas ✓; P0 fechado ✓.

## CQ-03 — Identidade, PIN e sessão persistente

**Status:** Concluída.

**Foco:** challenge de PIN no servidor, sessão limitada, refresh/revogação, cookie persistente, widget público isolado.

**Implementação:**
- Login com access token curto (15min) + refresh token em cookie httpOnly (7d).
- Endpoint `/api/auth/refresh` renova access token via cookie.
- Logout revoga refresh token + incrementa `token_version` (invalida todos os tokens).
- Middleware `requirePin` valida `X-PIN-Token` (JWT com nonce de uso único, 5min).
- Endpoint `/api/auth/verify-pin` gera challenge de PIN; `/api/auth/set-pin` para auto-serviço.
- DELETE em tabelas sensíveis (invoices, payments, journal_entries, tax_invoices) exige PIN.
- Frontend: `AuthContext` restaura sessão via cookie; `api.js` faz auto-refresh em 401.
- `PinModal` (componente UI) e `PinManagementCard` (Segurança) para gestão de PIN.
- Migração 011: `pin_hash`, `token_version`, `refresh_tokens`, `pin_challenges`.

**Gate:** PIN errado/expirado/reutilizado negado ✓; reabrir navegador restaura sessão ✓; logout revoga ✓; widget isolado ✓.

## CQ-04 — Canal entre portais e atendimento humano

**Foco:** conversas persistentes, participantes, handoff IA→humano, P2P, eventos.

**Gate:** mesma conversa entre portais; autoria correta; handoff com fila real; IA pública pausada.

## CQ-05 — Ferramentas operacionais, tarefas e e-mail

**Foco:** skills de navegação, consulta, fechamento, conciliação, documentos, comunicação. Aprovações, idempotência, readback.

**Gate:** três casos de valor; cálculo validado; tool negada por ACL; custo estimado.

## CQ-06 — Memória, anexos e voz

**Foco:** memória auditável por escopo, anexos privados com ACL, voz opcional.

**Gate:** arquivo de outro tenant negado; memória cruzada inexistente; MIME falso bloqueado.

## CQ-07 — Proatividade interna limitada

**Foco:** sugestões internas, deduplicação, orçamento, kill switch.

**Gate:** evento duplicado não repete; orçamento bloqueia; kill switch mantém portal.

## CQ-08 — QA ponta a ponta e piloto

**Foco:** regressão, testes E2E, documentação operacional, runbook, plano de rollout.

**Gate:** zero P0; fluxos de valor demonstrados; orçamento definido; aceite humano.
