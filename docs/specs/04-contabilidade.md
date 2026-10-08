# Spec — Módulo 4: Contabilidade

## Objetivo
Gestão contábil completa: plano de contas, lançamentos, conciliação bancária, notas fiscais, calendário contábil e importação.

## Páginas
| Rota | Descrição |
|------|-----------|
| `/lancamentos` | Lançamentos contábeis |
| `/plano-contas` | Plano de contas |
| `/conciliacao` | Conciliação bancária |
| `/baixa-manual` | Baixa manual de títulos |
| `/notas-fiscais` | Notas fiscais (NFe) |
| `/calendario-contabil` | Calendário de obrigações |
| `/importacao-csv` | Importação de dados |

## Componentes (máx. 200 linhas cada)
| Componente | Responsabilidade |
|------------|----------------|
| `ChartOfAccountsTree` | Árvore hierárquica do plano de contas |
| `AccountForm` | Criar/editar conta no plano |
| `JournalEntryList` | Lista de lançamentos |
| `JournalEntryForm` | Formulário de lançamento (débito/crédito) |
| `BankReconciliation` | Interface de conciliação (match manual) |
| `ManualPostingForm` | Baixa manual de título |
| `TaxInvoiceList` | Lista de notas fiscais |
| `TaxInvoiceForm` | Emissão de nota fiscal |
| `AccountingCalendar` | Calendário de obrigações fiscais |
| `CSVUploader` | Upload e preview de CSV |

## Entidades
```
Account {
  code, name, type (asset/liability/equity/revenue/expense),
  parent_id, level, active, workspace_id
}

JournalEntry {
  date, description, reference,
  lines [{ account_id, debit, credit, description }],
  status (draft/posted/cancelled), workspace_id, created_date
}

BankReconciliation {
  bank_account_id, statement_date,
  transactions [], matched [], unmatched [],
  status (pending/in_progress/completed), workspace_id
}

TaxInvoice {
  number, model (55/65), series, issue_date,
  client_id, items [], taxes { icms, pis, cofins, iss, irpj },
  total, status (draft/issued/cancelled), workspace_id
}

AccountingCalendar {
  title, description, due_date, type (federal/state/municipal),
  frequency (monthly/quarterly/annual), status (pending/done/overdue),
  workspace_id
}
```

## Regras de negócio
1. **Partida dobrada:** Todo lançamento deve ter débito = crédito
2. **Plano de contas:** Hierárquico (conta pai → contas filhas)
3. **Conciliação:** Match por valor + data ± 1 dia
4. **NFe:** Validação de campos obrigatórios antes de emitir
5. **Calendário:** Obrigações recorrentes geradas automaticamente
6. **Período contábil:** Lançamentos não podem ser editados após fechamento

## Funções backend
| Função | Descrição |
|--------|-----------|
| `generateNFe` | Gera Nota Fiscal Eletrônica |
| `validateInvoiceNumber` | Valida número de nota fiscal |
| `syncBankData` | Sincroniza extrato bancário |
| `exportToCSV` | Exporta lançamentos |

## Referência legada
- `legacy/src/pages/Entries.jsx`
- `legacy/src/pages/ChartOfAccounts.jsx`
- `legacy/src/pages/BankReconciliation.jsx`
- `legacy/src/pages/ManualPosting.jsx`
- `legacy/src/pages/TaxInvoices.jsx`
- `legacy/src/pages/AccountingCalendar.jsx`
- `legacy/src/pages/ImportCSV.jsx`
- `legacy/src/components/dashboard/ChartOfAccountsForm.jsx`
- `legacy/src/components/dashboard/ChartOfAccountsList.jsx`
- `legacy/src/components/dashboard/JournalEntryForm.jsx`
- `legacy/src/components/dashboard/JournalEntryList.jsx`
- `legacy/src/components/dashboard/BankReconciliationForm.jsx`
- `legacy/src/components/dashboard/BankReconciliationList.jsx`
- `legacy/src/components/dashboard/AccountingCalendarForm.jsx`
- `legacy/src/components/dashboard/AccountingCalendarList.jsx`
- `legacy/base44/functions/generateNFe/entry.ts`

## Critérios de aceite
- [ ] Plano de contas hierárquico (CRUD)
- [ ] Lançamentos com partida dobrada (validação débito=crédito)
- [ ] Conciliação bancária (match manual + automático)
- [ ] Baixa manual de títulos
- [ ] Emissão de NFe (mínimo: geração de XML/Danfe)
- [ ] Calendário de obrigações fiscais
- [ ] Importação CSV com preview e validação
- [ ] Dark mode + mobile 373px
