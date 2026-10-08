# Spec — Módulo 1: Dashboard

## Objetivo
Painel principal com visão geral do escritório contábil: KPIs, atividades recentes, alertas e atalhos.

## Páginas
| Rota | Descrição |
|------|-----------|
| `/dashboard` | Dashboard principal |

## Componentes (máx. 200 linhas cada)
| Componente | Responsabilidade |
|------------|----------------|
| `DashboardStats` | Cards de KPIs (clientes ativos, faturas pendentes, receita do mês, tickets abertos) |
| `DashboardActivity` | Timeline de atividades recentes (novos clientes, pagamentos, tickets) |
| `DashboardSales` | Resumo de vendas do mês com gráfico simples |
| `DashboardAlerts` | Alertas importantes (faturas vencidas, obrigações fiscais) |
| `DashboardShortcuts` | Atalhos rápidos para ações frequentes |

## Entidades referenciadas
- `Client` (count ativos)
- `Invoice` (count pendentes + soma valor)
- `Payment` (soma recebido no mês)
- `Ticket` (count abertos)
- `Notification` (não lidas)

## Regras de negócio
- KPIs calculados no backend (função Base44), não no frontend
- Dados cached por 5 minutos (React Query staleTime)
- Atualização manual via botão "Atualizar"

## Referência legada
- `legacy/src/pages/Dashboard.jsx` (69 linhas — simples e bom ponto de partida conceitual)
- `legacy/src/components/dashboard/DashboardStatsRow.jsx`
- `legacy/src/components/dashboard/DashboardActivityRow.jsx`

## Critérios de aceite
- [ ] Carrega em < 2s com dados reais
- [ ] 4 KPI cards responsivos (1 col mobile, 4 col desktop)
- [ ] Timeline mostra últimas 10 atividades
- [ ] Botão de atualizar funciona
- [ ] Dark mode
- [ ] Mobile 373px
