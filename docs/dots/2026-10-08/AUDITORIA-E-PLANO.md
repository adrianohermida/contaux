# DOTS instalável — auditoria Contaux/HMADV e plano PKG-0

Data: 08/10/2026. Registro documental da inspeção estática e preparação de empacotamento. Não altera runtime, autenticação, permissões, dados operacionais ou publicação.

## Estado reconciliado

Contaux app 6ac662d96e17daa6cc43b266: global-assistant-widget (6ac7ac76d960d69f4f12bdc2) foi integrada e está merged/read-only. Nenhum arquivo foi gravado nela. A main foi relida: provider605linhas/widget102linhas, PortalLayout cliente ainda sem assistente. Branch atual inspecionada: fullscreen-chat-layout (6ac7cb032e2fc18d7f53191d).

HMADV app 6a922f5b2b48868a43a6f5cd: main. Relatório detalhado salvo no mesmo caminho docs/dots/2026-10-08/AUDITORIA-E-PLANO.md. Não houve obtenção de SHA imutável do conjunto de leituras sequenciais nem validação da versão pública.

## Conclusão de arquitetura

Reaproveitar o shell e o fullscreen mais enxutos do Contaux e os contratos de agentes, atendimento e Builder do HMADV. Extrair um módulo DOTS com núcleo independente, adaptadores por host e pacotes de domínio. Não copiar os aplicativos inteiros, não criar outra engine de conversa, identidade ou carteira.

O Contaux preserva React/dashboard, Express/api, PostgreSQL e auth JWT própria. O HMADV preserva Base44 entities/functions/agents, Builder registries, Extension Loader e instalações existentes. JWT Contaux não é identidade Base44. Mesmo e-mail entre apps não concede acesso.

Compartilhar código não compartilha clientes, históricos, credenciais ou bancos. Dentro de um app, portais veem projeções autorizadas do atendimento. Conversa privada de IA pode manter sua authority separada, ligada por referência e handoff; nunca copiar automaticamente conteúdo interno ao cliente. Federação entre apps é capacidade adicional com concessão explícita.

## Avanços a preservar

Contaux main/global: Provider acima de Outlet; rail48px/dock360px/fullscreen; arquivos de histórico/backend, participantes, tarefas, fila, tools, memória, anexos, ditado e sugestões. A main ainda envia somente question à Base de Conhecimento; sugestões por 11 módulos não são prova de 11 integrações operacionais. Há cinco executores em assistantTools. taskExecutor altera status/log, não comprova efeito durável.

Esta branch fullscreen já contém:
- FullscreenWorkspace com coluna esquerda e centro, alternância lista/conversa mobile.
- ConversationSidebar: Nova conversa, busca, Projetos, IA, Atendimentos e Dots.
- DotEditor: nome, descrição, instruções e cor.
- CRUD de projetos/Dots no provider e nas rotas.
- sendMessage com conversation_id/dot_id; backend passa histórico e prompt e persiste a resposta.
- Fila com tenant e aceite condicionado a tenant/status; POST de mensagens fixa role=user.

Esses avanços são confirmados em código, não em testes/migrations/runtime. Não reconstruir outro fullscreen. No HMADV já existem esfera AssistantOrb, gatilho Orbe, Beatriz contextual e ClientCidaDock com SurfaceRuntime; a velha conclusão de que Cida era somente link de ajuda está superada em source. A surface client.help.assistant ainda consta published:false no pack e Orbe é ocultado no BuilderPreview. Não abrir autorização para corrigir apresentação.

## Bloqueios antes de empacotar ou integrar

### Novos nesta branch

C-12/P0: api/server.js:134-225 lê histórico e grava mensagens pelo conversation_id recebido, sem verificar nesse caminho usuário participante/dono/tenant e estado humano da conversa. O filtro tenant do Dot não autoriza a conversa. Resolver conversa canônica autorizada antes de ler histórico, chamar IA ou escrever; derivar Dot do vínculo governado e revalidar audiência/estado; erros não revelam conversa estrangeira. Sem exploração nesta auditoria.

C-13/P1: FullscreenWorkspace só exibe chat mobile quando activeConvId existe. Nova conversa e seleção de Dot limpam o ID e definem mobileView=conversation; o compositor permanece oculto com ID nulo. Criar estado explícito de rascunho de nova conversa e testar, sem materializar registro remoto apenas para abrir a UI.

C-14/P1: histórico comentado como últimas20 usa ORDER BY created_at ASC LIMIT20: seleciona primeiras20. Corrigir janela recente com desempate e limite de tokens, depois de autorização.

C-15/P1: aceite tem UPDATE condicionado, mas inclusão do participante e evento não está na mesma transação. No erro, busca de status por ID sem tenant pode distinguir existência/estado estrangeiro. Corrigir transação/recibo e resposta sem vazamento.

### Herdados a reavaliar, sem alegar ausência das correções já feitas

A main observada ainda tem fila sem tenant e autoria enviada pelo navegador; esta branch corrige esses trechos. Não listar C-01/C-02 como inexistência de proteção nessa branch. Ainda é preciso testar todos os caminhos.

