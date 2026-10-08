# Spec — Módulo 5: Suporte (Tickets, Jurídico, Balcão Virtual)

## Objetivo
Gestão de tickets de suporte, processos jurídicos e atendimento via balcão virtual (chat).

## Páginas
| Rota | Descrição |
|------|-----------|
| `/tickets` | Lista de tickets de suporte |
| `/tickets/:id` | Detalhe do ticket (conversa, anexos) |
| `/processos` | Processos jurídicos |
| `/balcao-virtual` | Balcão virtual (chat ao vivo) |

## Componentes (máx. 200 linhas cada)
| Componente | Responsabilidade |
|------------|----------------|
| `TicketList` | Lista de tickets com filtros (status, prioridade, cliente) |
| `TicketForm` | Criar/editar ticket |
| `TicketDetail` | Conversa + anexos + histórico de status |
| `LegalProcessList` | Lista de processos jurídicos |
| `LegalProcessForm` | Formulário de processo |
| `VirtualCounter` | Interface de chat do balcão virtual |
| `ChatMessage` | Mensagem individual do chat |
| `ChatInput` | Input de mensagem com anexos |

## Entidades
```
Ticket {
  client_id, subject, description, priority (low/medium/high/urgent),
  status (open/in_progress/resolved/closed), category,
  assigned_to, messages [], attachments [],
  workspace_id, created_date, resolved_date
}

LegalProcess {
  client_id, process_number, court, subject, status (active/suspended/concluded),
  start_date, lawyer, value, notes [],
  documents [], workspace_id, created_date
}

VirtualCounterConversation {
  client_id, started_at, ended_at, status (active/closed),
  messages [], workspace_id
}

VirtualCounterMessage {
  conversation_id, sender (client/agent), content, type (text/file),
  created_date
}
```

## Regras de negócio
1. **SLA de tickets:** Urgente (4h), High (8h), Medium (24h), Low (48h)
2. **Notificação:** Agente notificado ao receber novo ticket
3. **Balcão virtual:** Chat em tempo real, fila de espera, transferência
4. **Processos:** Alerta de prazos próximos

## Funções backend
| Função | Descrição |
|--------|-----------|
| `sendNotifications` | Notifica agente de novo ticket |
| `presenceTracking` | Rastreia agentes online no balcão |

## Referência legada
- `legacy/src/pages/Tickets.jsx`
- `legacy/src/pages/LegalProcesses.jsx`
- `legacy/src/pages/VirtualCounter.jsx` (216 linhas)
- `legacy/src/components/dashboard/LegalProcessForm.jsx`
- `legacy/src/components/dashboard/LegalProcessList.jsx`
- `legacy/src/components/virtualCounter/` (subdiretório)

## Critérios de aceite
- [ ] CRUD de tickets com SLA
- [ ] Conversa dentro do ticket (mensagens)
- [ ] Anexos no ticket
- [ ] CRUD de processos jurídicos
- [ ] Balcão virtual com chat (mínimo: mensagens em tempo real)
- [ ] Filtros e busca em todas as listas
- [ ] Dark mode + mobile 373px
