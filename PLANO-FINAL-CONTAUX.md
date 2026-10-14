# Plano Final Consolidado — Contaux

Data: 14 de outubro de 2026. Branch: `contaux-audit-plan-2`, HEAD `1032f29db2`.
App Base44: `6ac662d96e17daa6cc43b266`. Hospedeiro HMADV: `6a922f5b2b48868a43a6f5cd`.

Este plano consolida três trilhas de execução em um único roteiro ordenado por prioridade:

1. **Trilha CQ** (CQ-00 a CQ-09) — Assistente, shell, segurança e QA do dashboard. **Concluída.**
2. **Trilha CTX** (CTX-01 a CTX-05 + PKG-1) — Auditoria de segurança, isolamento, contenção e extração host-agnóstica. **Concluída.**
3. **Trilha PUB** (PUB-00 a PUB-09) — Refatoração editorial e da jornada comercial do site público. **Nova prioridade.**

Nenhuma onda anterior é descartada ou revogada. As ondas PUB são aditivas: tratam do site público estático (HTML/CSS/JS), que não foi objeto das trilhas CQ/CTX (focadas no dashboard React e na API Express). Onde há dependência ou referência cruzada, está mapeada explicitamente.

---

## Sumário de status

### Trilha CQ — Assistente e dashboard

| Onda | Título | Status |
|---|---|---|
| CQ-00 | Auditoria da versão em uso | ✅ Concluída |
| CQ-01 | Shell docked persistente e responsivo | ✅ Concluída |
| CQ-02 | Saneamento de autorização (P0) | ✅ Concluída |
| CQ-03 | Identidade, PIN e sessão persistente | ✅ Concluída |
| CQ-04 | Canal entre portais e atendimento humano | ✅ Concluída |
| CQ-05 | Ferramentas operacionais, tarefas e e-mail | ✅ Concluída |
| CQ-06 | Memória, anexos e voz | ✅ Concluída |
| CQ-07 | Proatividade interna limitada | ✅ Concluída |
| CQ-07b | Correções de segurança (mini-onda 1) | ✅ Concluída |
| CQ-08 | Projetos privados e dots configuráveis | ✅ Concluída |
| CQ-09 | QA ponta a ponta e piloto | ⏳ Em andamento (orquestra orçamento e aceite humano pendentes) |

### Trilha CTX — Auditoria de segurança

| Onda | Título | Status |
|---|---|---|
| CTX-01 | Isolamento e contenção crítica (SEC-01 a SEC-11, SAFE-01) | ✅ Concluída |
| CTX-02 | Correções pequenas e visíveis (FAST-01 a FAST-07) | ✅ Concluída |
| CTX-03 | P0 remanescentes (C-03, C-04, C-09) | ✅ Concluída |
| CTX-04 | P0 remanescente e P1 já corrigidos (C-12, C-14, C-15, C-13, C-10) | ✅ Concluída |
| CTX-05 | P1 remanescentes (C-06, C-07, C-08, C-11) | ✅ Concluída |
| PKG-1 | Shell/store único nos hosts (core host-agnóstico) | ✅ Concluída |

### Trilha PUB — Site público (nova prioridade)

| Onda | Título | Status |
|---|---|---|
| PUB-00 | Inventário, revisão, fatos e mapa de páginas | 🔲 Não iniciada |
| PUB-01 | Remover conteúdo demonstrativo e conter alegações | 🔲 Não iniciada |
| PUB-02 | Componentes públicos e responsividade | 🔲 Não iniciada |
| PUB-03 | Home, jornadas, catálogo e Como funciona | 🔲 Não iniciada |
| PUB-04 | Serviços de contadoria para processos | 🔲 Não iniciada |
| PUB-05 | Contabilidade online, planos e parceiros | 🔲 Não iniciada |
| PUB-06 | Conversão, acesso, suporte, chat e newsletter | 🔲 Não iniciada |
| PUB-07 | Confiança, responsabilidade e políticas | 🔲 Não iniciada |
| PUB-08 | Conteúdo, exemplos e comunicação HMADV | 🔲 Não iniciada |
| PUB-09 | SEO/build, regressão e liberação controlada | 🔲 Não iniciada |

