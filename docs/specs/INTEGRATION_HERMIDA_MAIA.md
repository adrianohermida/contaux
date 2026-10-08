# Integração Contaux × Hermida Maia Advocacia

## Visão Geral

O app **Hermida Maia Advocacia** (Base44 app id `6a922f5b2b48868a43a6f5cd`) é uma plataforma multi-escritório onde advogados autônomos e escritórios parceiros gerenciam processos, clientes e prazos. O app **Contaux** é a plataforma de contadoria que presta serviços contábeis para escritórios de advocacia.

A integração permite:
1. Escritórios e advogados da Hermida Maia solicitam serviços de contadoria da Contaux
2. Clientes dos escritórios da Hermida Maia também podem solicitar serviços da Contaux
3. Intercâmbio de dados: processos, publicações, prazos de recolhimento de custas
4. Isolamento multitenant e multiescritório

---

## Arquitetura

```
┌─────────────────────────────┐         ┌─────────────────────────────┐
│   Hermida Maia (Base44)     │         │      Contaux (Imported)     │
│                             │         │                             │
│  ┌───────────────────────┐  │  API   │  ┌───────────────────────┐  │
│  │ Backend Function:     │──┼────────┼─>│ POST /api/integration/ │  │
│  │ requestAccounting()   │  │  Key   │  │   service-requests     │  │
│  └───────────────────────┘  │  Auth   │  └───────────────────────┘  │
│                             │         │                             │
│  ┌───────────────────────┐  │ Webhook│  ┌───────────────────────┐  │
│  │ Webhook receiver:      │<──┼────────┼──│ POST /api/integration/ │  │
│  │ /api/contaux/webhook   │  │  Push  │  │   push-update          │  │
│  └───────────────────────┘  │         │  └───────────────────────┘  │
│                             │         │                             │
│  ┌───────────────────────┐  │  Sync   │  ┌───────────────────────┐  │
│  │ Backend Function:     │──┼────────┼─>│ GET /api/integration/   │  │
│  │ syncCaseData()        │  │  Pull  │  │   cases/:officeId       │  │
│  └───────────────────────┘  │         │  └───────────────────────┘  │
└─────────────────────────────┘         └─────────────────────────────┘
```

### Autenticação
- **API Key por escritório**: Cada escritório parceiro na Hermida Maia recebe uma `partner_api_key` única da Contaux
- **Header**: `X-Partner-Key: <key>` em toda requisição
- **Isolamento**: O `office_id` da Hermida Maia é validado contra a API key

### Fluxo de Dados
1. **Hermida Maia → Contaux**: Solicitação de serviço (contabilidade, imposto, custas)
2. **Contaux → Hermida Maia**: Push de atualizações (prazos, status, documentos)
3. **Bidirecional**: Sincronização de dados de processos e publicações

---

## O que implementar no app Hermida Maia

### 1. Entidades (Base44 Entities)

#### `contaux_service_request`
Solicitações de serviços de contadoria enviadas à Contaux.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `office_id` | text | ID do escritório na Hermida Maia (multitenant) |
| `requested_by` | text | ID do advogado ou cliente solicitante |
| `requester_type` | text | `lawyer` ou `client` |
| `requester_name` | text | Nome do solicitante |
| `service_type` | text | `accounting`, `tax`, `custas`, `payroll`, `consulting` |
| `case_number` | text | Número do processo relacionado (opcional) |
| `description` | text | Descrição da solicitação |
| `priority` | text | `low`, `medium`, `high`, `urgent` |
| `status` | text | `pending`, `accepted`, `in_progress`, `completed`, `rejected` |
| `contaux_ticket_id` | text | ID retornado pela Contaux ao criar a solicitação |
| `deadline` | date | Prazo solicitado |
| `metadata` | object | Dados extras (JSON) |

#### `contaux_custas_deadline`
Prazos de recolhimento de custas sincronizados da Contaux.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `office_id` | text | ID do escritório |
| `case_number` | text | Número do processo |
| `custas_type` | text | Tipo de custas |
| `amount` | number | Valor a recolher |
| `due_date` | date | Prazo de recolhimento |
| `status` | text | `pending`, `paid`, `overdue` |
| `contaux_id` | text | ID na Contaux |
| `synced_at` | datetime | Última sincronização |

#### `contaux_sync_log`
Log de sincronização de dados entre os apps.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `office_id` | text | ID do escritório |
| `sync_type` | text | `cases`, `publications`, `custas`, `service_request` |
| `direction` | text | `push` ou `pull` |
| `records_count` | number | Quantidade de registros |
| `status` | text | `success`, `error` |
| `error_message` | text | Mensagem de erro (se houver) |
| `synced_at` | datetime | Timestamp |

### 2. Backend Functions (Base44)

#### `requestAccountingService`
Solicita um serviço de contadoria à Contaux.

