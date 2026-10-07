# Referência de Legado — contaux44

> **Repositório de origem:** https://github.com/adrianohermida/contaux44.git
> **Stack:** React 18 + Vite + Tailwind CSS + shadcn/ui (New York) + Base44 SDK
> **Data da extração:** 2026-10-07
> **Localização no projeto:** `legacy/`

---

## Sumário

| Categoria | Quantidade |
|-----------|-----------|
| Páginas (rotas) | 53 |
| Componentes React | ~300+ |
| Funções backend (Base44) | 92 |
| Módulos de componentes | 30 diretórios |
| Componentes UI (shadcn) | 40+ |

---

## 1. Estrutura de Diretórios

```
legacy/
├── base44/
│   └── functions/          # 92 funções backend (Deno + Base44 SDK)
├── src/
│   ├── App.jsx             # App root (Router + AuthProvider + QueryClient)
│   ├── Layout.jsx          # Layout principal (Header/Footer/DashboardLayout)
│   ├── pages/              # 53 páginas/rotas
│   ├── pages.config.js     # Config de rotas (auto-gerado)
│   ├── api/
│   │   └── base44Client.js # Cliente API Base44
│   ├── components/         # ~300+ componentes organizados em 30 módulos
│   ├── hooks/
│   │   └── use-mobile.jsx
│   ├── lib/
│   │   ├── AuthContext.jsx
│   │   ├── NavigationTracker.jsx
│   │   ├── PageNotFound.jsx
│   │   ├── app-params.js
│   │   ├── query-client.js
│   │   └── utils.js
│   ├── utils/              # Utils + VoxImplant SDK demos
│   ├── globals.css
│   └── index.css
├── package.json
├── vite.config.js
├── tailwind.config.js
├── components.json         # Config shadcn/ui
└── jsconfig.json
```

---

## 2. Páginas (53 rotas)

### Públicas / Marketing
| Página | Arquivo | Descrição |
|--------|---------|-----------|
| Home | `pages/Home.jsx` | Landing page principal |
| About | `pages/About.jsx` | Sobre a empresa |
| Services | `pages/Services.jsx` | Serviços oferecidos |
| Portfolio | `pages/Portfolio.jsx` | Portfólio de cases |
| Pricing | `pages/Pricing.jsx` | Tabela de preços |
| Contact | `pages/Contact.jsx` | Formulário de contato |
| Blog | `pages/Blog.jsx` | Listagem do blog |
| BlogSingle | `pages/BlogSingle.jsx` | Post individual do blog |
| QuoteRequest | `pages/QuoteRequest.jsx` | Solicitação de orçamento |
| Welcome | `pages/Welcome.jsx` | Tela de boas-vindas |

### Dashboard / Gestão Contábil
| Página | Arquivo | Descrição |
|--------|---------|-----------|
| Dashboard | `pages/Dashboard.jsx` | Painel principal com KPIs |
| VirtualCounter | `pages/VirtualCounter.jsx` | Balancão virtual |
| Clients | `pages/Clients.jsx` | Gestão de clientes |
| ContactDetails | `pages/ContactDetails.jsx` | Detalhes de contato/cliente |
| ClientPortal | `pages/ClientPortal.jsx` | Portal do cliente |
| ClientPanel | `pages/ClientPanel.jsx` | Painel do cliente |
| Tickets | `pages/Tickets.jsx` | Tickets de suporte |
| LegalProcesses | `pages/LegalProcesses.jsx` | Processos legais/jurídicos |

### Financeiro / Fiscal
| Página | Arquivo | Descrição |
|--------|---------|-----------|
| Invoicing | `pages/Invoicing.jsx` | Faturamento |
| Payments | `pages/Payments.jsx` | Pagamentos |
| Quotes | `pages/Quotes.jsx` | Orçamentos/cotações |
| Sales | `pages/Sales.jsx` | Vendas |
| CashFlow | `pages/CashFlow.jsx` | Fluxo de caixa |
| CashFlowForecast | `pages/CashFlowForecast.jsx` | Previsão de fluxo de caixa |
| Transactions | `pages/Transactions.jsx` | Transações |
| BankReconciliation | `pages/BankReconciliation.jsx` | Conciliação bancária |
| TaxInvoices | `pages/TaxInvoices.jsx` | Notas fiscais |
| TaxCalculation | `pages/TaxCalculation.jsx` | Cálculo de impostos |