---

## Dependências cruzadas entre trilhas

| PUB | Depende de | Razão |
|---|---|---|
| PUB-01 | CTX-01 (SEC-11, SAFE-01) | Sanitização XSS e contenção de botões falsos já implementados no dashboard; PUB-01 aplica o mesmo princípio ao site estático (remover conteúdo de template apresentado como real). |
| PUB-02 | — | Correção visual independente (alturas fixas, imagens inválidas, responsividade). |
| PUB-06 | CQ-03 (auth/sessão), CQ-04 (chat público) | Reutiliza endpoints canônicos de auth, chat público persistente e modais de login/cadastro já existentes. Não cria novo mecanismo de token. |
| PUB-06 | CTX-01 (SEC-10) | Webhook sem fallback de segredo — formulários públicos não contornam auth da API. |
| PUB-08 | PKG-1 (core host-agnóstico) | A comunicação da integração HMADV no site público deve refletir o estágio real (proposta/piloto/disponível). PKG-1 preparou a extração técnica; PUB-08 descreve a disponibilidade ao público. |
| PUB-09 | CQ-09 (regressão) | A onda final de PUB consolida a regressão do site público com a regressão do dashboard. |

Nenhuma onda CQ/CTX/PKG é revogada ou atualizada por PUB. As referências acima são de reutilização e alinhamento, não de substituição.

---

## Trilha PUB — Detalhamento das ondas

### Contrato comum (PUB)

- PT-BR em toda a UI do site público.
- Preservar marca Contaux: logo, fonte Spartan, tokens aprovados (ver `docs/DESIGN_SYSTEM.md`). Não aplicar identidade visual do HMADV.
- Não migrar o site para outro framework só para trocar copy. O site é HTML/CSS/JS servido por nginx; extrair partials/componentes quando necessário, mantendo o conteúdo principal no HTML publicado.
- Não inventar preço, gratuidade, equipe, CRC, experiência, depoimento, case, seguro, prazo, disponibilidade, número de clientes ou vantagem.
- Preço em HTML não é confirmação de preço vigente.
- Seguro descrito com vigência de 2024 exige comprovação atual; não inventar renovação nem concluir ausência de seguro.
- Fato pendente bloqueia a alegação ou página dependente, não tarefas independentes.
- Em cada rodada: informar revisão, arquivos, páginas, copy concluída, fatos pendentes, testes executados, evidências e próximos IDs.
- Página concluída exige: conteúdo completo, fatos sustentados, CTA funcional, estados, visual verificado, SEO e presença no build.

### Posicionamento obrigatório

A Contaux atende prioritariamente advogados autônomos e escritórios de advocacia. Organizar duas jornadas distintas:

1. **Contabilidade online do escritório** — rotina contábil, abertura de sociedade, transição de contador. Não anunciar folha, gestão financeira ou obrigações específicas apenas porque são comuns em outros escritórios contábeis.
2. **Contadoria de apoio aos processos** — cálculos, pareceres, assistência técnica, guias, planos de pagamento, apoio contábil à recuperação judicial.

Distinguir plano de pagamento de PF de apoio contábil à recuperação judicial de PJ. Não confundir apoio técnico com representação jurídica, contadoria oficial, nomeação pericial ou administração judicial.

---

### PUB-00 — Inventário, revisão, fatos e mapa de páginas

**Prioridade:** 1 (primeira ação).

**Foco:** atualizar o inventário dos 19 documentos HTML da raiz, revisar o código, mapear destinos editoriais e criar o registro de fatos (alegações com fonte, responsável, validade, aprovação editorial e disponibilidade operacional separadas).

**Critério de fechamento:** cada alegação e página tem fonte, decisão e dependência identificadas.

