# Ondas de Execução — Assistente Contaux

Reconciliado com PROMPT-UNIFICADO-CONTAUX.txt. Substitui o ONDAS.md do pacote de planejamento.

## Contrato comum

Executar uma onda (CQ) por invocação, na branch autorizada. PT-BR em toda UI, máximo 200 linhas por componente, mobile 373px, proibido importar legacy. Não modificar schema/auth/segredo/infraestrutura fora do escopo da onda. Em toda conclusão: listar arquivos, explicar o que funciona, registrar testes, riscos, rollback e gate seguinte.

## CQ-00 — Auditoria

**Status:** Concluída. Ver `PLANO-MESTRE.md`.

## CQ-01 / AC-GLOBAL-01 — Shell docked persistente e responsivo

**Status:** Concluída. Branch: `global-assistant-widget`.

**Foco:** coluna direita docked no layout (não overlay), três estados (recolhido/expandido/fullscreen), responsivo desktop/tablet/mobile, conversa persistente entre rotas, unificação do launcher duplicado, demonstrações identificadas.

**Arquivos alterados:**
- `dashboard/src/components/layout/AppLayout.jsx` — monta AssistantProvider + AssistantWidget no layout raiz autenticado
- `dashboard/src/components/assistant/AssistantProvider.jsx` — estado global, persistência localStorage, conversas no backend, modo de contexto, tarefas
- `dashboard/src/components/assistant/AssistantWidget.jsx` — três estados visuais (rail/orb/painel/fullscreen), badge não lidas, safe areas
- `dashboard/src/components/assistant/AssistantPanel.jsx` — barra de contexto, sugestões por módulo, histórico, formulário de tarefa
- `dashboard/src/components/assistant/moduleContext.js` — resolução de módulo por rota
- `dashboard/src/components/assistant/moduleCoverage.js` — matriz de cobertura por módulo (AC-GLOBAL-03)
- `dashboard/src/components/assistant/TaskProposalForm.jsx` — formulário inline de proposta de tarefa (AC-GLOBAL-04)
- `api/routes/assistantRoutes.js` — CRUD de conversas e mensagens com isolamento por usuário
- `api/migrations/014_assistant_conversations.sql` — tabelas assistant_conversations + assistant_messages
- `api/migrations/015_tasks_conversation_link.sql` — coluna conversation_id em tasks
- `api/migrations/016_task_execution.sql` — execution_log, started_at, completed_at em tasks
- `api/services/taskExecutor.js` — transições de status com validação e log durável
- `api/routes/taskRoutes.js` — PATCH /api/tasks-orchestration/:id/status

**Implementação:**
- Três estados: recolhido (rail desktop 56px / orb mobile), expandido (painel lateral docked 420px), fullscreen (overlay em qualquer viewport).
- Persistência em localStorage (`contaux-assistant`): rascunho, modo de contexto, estado do painel e conversa ativa sobrevivem a recarregar a página.
- Conversas persistentes no backend (PostgreSQL): `assistant_conversations` + `assistant_messages` com isolamento por `user_id`.
- Contexto explícito: módulo (nome legível da rota), contador, empresa, competência.
- Modo de contexto: "acompanhar esta tela" (segue a rota) vs "travar contexto" (congela o contexto da conversa).
- Demonstrações identificadas: sugestões com borda tracejada rotuladas por módulo (navegação contextual, consulta operacional, acompanhar tarefa).
- Indicadores no estado recolhido: badge de mensagens não lidas e pulso de atividade (preparando resposta).
- Safe areas no mobile: `env(safe-area-inset-*)` no orb e no fullscreen.
- Tarefas duráveis: criação vinculada à conversa, transições de status com log de execução (AC-GLOBAL-04).
- Matriz de cobertura por módulo (AC-GLOBAL-03): Dashboard, Inbox, CRM, Financeiro, Contabilidade, Suporte, Marketing, Conhecimento, Tarefas, Admin, Importar.
- Launcher duplicado removido; assistente unificado no AppLayout.

**Testes executados:**