```javascript
// Parâmetros
{
  office_id: "string",        // escritório solicitante
  service_type: "string",     // accounting | tax | custas | payroll | consulting
  requester_id: "string",     // advogado ou cliente
  requester_type: "string",   // lawyer | client
  case_number: "string?",     // processo relacionado
  description: "string",
  priority: "string",        // low | medium | high | urgent
  deadline: "date?"
}

// Fluxo:
// 1. Cria registro em contaux_service_request
// 2. POST /api/integration/service-requests na Contaux com X-Partner-Key
// 3. Atualiza contaux_ticket_id com o ID retornado
// 4. Retorna status da solicitação
```

#### `syncCaseDataToContaux`
Envia dados de processos/publicações para a Contaux.

```javascript
// Parâmetros
{
  office_id: "string",
  case_number: "string",
  case_data: {
    parties: "string[]",
    court: "string",
    subject: "string",
    value: "number",
    status: "string",
    publications: [{
      date: "date",
      content: "string",
      type: "string"
    }]
  }
}

// Fluxo:
// 1. POST /api/integration/cases na Contaux
// 2. Registra em contaux_sync_log
```

#### `receiveContauxUpdate`
Webhook receiver para atualizações da Contaux.

```javascript
// Recebe POST da Contaux com:
{
  office_id: "string",
  update_type: "custas_deadline" | "service_status" | "document_ready",
  data: { ... }
}

// Fluxo:
// 1. Valida X-Partner-Key
// 2. Atualiza contaux_custas_deadline ou contaux_service_request
// 3. Notifica o escritório/advogado
```

#### `getContauxServiceStatus`
Consulta status de serviços solicitados.

```javascript
// Parâmetros
{
  office_id: "string",
  ticket_id: "string"
}

// Fluxo:
// 1. GET /api/integration/service-requests/:ticket_id na Contaux
// 2. Retorna status atualizado
```

### 3. Configuração

#### Settings (Base44 Settings singleton)
```json
{
  "contaux_api_url": "https://api.contaux.com.br",
  "contaux_partner_key": "tx_partner_xxxxx",
  "contaux_webhook_secret": "whsec_xxxxx",
  "integration_enabled": true
}
```

#### Per-Office Config
Cada escritório precisa ter:
```json
{
  "contaux_partner_key": "tx_partner_xxxxx",  // chave única por escritório
  "contaux_enabled": true
}
```

### 4. UI (Pages/Components)

#### Página "Serviços de Contadoria"
- Lista de solicitações (`contaux_service_request`) filtrada por `office_id`
- Botão "Solicitar Serviço" → formulário com tipo de serviço, descrição, prazo
- Detalhe de cada solicitação com status e histórico
- Aba "Prazos de Custas" → `contaux_custas_deadline` com alertas de vencimento
- Aba "Sincronização" → `contaux_sync_log` com status de sync

#### Botão no detalhe do processo
- "Enviar à Contaux" → envia dados do processo para a Contaux
- "Solicitar Custas" → cria solicitação de serviço tipo `custas`

#### Notificações
- Alerta quando Contaux atualiza status de serviço
- Alerta quando prazo de custas está próximo

---

## O que implementar no app Contaux (este repositório)

### 1. Migração: Tabelas de Integração

