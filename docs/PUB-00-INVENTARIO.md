# PUB-00 — Inventário, Revisão, Fatos e Mapa de Páginas

**Data:** 14 de outubro de 2026  
**Branch:** `contaux-audit-plan-2`  
**Responsável pela revisão:** Equipe Contaux (responsável contábil a confirmar)

---

## 1. Inventário dos 19 documentos HTML

| # | Arquivo | Título | Estado atual | Conteúdo de template? | Alegações sem respaldo? |
|---|---|---|---|---|---|
| 1 | `index.html` | Contaux Contadoria — Contabilidade para Advogados | Hero, FAQ e serviços parcialmente reais; depoimentos e botões "Quero este" sem efeito | Sim — depoimentos com nomes fictícios e imagem única `testi2.webp` | Sim — depoimentos, "profissionais capacitados e experientes", "mapeado todas as regulamentações" |
| 2 | `about-us.html` | Sobre Nós | Conteúdo integral de agência digital de template | Sim — "Websites that tell your brand's story", Lorem ipsum, "Product UX, Design & Development", "Clients are our partners" | Sim — alegações de experiência e equipe não confirmadas |
| 3 | `services.html` | Serviços | Lista de serviços de template (UX, design, product) | Sim — Lorem ipsum, "Discover the world", "Product UX, Design & Development" | Sim — serviços de design apresentados como serviços contábeis |
| 4 | `service-single.html` | Detalhes do Serviço | Página genérica de template — todos os 4 serviços da home convergem para cá | Sim — conteúdo de design genérico | Sim — sem detalhe próprio por serviço |
| 5 | `pricing.html` | Planos | Preços reais (R$899, R$1549, R$2499/mês) sem explicação de volumes, exclusões ou revisões | Não | Sim — preços sem validação vigente; gratuidade sem condições |
| 6 | `portfolio.html` | Portfólio | Itens de web design com imagens placeholder | Sim — `via.placeholder.com`, "Best Web Design in 2023", Lorem ipsum | Sim — casos de design apresentados como portfólio contábil |
| 7 | `portfolio-single.html` | Portfólio Single | Artigo de web design de template | Sim — conteúdo de autoria/design | Sim — caso fictício |
| 8 | `blog-grid-sidebar.html` | Blog Grid | Posts de blog de template | Sim — 28 ocorrências de lorem/placeholder | Sim — autores e comentários inventados |
| 9 | `blog-single.html` | Artigo | Artigo de blog de template | Sim — 27 ocorrências | Sim — autor e comentários inventados |
| 10 | `blog-single-sidebar.html` | Artigo + Sidebar | Artigo de blog de template | Sim — 28 ocorrências | Sim — autor e comentários inventados |
| 11 | `contato.html` | Contato | Formulário e dados de contato; e-mails de exemplo em JSON-LD | Sim — `john.doe@example.com`, `david.thompson@sample.com` em structured data | Sim — contatos divergentes; altura fixa 300px (E02, E09) |
| 12 | `parceiros.html` | Parceiros | Conteúdo real e bem hedged sobre programa de parceiros | Não | Parcial — benefício de contabilidade para sociedade unipessoal/simples condicionado (correto) |
| 13 | `niveis-sla.html` | Níveis de SLA | SLA detalhado (Essencial, Intermediário, Premium) | Não | Sim — prazos e horários sem confirmação de operação real |
| 14 | `seguro-responsabilidade.html` | Seguro de Responsabilidade | Apólice com vigência 01/01/2024 a 31/12/2024 — **EXPIRADA** | Não | **Sim — bloqueante**: limites (R$500k/sinistro, R$2M agregado) sem comprovação vigente |
| 15 | `politica-de-privacidade.html` | Política de Privacidade | Texto legal | Não | Verificar se reflete tratamento real de dados |
| 16 | `termos-de-uso.html` | Termos de Uso | Texto legal | Não | Verificar com responsáveis competentes |
| 17 | `404.html` | Página não encontrada | Página de erro limpa | Não | Não |
| 18 | `mail-success.html` | E-mail enviado | Confirmação de envio | Não | Não |
| 19 | `reset-password.html` | Redefinir senha | Formulário de redefinição | Sim — 2 ocorrências de placeholder | Não |

