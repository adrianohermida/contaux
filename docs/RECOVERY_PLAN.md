# Plano de Recuperação — Contaux

> **Princípio fundamental:** O site HTML estático atual é a base pública 100% utilizada. O app legado (React/Base44) é apenas fonte de requisitos e regras de negócio — seu código **não** será copiado. Cada módulo será reimplementado limpo, do zero, sobre a nova base.

---

## 1. AUDITORIA DO LEGADO

### 1.1 Diagnóstico quantitativo

| Métrica | Valor | Observação |
|---------|-------|-----------|
| Arquivos em `src/` | 1.165 | Inclui bloat massivo |
| Arquivos JSX | 978 | Muitos não são componentes reais |
| "Componentes de dashboard" | 509 | Apenas ~305 são reais |
| Arquivos de documentação como JSX | 176+ | PHASE*, SPRINT*, CHECKLIST*, etc. — lixo |
| Funções backend | 98 | ~60 úteis, ~38 são infra/DevOps/testes |
| Entidades (modelos de dados) | 59 | Núcleo do negócio — reutilizar como referência |
| Páginas/rotas | 53 | ~35 funcionais, ~18 duplicadas ou experimentais |
| Testes | 62 unit + 34 e2e | Maioria quebrada ou obsoleta |
| Demos de terceiros | 3 dirs | VoxImplant demos copiados — descartar |

### 1.2 O que é lixo (descartar)

| Categoria | Quantidade | Motivo |
|-----------|-----------|--------|
| Relatórios de sprint/phase como JSX | 176 | Documentação disfarçada de componente |
| Componentes duplicados "Enhanced" | ~20 | Versões paralelas sem cleanup |
| Múltiplos dashboards de analytics sobrepostos | 6+ | AnalyticsDashboard, AdvancedAnalyticsDashboard, AnalyticsInsightsDashboard, etc. |
| Demos VoxImplant (basic-websdk-demo, click-to-call) | 3 dirs | Código de terceiros não integrado |
| Componentes de infra/DevOps no frontend | ~30 | ClusterReplicationManager, GeoReplicationManager, etc. |
| Funções backend de infra desnecessária | ~38 | graphqlServer, autoScaling, multiRegionOrchestration, etc. |
| Páginas experimentais/duplicadas | ~18 | RLSDebugger, ReportsAdvanced vs Reports vs ReportsAnalytics vs ReportsOperations |

### 1.3 O que é reutilizável como referência (reimplementar, não copiar)

| Categoria | Itens | Valor |
|-----------|-------|-------|
| **Modelos de dados** | 59 entidades | Esquema completo do negócio: Client, Contact, Invoice, Quote, Payment, TaxInvoice, etc. |
| **Regras de negócio** | Funções de validação e cálculo | validateClientDocument (CPF/CNPJ), calculateLeadScore, calculateLoyaltyTier, convertQuoteToInvoice |
| **Estrutura de navegação** | sidebarConfig | Organização modular do produto |
| **Fluxos de usuário** | Páginas funcionais | Contact, Clients, Invoicing, Payments, Quotes, Dashboard |
| **Integrações reais** | Google Calendar, Stripe, Google Sheets | Conectores que o negócio precisa |
| **Design tokens** | tailwind.config + CSS vars | Sistema de cores/tema dark mode |

### 1.4 Entidades do negócio (59 modelos)

```
# CRM
Client, Contact, ContactActivity, ContactAttachment, ContactNote,
ContactRelationship, ContactTag, ContactTagAssignment, CustomField,
CustomFieldValue, CompanyAddress, CompanyContact

# Financeiro
Invoice, Quote, Payment, Transaction, BankAccount, BankReconciliation,
CashFlowProjection, Service, SalesOpportunity, SalesActivity

# Fiscal/Contábil
TaxInvoice, JournalEntry, Account, AccountingCalendar, FiscalData,
ChartOfAccounts, ManualPosting

# Marketing
Campaign, LoyaltyProgram, CustomerPoints, RewardRedemption

# Suporte
Ticket, LegalProcess, DocumentTemplate

# Blog
BlogPost, BlogCategory, BlogComment, BlogReaction, BlogBookmark, BlogAnalytics

# Comunicação
Notification, ChatMessage, CallHistory

# Sistema
User, Role, WorkspaceSettings, AuditLog, Webhook, Workflow,
IntegrationLog, DigitalCertificate, AccessCredential, ShareholderInfo,
Template, VirtualCounterConversation, VirtualCounterMessage, Report
```

---

## 2. PROMPT MESTRE

> Este prompt guia toda decisão de implementação. Cole no topo de qualquer sessão de desenvolvimento.

