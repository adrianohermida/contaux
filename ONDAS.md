# Ondas de Execução — Assistente Contaux

Reconciliado com PROMPT-UNIFICADO-CONTAUX.txt. Substitui o ONDAS.md do pacote de planejamento.

## Contrato comum

Executar uma onda (CQ) por invocação, na branch autorizada. PT-BR em toda UI, máximo 200 linhas por componente, mobile 373px, proibido importar legacy. Não modificar schema/auth/segredo/infraestrutura fora do escopo da onda. Em toda conclusão: listar arquivos, explicar o que funciona, registrar testes, riscos, rollback e gate seguinte.

## CQ-00 — Auditoria

**Status:** Concluída. Ver `PLANO-MESTRE.md`.

## CQ-01 — Shell docked persistente e responsivo; remover demos do runtime

**Foco:** coluna direita docked no layout (não overlay), três estados (recolhido/expandido/fullscreen), responsivo desktop/tablet/mobile, conversa persistente entre rotas, remoção de fixtures do runtime, unificação do launcher duplicado.

**Arquivos:** AppLayout.jsx, AssistantProvider.jsx, AssistantWidget.jsx, AssistantPanel.jsx, ConhecimentoPage.jsx.

**Gate:** dock sem sobreposição no desktop; fullscreen no mobile; navegação sem perda de conversa/rascunho; nenhuma resposta simulada no runtime; portal cliente intacto; build registrado.

## CQ-02 — Saneamento de autorização (P0)

**Foco:** requireAuth em todas as rotas privadas, remoção do fallback JWT hardcoded, correção do bug mfa_enabled, projeções/campos permitidos, isolamento de knowledge_base por tenant, recursos privilegiados fora do CRUD genérico.

**Gate:** testes negativos de dois tenants e papéis; tenant forjado negado; credenciais protegidas; P0 fechado.

## CQ-03 — Identidade, PIN e sessão persistente

**Foco:** challenge de PIN no servidor, sessão limitada, refresh/revogação, cookie persistente, widget público isolado.

**Gate:** PIN errado/expirado/reutilizado negado; reabrir navegador restaura sessão; logout revoga; widget isolado.

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