---

## 2. Mapeamento de modais públicos

| Modal | Trigger (data attribute) | Script | Páginas presentes | Estado |
|---|---|---|---|---|
| Login | `data-ctx-login` | `site-modals.js` | 18 páginas (todas exceto `mail-success.html`) | Funcional — abre modal de login |
| Cadastro | (dentro do modal de login) | `site-modals.js` | Indireto via modal de login | Funcional — aba dentro do login |
| Recuperação de senha | (dentro do modal de login) | `site-modals.js` | Indireto via modal de login | Funcional — link dentro do login |
| Lead (Fale com especialista) | `data-ctx-lead` | `site-modals.js` | `index.html`, `contato.html` | Funcional — abre modal de captação |
| Chat público | Botão flutuante auto-injetado | `public-chat-widget.js` | Páginas que incluem o script | Funcional — widget de chat com visitor_token |
| Newsletter | Formulário no footer | `site-modals.js` | Páginas com footer de newsletter | Verificar confirmação real de inscrição |
| Cookies | — | — | — | **Não encontrado** — sem banner/controle de cookies implementado |

**Arquivos de script:**
- `assets/js/site-modals.js` — Sistema de modais (login, cadastro, recuperação, lead, newsletter). Autoinicializável via data attributes.
- `assets/js/public-chat-widget.js` — Widget de chat flutuante com visitor_token persistente e handoff IA→humano.
- `assets/js/parceiros.js` — Formulário progressivo de interesse no programa de parceiros. Confirma somente após persistência real.
- `assets/js/main.js` — Script principal do template (menu, scroll, preloader, etc.).

---

## 3. Mapeamento de scripts públicos

| Script | Função | Páginas | Estado |
|---|---|---|---|
| `assets/js/main.js` | Menu mobile, scroll-top, preloader, navegação | Todas | Funcional |
| `assets/js/site-modals.js` | Modais de login/cadastro/lead/newsletter | Páginas que incluem o script | Funcional |
| `assets/js/public-chat-widget.js` | Chat público com visitor_token | Páginas que incluem o script | Funcional |
| `assets/js/parceiros.js` | Formulário de interesse em parceiros | `parceiros.html` | Funcional |
| `assets/js/bootstrap.min.js` | Framework CSS/JS | Todas | Funcional |
| `assets/js/glightbox.min.js` | Lightbox de imagens/vídeos | Páginas com galeria | Guardado com verificação de existência |
| `assets/js/isotope.min.js` | Filtro/masonry de portfólio | `index.html`, `contato.html`, `portfolio.html` | Guardado com verificação de nulidade |
| `assets/js/count-up.min.js` | Contadores animados | Páginas com contadores | Verificar se números são reais |
| `assets/js/tiny-slider.js` | Carrossel de depoimentos | `index.html` | Verificar se depoimentos são reais |
| `assets/js/wow.min.js` | Animações de scroll | Todas | Funcional |
| `assets/js/imagesloaded.min.js` | Pré-carregamento de imagens | Páginas com isotope | Funcional |
| `assets/js/jquery-counterup.min.js` | Contador animado (jQuery) | Páginas com contadores | Verificar |

---

## 4. Registro de fatos

### 4.1 Alegações com fonte identificada