**Entregas:**
- Inventário revisado dos 19 HTMLs: `index.html`, `about-us.html`, `services.html`, `service-single.html`, `pricing.html`, `portfolio.html`, `portfolio-single.html`, `blog-grid-sidebar.html`, `blog-single.html`, `blog-single-sidebar.html`, `contato.html`, `parceiros.html`, `niveis-sla.html`, `seguro-responsabilidade.html`, `politica-de-privacidade.html`, `termos-de-uso.html`, `404.html`, `mail-success.html`, `reset-password.html`.
- Mapeamento de modais públicos: login, cadastro, recuperação, lead (em `assets/js/site-modals.js`), chat (`assets/js/public-chat-widget.js`), newsletter, cookies.
- Mapeamento de scripts públicos: `assets/js/main.js`, `assets/js/parceiros.js`.
- Registro de fatos: tabela com colunas `alegação | fonte | responsável | validade | aprovação editorial | disponibilidade operacional`.
- Identificação de fatos pendentes que bloqueiam alegações (seguro, preços, equipe, depoimentos, experiência, abrangência).
- Mapa de 28 destinos editoriais propostos (substituições, páginas condicionadas, modelo de artigo) — propostas, não URLs existentes.
- Reconciliação com backlogs CTX/HMC existentes, sem duplicar tarefas.

**Arquivos de referência:** `EVIDENCIAS-E-FONTES.md`, `MAPA-PAGINAS-E-BACKLOG.json` (pacote anexado), `AGENTS.md`, `docs/DESIGN_SYSTEM.md`, roteamento real (nginx), `scripts/build-pages.sh`, `docs/specs/INTEGRATION_HERMIDA_MAIA.md`.

**Não fazer em PUB-00:** não classificar todo `href="#"` como quebrado (alguns têm handlers). Não recriar funções existentes sem verificar o código. Não alterar o aplicativo.

---

### PUB-01 — Remover conteúdo demonstrativo e conter alegações sem respaldo

**Prioridade:** 2.

**Foco:** eliminar conteúdo de template de agência digital apresentado como equipe, serviço, caso ou resultado real nas páginas liberadas. Conter alegações que não têm comprovação atual.

**Critério de fechamento:** nenhum template é apresentado como equipe, serviço, caso ou resultado real nas páginas liberadas.

**Entregas:**
- `about-us.html`: substituir conteúdo de agência digital (design, UX, textos de preenchimento, equipe de demonstração) por atuação contábil real, método de trabalho e responsáveis confirmados — ou remover se fato pendente.
- `services.html`: substituir conteúdo de design pelos serviços contábeis reais da Contaux.
- `service-single.html`: remover conteúdo genérico de design. Os quatro serviços destacados na home levam ao mesmo `service-single.html` — identificar e marcar para PUB-04.
- `portfolio.html` / `portfolio-single.html`: remover artigos de web design, projeto de template, autoria, comentários e contadores estáticos. Marcar para PUB-08 (unificar estrutura editorial).
- Depoimentos sem comprovação: não substituir por depoimentos inventados. Apresentar método, responsabilidade técnica e exemplos de entregáveis claramente identificados como ilustrativos.
- Alegações de experiência, qualificação de toda a equipe, abrangência, disponibilidade e seguro: marcar como fato pendente se sem comprovação atual. Remover ou qualificar.
- `seguro-responsabilidade.html`: apólice com vigência encerrada em 31/12/2024 — não atualizar o ano nem conservar os limites anunciados sem consultar a documentação vigente. Marcar como fato pendente bloqueante.
- `pricing.html`: preços sem explicação de volumes, exclusões, revisões e despesas. Comunicação de gratuidade precisa ser conciliada com as condições do programa. Marcar para PUB-05.

**Princípio:** não transformar texto antigo em promessa nova. O CFC exige caráter informativo, moderação e sustentação factual e técnica. A revisão deve passar pelo responsável contábil.