```sql
-- Tabela de escritórios parceiros
CREATE TABLE IF NOT EXISTS partner_offices (
  id SERIAL PRIMARY KEY,
  external_id TEXT NOT NULL UNIQUE,      -- office_id da Hermida Maia
  name TEXT NOT NULL,
  api_key TEXT NOT NULL UNIQUE,           -- X-Partner-Key
  webhook_url TEXT,                       -- URL para push de atualizações
  contact_email TEXT,
  contact_phone TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de solicitações de serviço (recebidas de parceiros)
CREATE TABLE IF NOT EXISTS partner_service_requests (
  id SERIAL PRIMARY KEY,
  partner_office_id INTEGER REFERENCES partner_offices(id) ON DELETE CASCADE,
  external_requester_id TEXT NOT NULL,    -- ID do advogado/cliente na Hermida Maia
  requester_type TEXT NOT NULL,           -- 'lawyer' | 'client'
  requester_name TEXT NOT NULL,
  service_type TEXT NOT NULL,             -- 'accounting' | 'tax' | 'custas' | 'payroll' | 'consulting'
  case_number TEXT,                        -- processo relacionado
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending',          -- pending | accepted | in_progress | completed | rejected
  deadline DATE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de dados de processos sincronizados
CREATE TABLE IF NOT EXISTS partner_cases (
  id SERIAL PRIMARY KEY,
  partner_office_id INTEGER REFERENCES partner_offices(id) ON DELETE CASCADE,
  case_number TEXT NOT NULL,
  court TEXT,
  subject TEXT,
  parties JSONB DEFAULT '[]',
  value NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active',
  publications JSONB DEFAULT '[]',
  synced_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(partner_office_id, case_number)
);

-- Tabela de prazos de custas
CREATE TABLE IF NOT EXISTS partner_custas (
  id SERIAL PRIMARY KEY,
  partner_office_id INTEGER REFERENCES partner_offices(id) ON DELETE CASCADE,
  partner_case_id INTEGER REFERENCES partner_cases(id) ON DELETE SET NULL,
  case_number TEXT,
  custas_type TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'pending',          -- pending | paid | overdue
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 2. API Routes: `/api/integration/*`

- `POST /api/integration/service-requests` — Receber solicitação de serviço
- `GET /api/integration/service-requests/:id` — Consultar status
- `PUT /api/integration/service-requests/:id` — Atualizar status
- `POST /api/integration/cases` — Receber dados de processo
- `GET /api/integration/cases/:officeId` — Listar processos sincronizados
- `POST /api/integration/custas` — Registrar prazo de custas
- `GET /api/integration/custas/:officeId` — Listar prazos
- `POST /api/integration/push-update` — Push de atualização para Hermida Maia
- `GET /api/integration/offices` — Listar escritórios parceiros (admin)
- `POST /api/integration/offices` — Cadastrar escritório parceiro (admin)
- `DELETE /api/integration/offices/:id` — Desativar escritório parceiro (admin)

### 3. Middleware de Autenticação

```javascript
// Valida X-Partner-Key em toda rota /api/integration/*
async function partnerAuth(req, res, next) {
  const key = req.headers['x-partner-key'];
  if (!key) return res.status(401).json({ error: 'X-Partner-Key header required' });
  
  const office = await db.query(
    'SELECT * FROM partner_offices WHERE api_key = $1 AND active = true',
    [key]
  );
  if (!office.rows.length) return res.status(403).json({ error: 'Invalid partner key' });
  
  req.partnerOffice = office.rows[0];
  next();
}
```

### 4. Dashboard: Página de Parceiros

Nova página em `Admin → Parceiros` para:
- Listar escritórios parceiros cadastrados
- Gerar/revogar API keys
- Visualizar solicitações de serviço recebidas
- Visualizar processos sincronizados
- Gerenciar prazos de custas

---

## Fluxo Completo de Integração

### 1. Cadastro de Escritório Parceiro
```
Hermida Maia admin → Contaux admin cadastra escritório
Contaux gera API key → Hermida Maia configura em Settings
```

### 2. Solicitação de Serviço
```
Advogado na Hermida Maia → clica "Solicitar Serviço de Contadoria"
Hermida Maia backend → POST /api/integration/service-requests (X-Partner-Key)
Contaux → cria solicitação, retorna ID
Hermida Maia → armazena contaux_ticket_id
Contaux dashboard → aparece em "Solicitações de Parceiros"
Contaux contador → aceita e processa
Contaux → push update para Hermida Maia (status: in_progress)
Hermida Maia → notifica advogado
Contaux → conclui serviço
Contaux → push update (status: completed)
Hermida Maia → notifica advogado e cliente
```

### 3. Sincronização de Processos
```
Hermida Maia → syncCaseDataToContaux (case_number, parties, court, publications)
Contaux → armazena em partner_cases
Contaux contador → visualiza processo vinculado à solicitação
Contaux → calcula custas → cria partner_custas
Contaux → push update para Hermida Maia (custas_deadline)
Hermida Maia → cria contaux_custas_deadline → alerta advogado
```

### 4. Isolamento Multitenant
- Cada `partner_office_id` isola todos os dados (service_requests, cases, custas)
- A API key valida o escritório em toda requisição
- O `office_id` da Hermida Maia é mapeado para `partner_offices.external_id`
- Clientes de um escritório não veem dados de outro escritório
- O `requester_type` (lawyer/client) controla quem pode solicitar

---

## Checklist de Implementação

### Contaux (este repositório)
- [x] Migração 004: tabelas partner_offices, partner_service_requests, partner_cases, partner_custas
- [x] Middleware partnerAuth
- [x] Routes /api/integration/*
- [x] Dashboard: página de Parceiros em Admin
- [ ] Documentação de API para o time da Hermida Maia

### Hermida Maia (Base44 app)
- [ ] Entidade `contaux_service_request`
- [ ] Entidade `contaux_custas_deadline`
- [ ] Entidade `contaux_sync_log`
- [ ] Backend Function `requestAccountingService`
- [ ] Backend Function `syncCaseDataToContaux`
- [ ] Backend Function `receiveContauxUpdate`
- [ ] Backend Function `getContauxServiceStatus`
- [ ] Settings: contaux_api_url, contaux_partner_key, contaux_webhook_secret
- [ ] Página "Serviços de Contadoria"
- [ ] Botão "Enviar à Contaux" no detalhe do processo
- [ ] Notificações de status e prazos