| # | Alegação | Página | Fonte | Responsável | Validade | Aprovação editorial | Disponibilidade operacional |
|---|---|---|---|---|---|---|---|
| F01 | "Contaux Contadoria: soluções contábeis e empresariais para advogados" | `index.html` (meta) | Declaração de posicionamento | Pendente | — | Pendente | Confirmar escopo real |
| F02 | "Cálculos judiciais, pareceres, guias e planos de pagamento" | `index.html` (meta) | Declaração de serviços | Pendente | — | Pendente | Confirmar oferta vigente |
| F03 | "Sistema de tickets com prazos de entrega" | `index.html` (FAQ) | FAQ JSON-LD | Pendente | — | Pendente | Confirmar operação real |
| F04 | "Adaptamos a softwares jurídicos ou CRMs adotados por nossos clientes" | `index.html` (FAQ) | FAQ JSON-LD | Pendente | — | Pendente | Confirmar |
| F05 | "Mapeado todas as regulamentações de recolhimento de taxas judiciárias e tabelas de serviços de cada Tribunal no Brasil" | `index.html` | Texto da página | Pendente | — | Pendente | Confirmar abrangência |
| F06 | Depoimento: "Antes de conhecer a Contaux, eu perdia muito tempo..." (Dra. Camila Mendes, SP) | `index.html` | Texto da página | Pendente | — | **Não aprovada** | Sem comprovação |
| F07 | Depoimento: "Como advogada autônoma..." | `index.html` | Texto da página | Pendente | — | **Não aprovada** | Sem comprovação |
| F08 | Depoimento: Dr. Ricardo Almeida | `index.html` | Texto da página | Pendente | — | **Não aprovada** | Sem comprovação |
| F09 | Preços: R$899/mês (Essencial), R$1549/mês (Intermediário), R$2499/mês (Premium) | `pricing.html` | Texto da página | Pendente | — | Pendente | **Sem validação vigente** |
| F10 | "Apólice vigente: 01/01/2024 a 31/12/2024" | `seguro-responsabilidade.html` | Texto da página | Pendente | **Expirada** | **Bloqueada** | Sem comprovação vigente |
| F11 | "Limite máximo por sinistro: R$ 500.000,00" | `seguro-responsabilidade.html` | Texto da página | Pendente | **Expirada** | **Bloqueada** | Sem apólice vigente |
| F12 | "Limite agregado anual: R$ 2.000.000,00" | `seguro-responsabilidade.html` | Texto da página | Pendente | **Expirada** | **Bloqueada** | Sem apólice vigente |
| F13 | SLA Essencial: resposta 24h, resolução 72h, atendimento 9h-17h | `niveis-sla.html` | Texto da página | Pendente | — | Pendente | Confirmar operação |
| F14 | SLA Intermediário: resposta 8h, resolução 48h, atendimento 9h-18h | `niveis-sla.html` | Texto da página | Pendente | — | Pendente | Confirmar operação |
| F15 | SLA Premium: resposta 4h, resolução 24h, atendimento 8h-19h | `niveis-sla.html` | Texto da página | Pendente | — | Pendente | Confirmar operação |
| F16 | "Créditos proporcionais conforme o contrato firmado" em caso de descumprimento | `niveis-sla.html` | Texto da página | Pendente | — | Pendente | Confirmar contrato real |
| F17 | "Benefício previsto: contabilidade online para sociedade unipessoal ou de até dois sócios no Simples" | `parceiros.html` | Texto da página | Pendente | — | Pendente | **Condições não definidas** (corretamente hedged) |
| F18 | "O cadastro não substitui a contratação" | `parceiros.html` | Texto da página | — | — | Aprovada (hedged) | Correto |
| F19 | "john.doe@example.com" e "david.thompson@sample.com" em structured data | `contato.html` | JSON-LD | — | — | **Erro** | Substituir por contato real |
| F20 | "Websites that tell your brand's story" / "Digital Product UX, Design & Development" | `about-us.html` | Template | — | — | **Remover** | Template de agência digital |
| F21 | "Best Web Design in 2023" / "Best Graphic Design in 2023" | `portfolio.html` | Template | — | — | **Remover** | Template de portfólio de design |
| F22 | Autores e comentários de blog | `blog-*.html` | Template | — | — | **Remover** | Autores e comentários inventados |

### 4.2 Fatos pendentes bloqueantes