**Referência cruzada:** alinha com CTX-01/SAFE-01 (contenção de alegações sem efeito) aplicado ao site público.

---

### PUB-02 — Consolidar componentes públicos e responsividade

**Prioridade:** 3.

**Foco:** cabeçalho, rodapé, cards, formulários, tipografia e responsividade consistentes, legíveis e sem recortes ou espaços decorrentes de conteúdo ausente.

**Critério de fechamento:** componentes consistentes, legíveis e sem recortes ou espaços decorrentes de conteúdo ausente.

**Entregas:**
- Corrigir altura fixa de 300px dos blocos de contato (`contato.html`) — achado concreto de código (E02, E09).
- Corrigir marcação inválida de imagens (src malformado) — achado concreto de código (E02, E18).
- Corrigir placeholders, áreas vazias, títulos cortados, cards desproporcionais e widgets sobrepostos.
- Consolidar cabeçalho e rodapé como partials reutilizáveis (se o build permitir; senão manter consistência manual).
- Testar em 320, 373, 390, 768, 1440 e 1880px. Referência: WCAG 2.2 AA (reflow, foco, contraste).
- Verificar teclado e zoom. Sem declarar conformidade apenas por passar em um teste automatizado.

**Não aumentar texto artificialmente para preencher espaço.** Usar imagens próprias ou licenciadas, sem apresentá-las como equipe real.

---

### PUB-03 — Reescrever home, catálogo e Como funciona

**Prioridade:** 4.

**Foco:** home que explica claramente as duas ofertas, catálogo de serviços e página Como funciona.

**Critério de fechamento:** as duas jornadas e o próximo passo estão claros.

**Direção editorial proposta (sujeita à confirmação da oferta):**

> **Contabilidade online e apoio técnico-contábil para a advocacia.**
> Da rotina do escritório aos cálculos de um processo, conheça o escopo de cada serviço e solicite uma proposta para sua demanda.
> Solicitar proposta · Conhecer os serviços · Entrar (já é cliente?)

Duas entradas logo abaixo:

| Contabilidade do escritório | Contadoria para processos |
|---|---|
| Conheça o acompanhamento contábil para sua sociedade de advocacia e as condições para abertura, organização da rotina ou transição de contador. | Consulte apoio para cálculos, análise técnica, guias e organização das informações de uma demanda. |
| Conhecer a contabilidade online | Ver serviços de contadoria |

Nota de contratação: "O cadastro não substitui a contratação. Serviços, valores e prazos são definidos na proposta aprovada."

**CTA principal:** Solicitar proposta. **CTA secundário:** Conhecer os serviços. **Acesso:** Entrar.

**Entregas:**
- `index.html`: hero com direção editorial acima, duas entradas (contabilidade × contadoria), seções de serviços, método, FAQ e CTA. Remover depoimentos não comprovados.
- Catálogo de serviços: página ou seção listando os serviços reais com escopo, documentos, entregáveis e solicitação contextual.
- Como funciona: página explicando público, duas linhas de serviço, contratação e etapas.
- Os quatro serviços destacados na home não devem convergir para uma única `service-single.html` genérica — cada serviço precisa de detalhe próprio (PUB-04/PUB-05).

---

### PUB-04 — Serviços de contadoria para processos

**Prioridade:** 5.

**Foco:** completar as páginas de contadoria especializada com detalhe próprio e solicitação contextual.

**Critério de fechamento:** cada serviço anunciado possui detalhe próprio e solicitação contextual.

**Entregas:**
- Página principal de contadoria para processos.
- Cálculos judiciais: detalhe próprio (para quem é, quando utilizar, o que inclui, o que não inclui, documentos, entregáveis, prazo, como solicitar).
- Guias: detalhe próprio.
- Pareceres e assistência técnica: detalhe próprio.
- Perícia: somente com objeto, habilitação e oferta confirmados. Se não confirmado, não publicar.
- Plano de pagamento de PF: página e explicação distintos.
- Apoio contábil à recuperação judicial de PJ: página e explicação distintos, sem misturar públicos.
- Distinguir apoio técnico-contábil de representação jurídica e de atribuições decorrentes de nomeação judicial.