```
Você está reconstruindo a plataforma Contaux — um sistema de gestão contábil
brasileiro. O site público HTML estático (index.html, about-us.html, services.html,
etc.) é a base 100% utilizada e não deve ser alterado em sua estrutura visual.

REGRAS DE OURO:
1. NUNCA copie código do legado (legacy/). Use-o apenas como referência de
   requisitos, regras de negócio e modelos de dados.
2. Cada módulo deve ser independente, coeso e testável isoladamente.
3. Um componente = uma responsabilidade. Se passou de 200 linhas, refatore.
4. Não crie abstrações prematuras. YAGNI — faça o simples que funciona.
5. Validação no frontend é UX; validação real é no backend. Sempre.
6. Toda tela deve funcionar em mobile (373px) e desktop (1880px).
7. Acessibilidade não é opcional: semântica HTML, ARIA, contraste, teclado.
8. Português brasileiro em toda interface e comentários.
9. Dark mode é obrigatório via classe CSS (class="dark").
10. Performance: lazy loading de rotas e componentes pesados. Bundle < 200KB inicial.

PROIBIDO:
- Importar componentes do legacy/ para o app novo
- Criar "versões Enhanced" de componentes — evolua o original
- Adicionar bibliotecas sem necessidade comprovada
- Deixar código morto ou comentado no repositório
- Criar arquivos de documentação como componentes JSX
- Hardcoded de URLs, tokens ou credenciais
```

---

## 3. MÓDULOS E SPECS

A navegação do legado define 7 módulos verticais. Cada um tem sua spec abaixo.

### Módulo 0 — Base Pública (Site Estático) ✅ JÁ EXISTE
- **Status:** Completo e funcional
- **Arquivos:** index.html, about-us.html, services.html, portfolio.html, pricing.html, contato.html, blog-*.html
- **Ação:** Nenhuma mudança necessária. Servir via nginx.

### Módulo 1 — Dashboard
📄 Ver `specs/01-dashboard.md`

### Módulo 2 — CRM (Clientes & Contatos)
📄 Ver `specs/02-crm.md`

### Módulo 3 — Financeiro (Faturamento, Orçamentos, Pagamentos)
📄 Ver `specs/03-financeiro.md`

### Módulo 4 — Contabilidade (Lançamentos, Plano de Contas, Fiscal)
📄 Ver `specs/04-contabilidade.md`

### Módulo 5 — Suporte (Tickets, Processos Jurídicos, Balcão Virtual)
📄 Ver `specs/05-suporte.md`

### Módulo 6 — Marketing (Campanhas, Blog, Fidelidade)
📄 Ver `specs/06-marketing.md`

### Módulo 7 — Administração (Configurações, Segurança, Auditoria)
📄 Ver `specs/07-administracao.md`

---

## 4. SKILLS (Capacidades Técnicas Necessárias)

### Skills de Frontend
| Skill | Nível | Onde usar |
|-------|-------|-----------|
| React 18 + Hooks | Avançado | Todos os módulos |
| Tailwind CSS | Intermediário | Estilização consistente |
| React Router | Intermediário | Navegação entre módulos |
| TanStack Query | Intermediário | Cache e sincronia de dados |
| Acessibilidade (WCAG 2.1) | Intermediário | Todos os módulos |
| Responsive Design | Avançado | Mobile-first |
| Dark mode | Básico | CSS variables + class toggle |

### Skills de Backend
| Skill | Nível | Onde usar |
|-------|-------|-----------|
| Base44 SDK | Intermediário | Entidades, auth, funções |
| Validação CPF/CNPJ | Intermediário | CRM, Financeiro |
| Geração de PDF | Intermediário | Faturas, orçamentos, relatórios |
| NFe (Nota Fiscal) | Básico | Módulo Fiscal |
| Integração Stripe | Básico | Pagamentos |
| Integração Google Calendar | Básico | Agendamento |

### Skills de Domínio
| Skill | Nível | Onde usar |
|-------|-------|-----------|
| Contabilidade brasileira | Intermediário | Contabilidade, Financeiro |
| Plano de contas | Intermediário | Contabilidade |
| Conciliação bancária | Básico | Contabilidade |
| Fluxo de caixa | Intermediário | Financeiro |
| CRM/Lead scoring | Básico | CRM |
| LGPD | Básico | Administração |

---

## 5. PLANO DE EXECUÇÃO

### Fase 0 — Restauração e Validação da Base ✅
- [x] Site estático servido via nginx na porta 3000
- [x] Docker compose configurado
- [x] Código legado preservado em `legacy/` como referência
- [x] Documentação de referência criada (`LEGACY_REFERENCE.md`)