| Fato pendente | Bloqueia | Páginas afetadas | Ação |
|---|---|---|---|
| Seguro de responsabilidade: vigência encerrada 31/12/2024 | PUB-01, PUB-07 | `seguro-responsabilidade.html` | Não publicar limites ou vigência sem comprovação atual |
| Preços sem validação vigente | PUB-05 | `pricing.html` | Qualificar ou remover até validação |
| Equipe real e CRCs não confirmados | PUB-01, PUB-07 | `about-us.html` | Remover equipe de template; não inventar responsáveis |
| Depoimentos sem comprovação | PUB-01, PUB-03 | `index.html` | Remover ou qualificar como ilustrativos |
| Alegações de experiência, abrangência e disponibilidade | PUB-01, PUB-07 | `index.html`, `about-us.html` | Qualificar ou remover |
| Benefício de contabilidade para sociedade unipessoal/simples | PUB-05 | `parceiros.html` | Já hedged — manter condicionado |
| Perícia: objeto, habilitação e oferta não confirmados | PUB-04 | (nova página) | Não publicar até confirmação |
| Integração HMADV: homologação bilateral pendente | PUB-08 | (nova página) | Descrever como proposta/piloto, não ativo |
| Catálogo real de serviços de contabilidade online | PUB-04, PUB-05 | `services.html`, `service-single.html` | Confirmar catálogo real |
| Google OAuth: GOOGLE_CLIENT_ID/SECRET não configurados | PUB-06 | Login social | Não anunciar login social até configurar |
| MFA/TOTP: não implementado | PUB-06 | Acesso | Não anunciar MFA até implementar |
| Revogação de sessão (denylist): não implementada | PUB-06 | Acesso | Não anunciar revogação até implementar |
| Log de auditoria automático para CRUD: não implementado | PUB-07 | Responsabilidade | Não anunciar auditoria automática |
| E-mails de exemplo em structured data | PUB-01 | `contato.html` | Substituir por contato real |
| SLA: prazos sem confirmação de operação | PUB-07 | `niveis-sla.html` | Confirmar ou qualificar |

---

## 5. Mapa de destinos editoriais (28 propostas)

| # | Página/destino | Ação | Onda | Bloqueado por |
|---|---|---|---|---|
| D01 | `index.html` — Hero | Reescrever com duas jornadas (contabilidade × contadoria) | PUB-03 | — |
| D02 | `index.html` — Depoimentos | Remover depoimentos sem comprovação ou qualificar como ilustrativos | PUB-01 | Comprovação |
| D03 | `index.html` — Botões "Quero este" | Remover ou conectar a fluxo de proposta | PUB-03 | — |
| D04 | `index.html` — FAQ | Revisar respostas com respaldo factual | PUB-03 | F03, F04, F05 |
| D05 | `index.html` — Newsletter | Verificar confirmação real de inscrição | PUB-06 | — |
| D06 | `about-us.html` — Hero | Substituir "Websites that tell your brand's story" por atuação contábil real | PUB-01 | Equipe real (F20) |
| D07 | `about-us.html` — Serviços | Remover "Product UX, Design & Development" | PUB-01 | — |
| D08 | `about-us.html` — Texto Lorem ipsum | Remover todo Lorem ipsum | PUB-01 | — |
| D09 | `services.html` — Lista de serviços | Substituir serviços de design por serviços contábeis reais | PUB-01 | Catálogo real |
| D10 | `service-single.html` — Genérica | Criar detalhe próprio por serviço (não uma página genérica) | PUB-04 | Catálogo real |
| D11 | `pricing.html` — Preços | Qualificar com volumes, exclusões e revisões; ou marcar como ilustrativos | PUB-05 | Validação vigente (F09) |
| D12 | `pricing.html` — Gratuidade | Conciliar com condições do programa | PUB-05 | F17 |
| D13 | `portfolio.html` | Remover casos de web design e placeholder images | PUB-01 | — |
| D14 | `portfolio-single.html` | Remover artigo de web design | PUB-01 | — |
| D15 | `blog-grid-sidebar.html` | Unificar estrutura editorial; remover conteúdo de template | PUB-08 | — |
| D16 | `blog-single.html` | Remover autor e comentários inventados | PUB-08 | — |
| D17 | `blog-single-sidebar.html` | Remover autor e comentários inventados | PUB-08 | — |
| D18 | `contato.html` — JSON-LD | Substituir e-mails de exemplo por contato real | PUB-01 | — |
| D19 | `contato.html` — Altura fixa 300px | Corrigir CSS (E02, E09) | PUB-02 | — |
| D20 | `contato.html` — Contatos divergentes | Separar comercial e suporte | PUB-06 | — |
| D21 | `seguro-responsabilidade.html` | Não publicar limites/vigência sem comprovação atual | PUB-01 | Apólice vigente (F10-F12) |
| D22 | `niveis-sla.html` — SLA | Confirmar prazos com operação real ou qualificar | PUB-07 | F13-F16 |
| D23 | `parceiros.html` | Manter hedging atual; não ativar benefício automaticamente | PUB-05 | F17 |
| D24 | Nova: Catálogo de serviços | Página ou seção listando serviços reais com escopo e entregáveis | PUB-03 | Catálogo real |
| D25 | Nova: Como funciona | Página explicando público, jornadas e contratação | PUB-03 | — |
| D26 | Nova: Contadoria para processos | Página principal de contadoria especializada | PUB-04 | — |
| D27 | Nova: Contabilidade online | Página principal de contabilidade online para advocacia | PUB-05 | — |
| D28 | Nova: Integração HMADV | Página explicativa conforme estágio real (proposta/piloto) | PUB-08 | Homologação |

