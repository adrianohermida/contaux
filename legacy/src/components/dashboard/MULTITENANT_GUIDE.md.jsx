# 🔐 Guia de Isolamento Multitenant

## 1. ARQUITETURA

### Estrutura de Usuários
```
Workspace (Tenant)
├── Internal Users (user_type: 'internal')
│   ├── Admin - acesso total ao Dashboard
│   ├── Advogado - acesso a Processos, Contratos, Documentos
│   └── Contador - acesso a Faturas, Pagamentos, Contabilidade
└── Client Users (user_type: 'client')
    └── Cliente - acesso apenas ao MeuPainel (dados próprios)
```

## 2. REGRAS DE ACESSO

### Internal Users (Equipe)
- ✅ Dashboard completo
- ✅ Todos clientes do workspace
- ✅ Processos, faturas, documentos
- ❌ Nunca outro workspace

### Client Users (Clientes)
- ✅ MeuPainel (restrito)
- ✅ Faturas próprias
- ❌ Dashboard negado

## 3. ENTIDADES COM WORKSPACE_ID

- User (novo)
- Workspace (novo)
- AccessLog (novo)
- Client, Invoice, Payment, Quote, LegalProcess, Ticket, ChatMessage, BankAccount, Service, JournalEntry

## 4. ROTAS PROTEGIDAS

```javascript
// Dashboard → ProtectedInternalRoute
<ProtectedInternalRoute><Dashboard /></ProtectedInternalRoute>

// MeuPainel → ProtectedClientRoute
<ProtectedClientRoute><ClientPortal /></ProtectedClientRoute>
```

## 5. AUDITORIA

```javascript
await base44.functions.invoke('auditUsers', { action: 'all' });
```

Valida: workspace_ids, user_types, isolamento, anomalias.