### Contabilidade
| Página | Arquivo | Descrição |
|--------|---------|-----------|
| Entries | `pages/Entries.jsx` | Lançamentos contábeis |
| ManualPosting | `pages/ManualPosting.jsx` | Lançamentos manuais |
| ChartOfAccounts | `pages/ChartOfAccounts.jsx` | Plano de contas |
| AccountingCalendar | `pages/AccountingCalendar.jsx` | Calendário contábil |
| ImportCSV | `pages/ImportCSV.jsx` | Importação CSV |

### Relatórios
| Página | Arquivo | Descrição |
|--------|---------|-----------|
| Reports | `pages/Reports.jsx` | Relatórios gerais |
| ReportsAnalytics | `pages/ReportsAnalytics.jsx` | Relatórios analíticos |
| ReportsAdvanced | `pages/ReportsAdvanced.jsx` | Relatórios avançados |
| ReportsOperations | `pages/ReportsOperations.jsx` | Relatórios operacionais |

### CRM / Marketing
| Página | Arquivo | Descrição |
|--------|---------|-----------|
| Campaigns | `pages/Campaigns.jsx` | Campanhas de marketing |
| LoyaltyPrograms | `pages/LoyaltyPrograms.jsx` | Programas de fidelidade |
| ConversionTracking | `pages/ConversionTracking.jsx` | Rastreamento de conversão |
| ConversionRateOptimizer | `pages/ConversionRateOptimizer.jsx` | Otimização de conversão |
| Communication | `pages/Communication.jsx` | Central de comunicação |

### Administração / Sistema
| Página | Arquivo | Descrição |
|--------|---------|-----------|
| SettingsPage | `pages/SettingsPage.jsx` | Configurações |
| SecurityCenter | `pages/SecurityCenter.jsx` | Centro de segurança |
| AuditLogs | `pages/AuditLogs.jsx` | Logs de auditoria |
| Automations | `pages/Automations.jsx` | Automações |
| DocumentManagement | `pages/DocumentManagement.jsx` | Gestão de documentos |
| Notifications | `pages/Notifications.jsx` | Notificações |
| ContractManagement | `pages/ContractManagement.jsx` | Gestão de contratos |
| BlogManager | `pages/BlogManager.jsx` | Gerenciador de blog |
| MyBookmarks | `pages/MyBookmarks.jsx` | Favoritos do usuário |
| RLSDebugger | `pages/RLSDebugger.jsx` | Debugger RLS (Row Level Security) |
| App | `pages/App.jsx` | App interno |

---

## 3. Funções Backend (92 funções Base44)

Localização: `legacy/base44/functions/`

### IA / Machine Learning
| Função | Descrição |
|--------|-----------|
| `aiGenerateBlogIdea` | Gera 5 ideias de posts via LLM |
| `aiWriteBlogContent` | Escreve conteúdo de blog via LLM |
| `aiSuggestAction` | Sugestões de ações via IA |
| `aiMLPredictiveAnalytics` | Analytics preditivo com ML |
| `predictChurn` | Predição de churn de clientes |
| `predictLeadOutcome` | Predição de resultado de leads |
| `recommendNextActions` | Recomenda próximas ações |
| `generateChurnIntervention` | Gera intervenção anti-churn |
| `calculateCustomerHealth` | Calcula saúde do cliente |
| `calculateLeadScore` | Pontuação de leads |
| `suggestEnrichment` | Sugere enriquecimento de dados |

### Financeiro / Fiscal
| Função | Descrição |
|--------|-----------|
| `generateInvoicePDF` | Gera PDF de fatura |
| `generateQuotePDF` | Gera PDF de orçamento |
| `generatePaymentReceipt` | Gera recibo de pagamento |
| `generateNFe` | Gera Nota Fiscal Eletrônica |
| `convertQuoteToInvoice` | Converte orçamento em fatura |
| `updateInvoicePaymentStatus` | Atualiza status de pagamento |
| `sendInvoiceNotifications` | Envia notificações de fatura |
| `sendInvoiceReminder` | Envia lembrete de fatura |
| `sendPaymentReceivedNotifications` | Notifica pagamento recebido |
| `syncBankData` | Sincroniza dados bancários |
| `executePointsTransaction` | Transação de pontos (fidelidade) |
| `calculateLoyaltyTier` | Calcula nível de fidelidade |

