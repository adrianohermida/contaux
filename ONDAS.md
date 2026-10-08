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

## CQ-02 — Saneamento de autorização (P0) — BLOQUEADORES DA ONDA 2

**Status:** Pendente. Bloqueia AC-GLOBAL-02 (histórico, busca e isolamento de contexto) e AC-GLOBAL-03 (matriz de módulos e ferramentas de leitura autorizada).

**Foco:** requireAuth em todas as rotas privadas, remoção do fallback JWT hardcoded, correção do bug mfa_enabled, projeções/campos permitidos, isolamento de knowledge_base por tenant, recursos privilegiados fora do CRUD genérico.

**Bloqueios específicos para a Onda 2 do assistente:**
- Rotas sem requireAuth (`/api/email/*`, `/api/inbox/*`, `/api/settings/*`, `/api/integration/offices*`) permitem acesso não autenticado — qualquer busca do assistente por e-mails, configurações ou integrações seria acessível sem autorização.
- `knowledge_base` tem `noTenant: true` — sem isolamento por tenant. O assistente não pode buscar na base de conhecimento sem vazar dados entre empresas.
- CRUD genérico aceita `tenant_id` do corpo em POST e inclui tabela `users` — o assistente não pode propor criação/edição sem risco de injeção de tenant.
- `JWT_SECRET` com fallback hardcoded — tokens podem ser forjados se o fallback estiver ativo em produção.
- Bug `mfa_enabled` (ReferenceError) em `PATCH /api/auth/users/:id` impede gestão de usuários pelo assistente.

**Gate:** testes negativos de dois tenants e papéis; tenant forjado negado; credenciais protegidas; P0 fechado.

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