Toda página de serviço deve responder: para quem é, quando utilizar, o que inclui, o que não inclui, quais documentos são necessários, o que será entregue, como o prazo é definido e como solicitar a proposta.

---

### PUB-05 — Contabilidade online, planos e parceiros

**Prioridade:** 6.

**Foco:** completar contabilidade online, abertura, transição, rotina do escritório, planos e parceiros.

**Critério de fechamento:** escopo, preços e benefícios não excedem o que foi aprovado.

**Entregas:**
- Página principal de contabilidade online para advocacia.
- Abertura de sociedade de advocacia: página condicionada ao catálogo real.
- Troca de contador: página condicionada ao catálogo real.
- Rotina do escritório: página condicionada ao catálogo real.
- `pricing.html`: separar conta gratuita, serviço avulso, contabilidade recorrente e benefício de parceria. Validar as condições antes de anunciá-las. Preço em HTML não é confirmação de preço vigente.
- `parceiros.html`: preservar a diferenciação existente — interesse ≠ conta ≠ adesão ao programa ≠ contratação ≠ pagamento. O benefício proposto para sociedade unipessoal ou sociedade de até dois sócios no Simples continua condicionado à definição das regras e à contratação. Não ativar automaticamente.

---

### PUB-06 — Conversão, acesso, suporte, chat e newsletter

**Prioridade:** 7.

**Foco:** formulários, confirmações, suporte, acesso, chat e newsletter com efeitos reais e tratamento de erro.

**Critério de fechamento:** as ações produzem efeitos reais e têm tratamento de erro, repetição e indisponibilidade.

**Entregas:**
- Separar proposta, conta, contratação, pagamento e suporte.
- Preservar o serviço escolhido ao abrir o formulário. Coletar apenas o necessário no contato inicial. Não exigir documentos sensíveis em formulário público.
- Reutilizar endpoints e autenticação canônicos (CQ-03). Confirmar recebimento somente após persistência real. Não confundir e-mail na fila com entregue nem solicitação com serviço contratado.
- Criar estados de validação, processamento, sucesso, falha, duplicação, indisponibilidade e retomada.
- Reconciliar modais com a sessão vigente. Não criar outro mecanismo de token nem compartilhar segredos com o HMADV.
- Identificar IA e humano no chat (CQ-04). Revalidar isolamento de dados e renderização segura (SEC-11). Não anunciar atendente imediato sem operação. Não inserir chat ou marketing em recuperação de senha.
- Newsletter: confirmação real de inscrição, não apenas mensagem de sucesso.
- `contato.html`: corrigir contatos divergentes. Separar comercial e suporte.

**Referência cruzada:** CQ-03 (auth/sessão), CQ-04 (chat público), CTX-01/SEC-10 (webhook sem fallback), CTX-01/SEC-11 (sanitização XSS).

---

### PUB-07 — Confiança, responsabilidade e políticas

**Prioridade:** 8.

**Foco:** Sobre, responsabilidade profissional, SLA, termos, privacidade e cookies.

**Critério de fechamento:** o conteúdo corresponde à operação e às condições aprovadas.

**Entregas:**
- `about-us.html`: sobre real, método de trabalho, responsáveis confirmados.
- Metodologia/entregáveis: página ou seção com método e exemplos de entregáveis claramente ilustrativos.
- `seguro-responsabilidade.html`: somente com comprovação vigente. Se fato pendente, não publicar limites ou vigência.
- `niveis-sla.html`: prazos e atendimento conforme operação real.
- `termos-de-uso.html`: revisar com responsáveis competentes. Mapear tratamento real, fornecedores, retenção, direitos e HMADV.
- `politica-de-privacidade.html`: mapear tratamento real de dados.
- Cookies e preferências: controle efetivo para aceitar, recusar ou revogar. Quando a base utilizada for consentimento, a escolha não pode ser presumida pela continuidade da navegação. Um texto sobre preferências não substitui um controle efetivo.
- Não enviar dados pessoais, documentos, mensagens ou tokens a eventos de analytics.