### Relatórios / Analytics
| Função | Descrição |
|--------|-----------|
| `generateAnalyticsReport` | Relatório de analytics |
| `generatePDFReport` | Relatório em PDF |
| `generateReportPDF` | Relatório em PDF (alt.) |
| `generateComparisonReport` | Relatório comparativo |
| `advancedReporting` | Engine de relatórios avançados |
| `customBIDashboard` | Dashboard BI customizado |
| `dataWarehousePipeline` | Pipeline de data warehouse |
| `costAnalytics` | Analytics de custos |
| `exportToCSV` | Exportação para CSV |

### CRM / Comunicação
| Função | Descrição |
|--------|-----------|
| `submitContactForm` | Submete formulário de contato |
| `submitQuoteRequest` | Submete solicitação de orçamento |
| `executeCampaign` | Executa campanha de marketing |
| `sendNewsletterPost` | Envia newsletter |
| `subscribeNewsletter` | Inscreve na newsletter |
| `sendNotifications` | Envia notificações |
| `sendPushNotifications` | Envia push notifications |
| `mergeContacts` | Mescla contatos duplicados |
| `detectDuplicates` | Detecta contatos duplicados |
| `scanDuplicates` | Escaneia duplicatas |

### Blog / SEO
| Função | Descrição |
|--------|-----------|
| `generateBlogImage` | Gera imagem para blog |
| `publishScheduledBlogs` | Publica blogs agendados |
| `submitBlogComment` | Submete comentário de blog |
| `trackBlogView` | Rastreia visualização de blog |
| `analyzeSEO` | Análise SEO |
| `generateSchemaOrg` | Gera Schema.org |
| `generateSitemap` | Gera sitemap |

### Segurança / Auth
| Função | Descrição |
|--------|-----------|
| `advancedRBAC` | RBAC granular com permissões por recurso |
| `enterpriseSSO` | SSO empresarial |
| `generateMFASecret` | Gera secret MFA |
| `verifyMFAToken` | Verifica token MFA |
| `requestMagicLink` | Solicita magic link |
| `verifyMagicLink` | Verifica magic link |
| `encryptionService` | Serviço de criptografia |
| `validateEncryptionKey` | Valida chave de criptografia |
| `createAuditLog` | Cria log de auditoria |
| `auditUsers` | Auditoria de usuários |
| `validateTenantAccess` | Valida acesso de tenant |
| `enforceWorkspaceIsolation` | Isolamento de workspace |
| `validateMultitenantState` | Valida estado multitenant |

### Infra / DevOps
| Função | Descrição |
|--------|-----------|
| `cacheManager` | Gerenciador de cache |
| `rateLimiter` | Rate limiting |
| `corsHandler` | Handler CORS |
| `apiGateway` | API Gateway |
| `graphqlServer` | Servidor GraphQL |
| `publicAPI` | API pública |
| `apiDocumentation` | Documentação de API |
| `autoScaling` | Auto-scaling |
| `monitoringMetrics` | Métricas de monitoramento |
| `alertingSystem` | Sistema de alertas |
| `backupReports` | Backup de relatórios |
| `multiRegionOrchestration` | Orquestração multi-região |
| `batchProcessingEngine` | Engine de processamento em lote |
| `realtimeCollaborationEngine` | Engine de colaboração em tempo real |
| `presenceTracking` | Rastreamento de presença |
| `webhookIntegration` | Integração de webhooks |

### Validação / Migração
| Função | Descrição |
|--------|-----------|
| `validateClientDocument` | Valida documento de cliente |
| `validateInvoiceNumber` | Valida número de fatura |
| `validateQuoteData` | Valida dados de orçamento |
| `validateSalesOpportunityData` | Valida dados de oportunidade |
| `validateEntityData` | Valida dados de entidade |
| `formatters` | Formatadores |
| `validators` | Validadores gerais |
| `migrateDataToWorkspace` | Migra dados para workspace |
| `migrateExistingData` | Migra dados existentes |
| `migrateFieldTenantToWorkspace` | Migra campo tenant |
| `migrateUserData` | Migra dados de usuário |
| `migrateUserMultitenant` | Migra usuário multitenant |
| `fixWorkspaceId` | Corrige workspace ID |
| `initializeRLSPolicies` | Inicializa políticas RLS |