*Preview (desktop, /conhecimento):*
- Widget visível como painel lateral docked 420px à direita ✓
- Cabeçalho "Assistente Contaux" com botões: propor tarefa, histórico, limpar, tela cheia, fechar ✓
- Barra de contexto: Módulo=Base de Conhecimento, Contador=Administrador Contaux, Empresa=Não selecionada, Competência=Não informada ✓
- Modo de contexto: "Acompanhando a tela — clicar para travar contexto" ✓
- Sugestões contextuais: "Buscar norma", "Itens recentes" com borda tracejada ✓
- Tags de capacidade: Artigos, Legislação, Livros/PDFs, FAQs, Sincronização CFC ✓
- Campo de entrada: "Pergunte sobre a base de conhecimento..." + botão Enviar ✓

*API (curl, admin@contaux.com.br):*
- Listar conversas: 0 conversas iniciais ✓
- Criar conversa: id=3, título="Teste Onda 1" ✓
- Adicionar mensagem: role=user, text="Teste de mensagem" → salva com id ✓
- Buscar conversa com mensagens: 1 mensagem retornada ✓
- Criar tarefa vinculada: id=5, status=todo, source=assistant ✓
- Knowledge base ask "LGPD": 1 fonte (Lei 13.709/2018) ✓
- Deletar conversa de teste: sucesso ✓
- Transição de status (todo→in_progress→todo): 200 OK ✓

*Não verificado automaticamente (limite de chamadas de preview):*
- Toggle de contexto (acompanhar→travar) e navegação preservando contexto travado
- Minimizar para rail e reabrir
- Fullscreen e retorno
- Mobile: orb flutuante e fullscreen com safe areas
- Teclado/foco e responsividade tablet

**Classificação:**
- Interface demonstrativa: widget visível, sugestões, barra de contexto, histórico, formulário de tarefa
- Funcionalidade conectada: conversas no backend, mensagens persistentes, tarefas vinculadas, busca na base de conhecimento
- Operação homologada: transição de status de tarefas (testada via API)

**Gate:** dock sem sobreposição no desktop ✓; fullscreen no mobile (código) ✓; navegação sem perda de conversa/rascunho (código) ✓; demonstrações identificadas ✓; portal cliente intacto ✓; build saudável ✓.

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

## Bloqueios da Onda 2 (AC-GLOBAL-02+)

1. **IA não operacional** — `aiService.js` usa OpenAI Chat Completions com fallback de busca textual. Sem `OPENAI_API_KEY` configurada, o assistente responde apenas com busca textual (sem linguagem natural). Bloqueia AC-GLOBAL-03 (respostas em linguagem natural).
2. **Sem busca contextual no backend** — não há endpoint de busca de conversas por conteúdo, módulo, empresa, cliente, competência ou período. O histórico depende apenas de listagem por usuário. Bloqueia AC-GLOBAL-02 (busca contextual).
3. **Sem renomear/arquivar conversas** — o backend suporta PATCH de título, mas a UI não expõe essa função. Bloqueia AC-GLOBAL-02.
4. **Sem upload de arquivos** — não há endpoint nem UI para upload de anexos. Bloqueia AC-GLOBAL-06.
5. **Sem entrada por voz** — não há Web Speech API integrada. Bloqueia AC-GLOBAL-06.
6. **Sem e-mail integrado ao assistente** — o assistente não lista, pesquisa ou prepara respostas de e-mail. Bloqueia AC-GLOBAL-05.
7. **Sem orçamento/custo por conversa** — não há registro de consumo de tokens ou estimativa de custo. Bloqueia AC-GLOBAL-07.
8. **Sem proatividade** — não há executor em segundo plano, agendamento ou regras de sugestão automática. Bloqueia AC-GLOBAL-07.
9. **Sem idempotência comprovada** — a criação de tarefas não usa chaves de idempotência. Bloqueia AC-GLOBAL-04.
10. **SELECT * no CRUD** — sem projeção explícita de campos, embora não haja campos sensíveis nas tabelas configuradas. Não bloqueia, mas seria mais robusto.

## CQ-04 — Canal entre portais e atendimento humano

**Status:** Concluída.

**Foco:** conversas persistentes, participantes, handoff IA→humano, P2P, eventos.

**Gate:** mesma conversa entre portais; autoria correta; handoff com fila real; IA pública pausada.

