# Spec — Módulo 3: Financeiro

## Objetivo
Gestão financeira completa: faturamento, orçamentos, pagamentos, fluxo de caixa, vendas e prestação de serviços.

## Páginas
| Rota | Descrição |
|------|-----------|
| `/faturamento` | Lista e gestão de faturas |
| `/orcamentos` | Lista e gestão de orçamentos |
| `/pagamentos` | Lista e gestão de pagamentos |
| `/vendas` | Oportunidades de venda (pipeline) |
| `/fluxo-caixa` | Fluxo de caixa atual |
| `/fluxo-caixa/previsao` | Previsão de fluxo de caixa |
| `/transacoes` | Transações bancárias |
| `/servicos` | Prestação de serviços |

## Componentes (máx. 200 linhas cada)
| Componente | Responsabilidade |
|------------|----------------|
| `InvoiceList` | Lista de faturas com filtros (status, cliente, data) |
| `InvoiceForm` | Formulário de fatura (cliente, itens, valores, vencimento) |
| `InvoicePDF` | Geração de PDF da fatura |
| `QuoteList` | Lista de orçamentos |
| `QuoteForm` | Formulário de orçamento |
| `QuotePDF` | Geração de PDF do orçamento |
| `PaymentList` | Lista de pagamentos com status |
| `PaymentForm` | Registro de pagamento |
| `CashFlowChart` | Gráfico de fluxo de caixa (entradas/saídas) |
| `CashFlowForecast` | Previsão de fluxo de caixa |
| `SalesPipeline` | Kanban de oportunidades de venda |
| `ServiceList` | Lista de serviços prestados |

## Entidades
```
Invoice {
  number, client_id, issue_date, due_date,
  items [{ description, quantity, unit_price, total }],
  subtotal, discount, tax, total, status (draft/sent/paid/overdue/cancelled),
  workspace_id, created_date
}

Quote {
  number, client_id, issue_date, valid_until,
  items [{ description, quantity, unit_price, total }],
  subtotal, discount, total, status (draft/sent/accepted/rejected/expired),
  workspace_id, created_date
}

Payment {
  invoice_id (optional), client_id, amount, payment_date,
  method (pix/boleto/transfer/cash/card), status (pending/confirmed/rejected),
  reference, workspace_id, created_date
}

Transaction {
  bank_account_id, date, description, amount, type (credit/debit),
  category, reconciled, workspace_id
}

SalesOpportunity {
  client_id, title, value, stage (lead/qualified/proposal/negotiation/won/lost),
  probability, expected_close_date, workspace_id
}

Service {
  name, description, price, billing_cycle (monthly/quarterly/annual/one_time),
  client_id, active, workspace_id
}
```

## Regras de negócio
1. **Conversão Quote → Invoice:** Cria fatura a partir de orçamento aceito
2. **Status de fatura:** draft → sent → paid (ou overdue se vencida)
3. **Cálculo de impostos:** Baseado no regime tributário do cliente
4. **Conciliação:** Match automático de transações com faturas por valor + data
5. **Previsão de caixa:** Baseado em faturas a vencer + pagamentos recorrentes
6. **Numeração:** Sequencial automático por workspace

## Funções backend
| Função | Descrição |
|--------|-----------|
| `convertQuoteToInvoice` | Converte orçamento em fatura |
| `generateInvoicePDF` | Gera PDF da fatura |
| `generateQuotePDF` | Gera PDF do orçamento |
| `generatePaymentReceipt` | Gera recibo de pagamento |
| `updateInvoicePaymentStatus` | Atualiza status ao registrar pagamento |
| `sendInvoiceNotifications` | Envia notificação de fatura ao cliente |
| `sendInvoiceReminder` | Envia lembrete de fatura vencida |
| `sendPaymentReceivedNotifications` | Confirma recebimento ao cliente |
| `syncBankData` | Sincroniza transações bancárias |

## Referência legada
- `legacy/src/pages/Invoicing.jsx`
- `legacy/src/pages/Quotes.jsx`
- `legacy/src/pages/Payments.jsx`
- `legacy/src/pages/CashFlow.jsx`
- `legacy/src/pages/CashFlowForecast.jsx`
- `legacy/src/pages/Transactions.jsx`
- `legacy/src/pages/Sales.jsx`
- `legacy/src/pages/Services.jsx`
- `legacy/src/components/dashboard/InvoiceForm.jsx`
- `legacy/src/components/dashboard/InvoiceList.jsx`
- `legacy/src/components/dashboard/QuoteForm.jsx`
- `legacy/src/components/dashboard/QuoteList.jsx`
- `legacy/src/components/dashboard/PaymentForm.jsx`
- `legacy/src/components/dashboard/PaymentList.jsx`
- `legacy/base44/functions/convertQuoteToInvoice/entry.ts`
- `legacy/base44/functions/generateInvoicePDF/entry.ts`

## Critérios de aceite
- [ ] CRUD de faturas com numeração automática
- [ ] CRUD de orçamentos
- [ ] Conversão orçamento → fatura
- [ ] Geração de PDF (fatura, orçamento, recibo)
- [ ] Registro de pagamentos
- [ ] Status automático: overdue para faturas vencidas
- [ ] Fluxo de caixa com gráfico (entradas vs saídas)
- [ ] Pipeline de vendas (Kanban)
- [ ] Filtros e busca em todas as listas
- [ ] Dark mode + mobile 373px