### Integrações
| Função | Descrição |
|--------|-----------|
| `syncGoogleSheets` | Sincroniza com Google Sheets |
| `emailTemplateEngine` | Engine de templates de email |
| `triggerRetentionWorkflow` | Dispara workflow de retenção |
| `executeWorkflow` | Executa workflow |
| `integration-tests` | Testes de integração |
| `testIntegration` | Teste de integração |

---

## 4. Módulos de Componentes (30 diretórios)

Localização: `legacy/src/components/`

| Módulo | Diretório | Componentes principais |
|--------|-----------|----------------------|
| **UI (shadcn)** | `ui/` | 40+ componentes base (Button, Card, Dialog, Table, Form, etc.) |
| **Dashboard** | `dashboard/` | ~200+ componentes: DashboardLayout, ClientForm, InvoiceForm, InvoiceList, ContactForm, AnalyticsCharts, KPICard, etc. |
| **Auth** | `auth/` | AuthContext, ProtectedClientRoute, ProtectedInternalRoute, useGlobalAuth, useMultitenantAuth |
| **AI** | `ai/` | DocumentAnalyzer, InsightsDashboard, RecommendationCard, RevenuePredictor, SuggestionEngine |
| **Analytics** | `analytics/` | AdvancedAnalyticsDashboard, CustomMetricsBuilder, KPIWidget, PredictiveReport, ExportEngine |
| **Automation** | `automation/` | AutomationDashboard, WorkflowBuilder |
| **Blog** | `blog/` | BlogReactions, BookmarkButton, NewsletterCampaign, ReadingTime, RelatedPosts, ShareButtons, TableOfContents |
| **Cache** | `cache/` | CacheManager, CacheStatistics, CachingDashboard, CompressionEngine |
| **Chat** | `chat/` | FloatingChatWidget |
| **Collaboration** | `collaboration/` | ActivityFeed, CollaborationUI, CollaborativeEditor, CommentThread, LiveCursorTracker |
| **Contact** | `contact/` | FormFeedback, UnifiedContactForm |
| **Context** | `context/` | CacheContext |
| **Forms** | `forms/` | AdvancedFormLayout, ContextualSuggestions, ErrorRecoveryHandler |
| **Modals** | `modals/` | FormActions, FormField, ModalWrapper, useFormState, useFormSubmit |
| **Integrations** | `integrations/` | GoogleCalendarSync, GoogleSheetsExport, StripeSetup, WebhookManager, WebhookTester |
| **i18n** | `i18n/` | translations (PT-BR) |
| **ML** | `ml/` | AnomalyDetector, ClusterAnalyzer, ForecastingDashboard, PatternRecognizer, TimeSeriesForecast, TrainingMonitor |
| **Mobile** | `mobile/` | MobileDashboard, MobileNav, MobileOptimizer, ResponsiveLayout, TouchButton, useTouchGestures |
| **Notifications** | `notifications/` | NotificationCenter, SmartNotificationCenter, PushNotificationManager, ToastNotification |
| **Performance** | `performance/` | BundleAnalyzer, CacheManager, ImageOptimizer, LazyImage, LazyLoadingManager |
| **Profiling** | `profiling/` | BundleAnalyzer, MemoryProfiler, ProfilingDashboard |
| **PWA** | `pwa/` | OfflineIndicator, PWAInstallPrompt, SyncManager |
| **RBAC** | `rbac/` | PermissionMatrix, RoleManager, UserManagement |
| **Realtime** | `realtime/` | WebSocketDashboard |
| **Reports** | `reports/` | Componentes de relatórios |
| **Security** | `security/` | SecurityDashboard |
| **Services** | `services/` | WebSocketService |
| **Settings** | `settings/` | BrandingSettings, LanguageSwitcher, useWorkspaceSettings |
| **Shared** | `shared/` | UnifiedFiltersBar, UnifiedGrid, UnifiedHeader |
| **Sync** | `sync/` | ConflictResolver, DataValidator, SyncDashboard, SyncQueueManager |
| **Validation** | `validation/` | ValidationError, useValidation |
| **VirtualCounter** | `virtualCounter/` | Componentes do balcão virtual |
| **VoxImplant** | `voximplant/` | Integração de chamadas VoIP |
| **a11y** | `a11y/` | AccessibilityChecklist, AccessibilityProvider, useAriaLive, useKeyboardNavigation |
| **Audio** | `audio/` | processor (processamento de áudio) |
| **Docs** | `docs/` | Documentação de sprints |