---

## 6. Reconciliação com backlogs existentes

| Backlog | Itens relevantes | Status | Ação PUB |
|---|---|---|---|
| CTX-01 (SEC-11) | Sanitização XSS | Concluída | PUB-01 aplica o mesmo princípio ao site estático |
| CTX-01 (SAFE-01) | Contenção de botões falsos | Concluída | PUB-01 remove botões "Quero este" sem efeito |
| CTX-01 (SEC-10) | Webhook sem fallback de segredo | Concluída | PUB-06 reutiliza endpoints sem contornar auth |
| CQ-03 | Auth/sessão | Concluída | PUB-06 reutiliza endpoints canônicos |
| CQ-04 | Chat público | Concluída | PUB-06 reutiliza widget existente |
| PKG-1 | Core host-agnóstico | Concluída | PUB-08 descreve disponibilidade ao público |
| CQ-09 | Regressão dashboard | Em andamento | PUB-09 consolida regressão do site público |

Nenhuma tarefa duplicada. As referências cruzadas são de reutilização e alinhamento.

---

## 7. Achados de código concretos

| ID | Achado | Página | Correção |
|---|---|---|---|
| E02 | Imagens com `src` malformado | `index.html`, `contato.html` | Corrigido em rodada anterior |
| E09 | Altura fixa de 300px nos blocos de contato | `contato.html` | PUB-02 |
| E12 | Apólice com vigência encerrada | `seguro-responsabilidade.html` | PUB-01 |
| E18 | Imagens placeholder (`via.placeholder.com`) | `portfolio.html` | PUB-01 |
| E06 | Preços sem explicação | `pricing.html` | PUB-05 |
| E10 | Benefício condicionado | `parceiros.html` | Já hedged — manter |
| E03 | Equipe de template | `about-us.html` | PUB-01 |
| — | E-mails de exemplo em JSON-LD | `contato.html` | PUB-01 |
| — | Isotope "Bad element: null" | `index.html`, `contato.html`, `portfolio.html` | Corrigido |
| — | GLightbox TypeError | `index.html` | Corrigido |
| — | ORB-blocked third-party scripts | `index.html` | Corrigido (env guards) |

---

## 8. Próximos passos

1. **PUB-01** (Prioridade 2): Remover conteúdo demonstrativo e conter alegações sem respaldo nas páginas liberadas.
2. **PUB-02** (Prioridade 3): Corrigir responsividade, altura fixa e componentes inconsistentes.
3. **PUB-03** (Prioridade 4): Reescrever home com duas jornadas, catálogo e Como funciona.

**Fatos pendentes que exigem input do usuário:**
- Confirmação de apólice de seguro vigente (ou instrução para remover a página)
- Validação de preços vigentes (ou instrução para qualificar como ilustrativos)
- Confirmação de equipe real e CRCs (ou instrução para remover equipe de template)
- Confirmação de depoimentos reais (ou instrução para remover)
- Catálogo real de serviços de contabilidade online
- Confirmação de SLA operacional real