---

### PUB-08 — Conteúdo, exemplos e comunicação HMADV

**Prioridade:** 9.

**Foco:** blog, metodologia, exemplos e comunicação da integração HMADV.

**Critério de fechamento:** conteúdo original e comprovável; integração descrita conforme a disponibilidade real.

**Entregas:**
- Blog: unificar a estrutura editorial (`blog-grid-sidebar.html`, `blog-single.html`, `blog-single-sidebar.html`). Publicar conteúdo original, revisado e relacionado aos serviços. Sem autores, contadores ou comentários inventados.
- Artigo individual com endereço próprio (modelo de artigo).
- Central de ajuda.
- Exemplos de entregáveis claramente identificados como ilustrativos — nunca criar pessoas ou resultados fictícios.
- Página explicativa da integração HMADV: disponibilidade e acesso, sem anunciar como ativo o que ainda depende de homologação. "Abrir no HMADV" só pode ser uma ação comercial ativa quando o destino e a autorização estiverem funcionando.
- "Criar conta", "Consultar disponibilidade" e "Abrir no HMADV" não são ações equivalentes. O site não concede permissões. Não inventar callback, instalação, autenticação ou vínculo de tenant.

**Referência cruzada:** PKG-1 preparou a extração técnica do core host-agnóstico. PUB-08 descreve a disponibilidade da integração ao público, alinhada ao estágio real (proposta/piloto/disponível).

---

### PUB-09 — SEO, build, regressão e liberação controlada

**Prioridade:** 10 (última onda).

**Foco:** validar SEO, build, rotas, acessibilidade e publicação controlada.

**Critério de fechamento:** a revisão exata está testada, aprovada e acompanhada de plano de reversão.

**Entregas:**
- SEO: metadados e canonical coerentes. Dados estruturados correspondem a fatos visíveis e provados.
- Sitemap, robots, llms.txt e o artefato publicado conferidos.
- Build: o build inspecionado copia HTML da raiz (`scripts/build-pages.sh`). Páginas em subpastas exigem ajuste e teste de inclusão. Preservar SPA/API.
- Testar acesso direto, refresh, redirects e HTTP de erro (404, etc.).
- Acessibilidade: WCAG 2.2 AA — contraste, foco, labels, diálogos, reflow e movimento reduzido. Sem declarar conformidade apenas por passar em um teste automatizado.
- Regressão: consolidar testes das ondas PUB-00 a PUB-08. As validações devem ocorrer durante cada onda; PUB-09 consolida a regressão, não é a primeira ocasião de testar.
- Plano de reversão.
- Liberação controlada: não publicar nem enviar comunicações reais, alterar contratos vigentes ou migrar produção sem autorização explícita.

**Referência cruzada:** CQ-09 (regressão do dashboard). PUB-09 consolida a regressão do site público com a do dashboard.

---

## Ordem de execução

```
PUB-00 → PUB-01 → PUB-02 → PUB-03 → PUB-04 → PUB-05 → PUB-06 → PUB-07 → PUB-08 → PUB-09
```

O primeiro resultado visível deve ser a home e o catálogo corrigidos (PUB-03), não uma nova rodada interminável de documentos. Mas a correção rápida não pode manter uma oferta falsa apenas para evitar uma pendência comercial.

**PUB-00 e PUB-01 são executados primeiro:** confirmar os fatos e retirar o que compromete a confiança. Depois, corrigir a estrutura visual (PUB-02) e entregar a home (PUB-03). A partir daí, completar cada serviço e sua jornada — sem depender da conclusão do mosaico HMADV para corrigir o site público.