---

## 5. Componentes Principais (nível raiz)

| Componente | Arquivo | Função |
|------------|---------|--------|
| Header | `Header.jsx` | Cabeçalho do site público |
| Footer | `Footer.jsx` | Rodapé do site |
| Logo | `Logo.jsx` | Logo da Contaux |
| BottomNav | `BottomNav.jsx` | Navegação inferior (mobile) |
| ServiceCard | `ServiceCard.jsx` | Card de serviço |
| TestimonialCard | `TestimonialCard.jsx` | Card de depoimento |
| NewsCard | `NewsCard.jsx` | Card de notícia/blog |
| FaqItem | `FaqItem.jsx` | Item de FAQ |
| ResponsiveTable | `ResponsiveTable.jsx` | Tabela responsiva |
| RouteTransition | `RouteTransition.jsx` | Transição de rota animada |
| RouteAnimationWrapper | `RouteAnimationWrapper.jsx` | Wrapper de animação de rota |
| CommunicationCenter | `CommunicationCenter.jsx` | Central de comunicação |
| MobileBackButton | `MobileBackButton.jsx` | Botão voltar (mobile) |
| UserNotRegisteredError | `UserNotRegisteredError.jsx` | Tela de erro de usuário não registrado |

---

## 6. Lib e Hooks

### `src/lib/`
| Arquivo | Descrição |
|---------|-----------|
| `AuthContext.jsx` | Contexto de autenticação (login/logout/auth state) |
| `NavigationTracker.jsx` | Rastreamento de navegação para analytics |
| `PageNotFound.jsx` | Página 404 |
| `app-params.js` | Parâmetros da aplicação |
| `query-client.js` | Configuração do React Query |
| `utils.js` | Utilitários gerais (cn, formatters) |

### `src/hooks/`
| Arquivo | Descrição |
|---------|-----------|
| `use-mobile.jsx` | Hook para detecção de mobile |

---

## 7. Configuração

### Stack
- **Build:** Vite + `@base44/vite-plugin`
- **React:** 18+ com `@vitejs/plugin-react`
- **CSS:** Tailwind CSS + `tailwindcss-animate`
- **UI:** shadcn/ui (estilo New York, base neutral, variáveis CSS)
- **Roteamento:** React Router DOM (BrowserRouter)
- **Data:** TanStack React Query
- **Auth:** Base44 AuthContext + Supabase
- **Ícones:** Lucide React

### Tailwind
- Dark mode: `class`
- Content: `index.html`, `src/**/*.{ts,tsx,js,jsx}`
- Tema: HSL CSS variables (background, foreground, card, popover, primary, secondary, muted, accent, destructive, chart, sidebar)
- Animações: accordion-down/up

### shadcn/ui (components.json)
- Style: New York
- TSX: false (JSX)
- Base color: neutral
- CSS variables: true
- Icon library: Lucide

---

## 8. Observações

- O repositório legado é um app Base44 completo com multitenancy, RBAC, PWA, IA/ML, analytics, VoIP (VoxImplant), e mais de 30 sprints de desenvolvimento.
- O site HTML estático atual (`index.html`, `about-us.html`, etc.) corresponde à versão pública/marketing do mesmo produto ("Contaux Contadoria").
- A pasta `legacy/src/components/contaux-github-pages/` contém os mesmos arquivos HTML estáticos do site atual, confirmando que ambos são do mesmo projeto.
- As funções backend usam Deno + `@base44/sdk` e rodam na infraestrutura Base44.
