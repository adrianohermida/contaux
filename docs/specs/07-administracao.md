# Spec — Módulo 7: Administração

## Objetivo
Configurações do workspace, segurança, logs de auditoria, automações, gestão de documentos e relatórios.

## Páginas
| Rota | Descrição |
|------|-----------|
| `/configuracoes` | Configurações gerais do workspace |
| `/seguranca` | Centro de segurança |
| `/auditoria` | Logs de auditoria |
| `/automacoes` | Automações e workflows |
| `/documentos` | Gestão de documentos |
| `/relatorios` | Relatórios e analytics |

## Componentes (máx. 200 linhas cada)
| Componente | Responsabilidade |
|------------|----------------|
| `SettingsTabs` | Abas: branding, usuários, integrações, notificações |
| `BrandingSettings` | Logo, cores, nome do workspace |
| `UserManagement` | Lista de usuários e papéis |
| `RoleManager` | Gestão de papéis e permissões (RBAC) |
| `IntegrationHub` | Gestão de integrações (Google, Stripe, etc.) |
| `SecurityDashboard` | Visão de segurança (MFA, sessões, ameaças) |
| `AuditLogList` | Logs de auditoria com filtros |
| `WorkflowList` | Lista de automações |
| `WorkflowBuilder` | Construtor de automação (visual) |
| `DocumentList` | Lista de documentos com categorias |
| `ReportBuilder` | Construtor de relatórios customizados |
| `AnalyticsDashboard` | Dashboard de analytics com gráficos |

## Entidades
```
WorkspaceSettings {
  name, logo_url, primary_color, secondary_color,
  timezone, locale (pt-BR), fiscal_settings {},
  workspace_id
}

User {
  name, email, role (admin/manager/accountant/viewer),
  workspace_id, mfa_enabled, last_login, active
}

Role {
  name, permissions [], description, workspace_id
}

AuditLog {
  user_id, action, entity_type, entity_id,
  details {}, ip_address, timestamp, workspace_id
}

Workflow {
  name, trigger (event/schedule/manual),
  conditions [], actions [], active, workspace_id
}

Webhook {
  url, events [], secret, active, workspace_id
}

IntegrationLog {
  integration, event, status, details, timestamp, workspace_id
}

DocumentTemplate {
  name, type, content, variables [], workspace_id
}

Report {
  name, type, filters {}, schedule, format (pdf/csv/xlsx),
  workspace_id
}
```

## Regras de negócio
1. **RBAC:** 4 papéis padrão: admin, manager, accountant, viewer
2. **MFA:** Opcional por usuário, TOTP
3. **Audit log:** Toda ação de escrita registrada (quem, o quê, quando)
4. **Automação:** Trigger → condições → ações (sem código)
5. **Relatórios:** Agendados ou sob demanda, PDF/CSV/XLSX
6. **LGPD:** Exportação e exclusão de dados pessoais sob solicitação

## Funções backend
| Função | Descrição |
|--------|-----------|
| `advancedRBAC` | Verifica permissão granular |
| `generateMFASecret` | Gera secret TOTP |
| `verifyMFAToken` | Verifica token TOTP |
| `createAuditLog` | Registra ação no log |
| `auditUsers` | Auditoria de usuários |
| `executeWorkflow` | Executa workflow de automação |
| `generateAnalyticsReport` | Gera relatório de analytics |
| `generatePDFReport` | Gera relatório em PDF |
| `generateComparisonReport` | Relatório comparativo |
| `exportToCSV` | Exporta dados para CSV |
| `emailTemplateEngine` | Renderiza template de email |
| `webhookIntegration` | Dispara webhook |

## Integrações
| Integração | Status | Conector |
|------------|--------|----------|
| Google Calendar | Disponível | Workspace connector ID: `6aa3d06b9eef4351876cbef5` |
| Stripe | Disponível | Payment provider (região BR) |
| Google Sheets | Referência | `syncGoogleSheets` no legado |

## Referência legada
- `legacy/src/pages/SettingsPage.jsx` (237 linhas)
- `legacy/src/pages/SecurityCenter.jsx` (356 linhas)
- `legacy/src/pages/AuditLogs.jsx` (231 linhas)
- `legacy/src/pages/Automations.jsx`
- `legacy/src/pages/DocumentManagement.jsx` (251 linhas)
- `legacy/src/pages/Reports.jsx`
- `legacy/src/pages/ReportsAnalytics.jsx` (334 linhas)
- `legacy/src/components/rbac/` (PermissionMatrix, RoleManager, UserManagement)
- `legacy/src/components/settings/` (BrandingSettings, LanguageSwitcher)
- `legacy/src/components/integrations/` (GoogleCalendarSync, StripeSetup, etc.)
- `legacy/src/components/automation/` (AutomationDashboard, WorkflowBuilder)
- `legacy/base44/functions/advancedRBAC/entry.ts`
- `legacy/base44/functions/generateMFASecret/entry.ts`

## Critérios de aceite
- [ ] Configurações de branding (logo, cores, nome)
- [ ] Gestão de usuários e papéis (RBAC)
- [ ] MFA opcional (TOTP)
- [ ] Logs de auditoria com filtros
- [ ] Builder de automações (trigger → condição → ação)
- [ ] Gestão de documentos com templates
- [ ] Relatórios customizados (PDF/CSV)
- [ ] Dashboard de analytics
- [ ] Integração Google Calendar funcional
- [ ] Dark mode + mobile 373px