### Fase 1 — Fundação (Semana 1)
- [ ] Definir stack do app dashboard (React + Vite + Tailwind + shadcn/ui)
- [ ] Configurar autenticação (Base44 Auth)
- [ ] Criar layout base (sidebar + header + mobile nav)
- [ ] Implementar dark mode
- [ ] Configurar roteamento com lazy loading
- [ ] Estabelecer padrões de código (ESLint, convenções)

### Fase 2 — Módulo CRM (Semana 2)
- [ ] Entidade Client (CRUD completo)
- [ ] Entidade Contact (CRUD + relacionamentos)
- [ ] Lista com filtros, busca e ordenação
- [ ] Formulário com validação CPF/CNPJ
- [ ] Tags e categorias
- [ ] Importação/Exportação CSV
- [ ] Detecção de duplicatas

### Fase 3 — Módulo Financeiro (Semana 3)
- [ ] Entidade Invoice (faturamento)
- [ ] Entidade Quote (orçamentos)
- [ ] Entidade Payment (pagamentos)
- [ ] Conversão Quote → Invoice
- [ ] Geração de PDF (fatura, orçamento, recibo)
- [ ] Fluxo de caixa
- [ ] Dashboard financeiro

### Fase 4 — Módulo Contabilidade (Semana 4)
- [ ] Plano de contas
- [ ] Lançamentos contábeis
- [ ] Conciliação bancária
- [ ] Notas fiscais (NFe)
- [ ] Calendário contábil
- [ ] Importação CSV

### Fase 5 — Módulos Suporte + Marketing (Semana 5)
- [ ] Tickets de suporte
- [ ] Processos jurídicos
- [ ] Balcão virtual (chat)
- [ ] Campanhas
- [ ] Blog manager
- [ ] Programa de fidelidade

### Fase 6 — Administração + Relatórios (Semana 6)
- [ ] Configurações
- [ ] Logs de auditoria
- [ ] Centro de segurança
- [ ] Relatórios e analytics
- [ ] Automações

### Fase 7 — Validação Final
- [ ] Testes E2E por módulo
- [ ] Auditoria de acessibilidade
- [ ] Performance (Lighthouse > 90)
- [ ] Review de segurança
- [ ] Documentação final

---

## 6. CRITÉRIOS DE ACEITE POR MÓDULO

Cada módulo só é considerado "pronto" quando:

1. ✅ CRUD completo funciona ponta a ponta
2. ✅ Validação no backend (não só frontend)
3. ✅ Funciona em mobile (373px) e desktop (1880px)
4. ✅ Dark mode funcionando
5. ✅ Acessível (navegação por teclado, ARIA, contraste)
6. ✅ Sem erros no console
7. ✅ Lazy loaded (não pesa no bundle inicial)
8. ✅ Sem código morto ou comentado
9. ✅ Sem imports do legacy/
10. ✅ Testado com dados reais

---

## 7. ESTRUTURA DE ARQUIVOS DO NOVO APP

```
/                    # Site estático (público)
├── index.html
├── about-us.html
├── services.html
├── ...
├── assets/
├── docs/            # Este plano + specs
│   ├── RECOVERY_PLAN.md
│   └── specs/
├── legacy/          # Referência (não tocar)
├── app/             # Novo app dashboard (a ser criado)
│   ├── src/
│   │   ├── modules/     # Um dir por módulo vertical
│   │   │   ├── crm/
│   │   │   ├── financeiro/
│   │   │   ├── contabilidade/
│   │   │   ├── suporte/
│   │   │   ├── marketing/
│   │   │   └── admin/
│   │   ├── shared/      # Componentes compartilhados
│   │   ├── lib/         # Utils, hooks, config
│   │   └── styles/      # CSS global
│   └── package.json
└── docker-compose.base44.yml
```

---

## 8. ANTI-FRANKENSTEIN CHECKLIST

Antes de qualquer merge, verificar:

- [ ] Nenhum arquivo de `legacy/` foi importado no app novo
- [ ] Nenhum componente passou de 200 linhas sem justificativa
- [ ] Nenhuma biblioteca foi adicionada sem necessidade
- [ ] Nenhum arquivo de documentação foi criado como JSX
- [ ] Nenhuma URL/token/credencial hardcoded
- [ ] Nenhuma "versão Enhanced" criada — evolua o original
- [ ] O bundle inicial não cresceu desnecessariamente
- [ ] A acessibilidade foi testada, não assumida
- [ ] O mobile foi testado em 373px, não assumido
- [ ] O dark mode foi testado, não assumido