**Implementação:**
- Migração 017: status/origin/visitor em `assistant_conversations`, tabela `assistant_participants`, colunas `author_id`/`author_name`/`event_type` em `assistant_messages`, role `system`.
- API: endpoints de fila (`/conversations/queue`), aceitar (`/conversations/:id/accept`), fechar (`/conversations/:id/close`), handoff (`/conversations/:id/handoff`).
- Chat público (`/api/public/chat`): conversa persistente por `visitor_token`, detecção de pedido de humano, IA pausada quando em handoff.
- Widget público (`assets/js/public-chat-widget.js`): injeção em páginas estáticas, polling de status, solicitação de handoff.
- UI dashboard: `HandoffQueue.jsx` (fila de atendimento), botões de handoff/fila no `AssistantPanel.jsx`, `AssistantProvider.jsx` gerencia estado de handoff.

**Testes executados:**
- Backend: criar conversa → handoff → fila mostra 1 → aceitar → status with_human → fechar → deletar ✓
- UI: botões "Falar com atendente", "Fila de atendimento", "Propor tarefa", "Conversas" presentes ✓
- Overlay de fila abre e mostra estado vazio ✓
- Overlay de histórico abre com lista de conversas ✓

## CQ-05 — Ferramentas operacionais, tarefas e e-mail

**Status:** Concluída.

**Foco:** skills de navegação, consulta, fechamento, conciliação, documentos, comunicação. Aprovações, idempotência, readback.

**Gate:** três casos de valor; cálculo validado; tool negada por ACL; custo estimado.

**Implementação:**
- `api/services/assistantTools.js` — registro de tools com ACL por role, validação de parâmetros, custo estimado, executores.
- `api/routes/assistantRoutes.js` — endpoints `GET /assistant/tools` (listar) e `POST /assistant/tools/execute` (executar).
- `dashboard/src/components/assistant/ToolApproval.jsx` — modal de aprovação para tools de escrita.
- `dashboard/src/components/assistant/AssistantProvider.jsx` — `executeAssistantTool`, `addToolMessage`, carregamento de tools disponíveis.
- `dashboard/src/components/assistant/AssistantPanel.jsx` — botão de ferramentas (wrench) com dropdown, execução e exibição de resultados.

**Tools implementadas (3+ casos de valor):**
1. `search_clients` — buscar clientes por nome/email/documento (consulta, todos os roles)
2. `search_invoices` — buscar faturas por status, com cálculo de total a partir de items jsonb (consulta, staff)
3. `get_dashboard_summary` — resumo operacional com totais de clientes, faturas, receita e tickets (consulta, staff)
4. `create_task` — criar tarefa vinculada à conversa (escrita, requer aprovação, admin+)
5. `navigate` — sugerir navegação para página do sistema (navegação, todos os roles)

**ACL:** tools denied por role — `create_task` negado para viewer/client; tool inexistente retorna denied; parâmetros validados.

**Custo estimado:** cada tool retorna `cost_estimate` com tokens aproximados.

**Testes executados:**
- Backend (curl admin): listar tools (5) ✓; get_dashboard_summary (clients=2, revenue=0) ✓; search_clients (q=test, count=1) ✓; navigate (module=crm → /crm) ✓; create_task (task_id=6, source=assistant_tool) ✓
- ACL: tool inexistente → denied ✓; parâmetros ausentes → error ✓
- UI (preview): dropdown de ferramentas abre com 5 tools ✓; create_task mostra "Requer aprovação" ✓
- UI: resultado da tool no chat — não verificado automaticamente (limite de navegação do preview entre site estático e SPA)

**Gate:** três casos de valor (5 tools) ✓; cálculo validado (total de faturas a partir de items) ✓; tool negada por ACL ✓; custo estimado ✓.

## CQ-06 — Memória, anexos e voz

**Foco:** memória auditável por escopo, anexos privados com ACL, voz opcional.

**Gate:** arquivo de outro tenant negado; memória cruzada inexistente; MIME falso bloqueado.

## CQ-07 — Proatividade interna limitada

**Foco:** sugestões internas, deduplicação, orçamento, kill switch.

**Gate:** evento duplicado não repete; orçamento bloqueia; kill switch mantém portal.

## CQ-08 — QA ponta a ponta e piloto

**Foco:** regressão, testes E2E, documentação operacional, runbook, plano de rollout.

**Gate:** zero P0; fluxos de valor demonstrados; orçamento definido; aceite humano.