As trilhas CQ e CTX permanecem concluídas. CQ-09 (orquestra orçamento e aceite humano do piloto) continua em andamento em paralelo, sem bloquear a trilha PUB.

---

## Fatos pendentes conhecidos (bloqueantes para PUB)

| Fato | Bloqueia | Origem |
|---|---|---|
| Seguro de responsabilidade: vigência encerrada 31/12/2024, sem comprovação vigente | PUB-01, PUB-07 | `seguro-responsabilidade.html` (E12) |
| Preços em HTML sem validação vigente | PUB-05 | `pricing.html` (E06) |
| Equipe real e CRCs não confirmados | PUB-01, PUB-07 | `about-us.html` (E03) |
| Depoimentos sem comprovação | PUB-01, PUB-03 | `index.html` (E02) |
| Alegações de experiência, abrangência e disponibilidade | PUB-01, PUB-07 | `index.html` (E02) |
| Benefício de contabilidade para sociedade unipessoal/simples: condições não definidas | PUB-05 | `parceiros.html` (E10) |
| Perícia: objeto, habilitação e oferta não confirmados | PUB-04 | — |
| Integração HMADV: homologação bilateral pendente | PUB-08 | `docs/specs/INTEGRATION_HERMIDA_MAIA.md` |
| Catálogo real de serviços de contabilidade online | PUB-04, PUB-05 | — |
| Google OAuth: GOOGLE_CLIENT_ID/SECRET não configurados | PUB-06 (login social) | `.base44/environment.json` |
| MFA/TOTP: não implementado | PUB-06 (acesso) | Known issues |
| Revogação de sessão (denylist): não implementada | PUB-06 (acesso) | Known issues |
| Log de auditoria automático para CRUD: não implementado | PUB-07 (responsabilidade) | Known issues |

Fato pendente bloqueia a alegação ou página dependente, não tarefas independentes. Não publicar VALIDAR, lorem, números simulados ou "Em breve" para declarar conclusão.

---

## Validação por onda

As validações devem ocorrer durante cada onda, não apenas na última. Em cada onda:

1. **Revisão de código:** arquivos alterados, páginas tocadas, copy concluída.
2. **Fatos:** alegações sustentadas ou marcadas como pendentes.
3. **Testes:** navegadores (320, 373, 390, 768, 1440, 1880px), teclado, zoom. Sem navegador, registrar validação pendente; não inventar capturas ou testes.
4. **SEO:** metadados, canonical, sitemap, dados estruturados.
5. **Build:** página presente no artefato publicado, acesso direto e refresh funcionam.
6. **Evidências:** registrar o que foi verificado e o que ficou pendente.
7. **Próximos IDs:** indicar a próxima onda e os bloqueios a resolver.

---

## Arquivos de referência

| Arquivo | Conteúdo |
|---|---|
| `ONDAS.md` | Detalhamento completo das ondas CQ-00 a CQ-09, CTX-01 a CTX-05 e PKG-1. |
| `PLANO-MESTRE.md` | Auditoria CQ-00 e detalhamento de CQ-01 a CQ-03. |
| `AGENTS.md` | Identidade, arquitetura, regras e convenções do projeto. |
| `docs/DESIGN_SYSTEM.md` | Identidade visual, cores, tipografia, componentes e templates. |
| `docs/specs/INTEGRATION_HERMIDA_MAIA.md` | Especificação da integração bilateral Contaux ↔ HMADV. |
| `docs/DEPLOYMENT.md` | Guia de deploy de produção. |
| `docs/RUNBOOK.md` | Documentação operacional e plano de rollout. |
| `EVIDENCIAS-E-FONTES.md` | Caderno de evidências da análise pública (anexo). |
| `PROMPT-MESTRE-CONTAUX.txt` | Prompt mestre estendido para execução (anexo). |
| `MAPA-PAGINAS-E-BACKLOG.json` | Mapa de páginas e backlog editorial (anexo). |