C-03/P0: requiresApproval é metadata; no executor lido não há consumo de aprovação persistida. Validar ação/payload/recurso/versão e ACL do conversation_id.
C-04/P0: chave localStorage global contaux-assistant contém draft e lockedContext; isolar por app/tenant/usuário/audiência e invalidar respostas de escopo anterior.
C-06/P1: expanded monta dois painéis desktop/mobile CSS-hidden; extrair uma árvore de apresentação e ciclo de efeitos.
C-07/P1: prompts de módulo não bastam; intenção -> ferramenta -> serviço -> permissão -> confirmação -> resultado/recibo.
C-08/P1: lista/histórico precisam paginação real e participação autorizada.
C-09/P0: taskExecutor lido admite tenant_id IS NULL e atualização sem comparar estado anterior; não promover a executor genérico sem escopo/CAS.
C-10/P1: aiService vazio/sem tenant cai para busca não filtrada; fonte pública precisa contrato específico, não fallback.
C-11/P1: tokens estimados não são consumo real; preserve serviço de créditos e reconciliação.

HMADV H-01/H-02: userIdentityProtectionContract UNCONFIRMED; Orbe dispatch:false. São dependências de execução a comprovar, nunca flags para habilitar por conveniência. H-03/H-04: continuidade de widget/workspace/Cida e publicação de surface devem ser testadas. H-05: myInstallationsProjection converte erro em [] e ausência em zero, exigindo semântica unknown/error para saúde DOTS.

## Estrutura do pacote e instalação

Um pacote versionado proposto @hmadv/dots (não publicado), com contracts, shell, copilot, channels, agents, orchestration, adapters/base44, adapters/express-postgres e packs/legal + accounting.

Core não conhece request Contaux, AuthContext HMADV, base44Client, tabelas jurídicas ou rotas de negócio. Adapter injeta portas canônicas. Pactos de cliente/funcionário/parceiro/público continuam distintos. Instalação e licenciamento não concedem autorização de dados.

Uma sessão/store por identidade e uma árvore: recolhido -> dock no layout -> fullscreen/workspace, com histórico/rascunho/anexos/cursor preservados ao navegar. Lista esquerda separa conversas privadas, atendimento, projetos e agentes. Ditado não é chamada realtime; voz/câmera/custos exigem capacidades e consentimentos reais.

Instalador futuro: inventário -> plano dry-run/diff -> branch -> adapters/slots/registries -> testes/revisão -> publicação autorizada da revisão exata -> read-back e smoke. Hash/preimage para upgrades; preservar personalização e históricos. Desinstalar remove mounts e execução futura, não deleta registros automaticamente. Não criar UI mock em produção.

O kit PKG-0 disponível nesta entrega tem manifesto, profiles candidatos, tipos e planejador local. Não possui apply/merge/deploy e não é DOTS completo instalado. O botão Instalar DOTS deverá integrar o catálogo/registries existentes; não foi presumida API nativa universal.

## Ondas

PKG-0: auditoria/manifesto/contratos/preflight. Sem certificação operacional.
PKG-1: reutilizar fullscreen desta branch, corrigir C-12/C-13 e extrair shell/store único nos hosts. Aceite: mesma conversa/rascunho/cursor, contexto válido, single mount, preview staff/cliente e tamanhos320/375/412/768/1024/1280/1440.
PKG-2: canal interportais, autoria/audiência/participantes, transações e privacidade. Aceite: duas contas veem mesmo atendimento autorizado, sem nota interna em API cliente; dois escritórios isolados.
PKG-3: packs/tools/Orbe, aprovação/job/resultado, orçamento/encerramento. Aceite: revogação, timeout, concorrência, replay, reconciliação e evidência independente.
PKG-4: canais externos, arquivos, memória e voz. Aceite: transportes/recibos, dedup, privacidade e consentimentos reais.
PKG-5: mesmo artefato instalado/atualizado/desabilitado/removido nos dois apps e depois terceiro escolhido, sem fork do core e sem perda de dados.

## Fontes focais

FullscreenWorkspace.jsx:1-55; ConversationSidebar.jsx:1-150; DotEditor.jsx:1-99; AssistantProvider.jsx busca focal; api/routes/assistantRoutes.js:137-188,600-735; api/server.js:128-225, todos desta branch. Contaux main relida: AssistantProvider.jsx:1-95 (total605), AssistantWidget.jsx:1-95 (total102), pages/portal/PortalLayout.jsx:1-86 e grep assistantRoutes fila/autoria. Baseline anterior: assistantRoutes1-570, assistantTools1-349, taskExecutor1-146, aiService1-185, auth1-140, moduleCoverage1-112 e migrations0171-61. Os caminhos frontend são relativos a dashboard/src/components/assistant salvo indicação.

Requisitos privados: PROMPT-UNIFICADO-CONTAUX.txt; Texto colado(1).md; plano Assistente Contaux; galeria Cida15telas e adendo comercial. As restrições de preservar engines e não publicar automaticamente continuam válidas.

Nenhum build/teste de app, migração aplicada, comunicação externa ou publicação foi realizado por esta auditoria. Documentação e checkpoint não equivalem a implementação visual/instalação do módulo.
