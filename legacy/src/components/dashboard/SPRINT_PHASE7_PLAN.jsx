# 🚀 SPRINT FASE 7 - CONTACT RELATIONSHIPS & NOTES
**Data Início**: 2026-02-21  
**Prioridade**: ALTA  
**Complexidade**: MÉDIA-ALTA  
**Tempo Estimado**: 6-8 horas

---

## 🎯 OBJETIVOS DA FASE 7

### 1. Contact Notes System
**Prioridade**: ALTA  
**Tempo**: 2h

**Funcionalidades**:
- Adicionar notas a contatos
- Timeline de notas (ordenada por data)
- Editar/deletar notas
- Rich text editor (opcional) ou textarea simples
- Autor da nota (created_by)
- Tags nas notas (opcional)

**Entity**: `ContactNote`
```json
{
  "workspace_id": "string",
  "contact_id": "string",
  "content": "string",
  "note_type": "enum (general, call, meeting, email, task)",
  "created_by": "string (auto)",
  "is_pinned": "boolean"
}
```

**Componentes**:
- `ContactNotesList.jsx` - Timeline de notas
- `ContactNoteForm.jsx` - Criar/editar nota
- `ContactNoteItem.jsx` - Item individual da nota

**Integração**:
- Adicionar tab "Notas" em ContactDetails
- Contador de notas no ContactCard (opcional)

---

### 2. Contact Activity Timeline
**Prioridade**: MÉDIA  
**Tempo**: 2h

**Funcionalidades**:
- Timeline unificada de atividades
- Mostra: notas, edições, tags adicionadas/removidas
- Filtrar por tipo de atividade
- Visual timeline com ícones

**Entity**: `ContactActivity`
```json
{
  "workspace_id": "string",
  "contact_id": "string",
  "activity_type": "enum (note, edit, tag_added, tag_removed, status_change)",
  "description": "string",
  "metadata": "object (JSON with details)",
  "created_by": "string"
}
```

**Componentes**:
- `ContactActivityTimeline.jsx`
- `ContactActivityItem.jsx`
- `ContactActivityFilters.jsx`

**Triggers**:
- Auto-criar activity ao adicionar nota
- Auto-criar activity ao editar contato
- Auto-criar activity ao adicionar/remover tag

---

### 3. Contact Custom Fields
**Prioridade**: BAIXA (opcional para esta fase)  
**Tempo**: 3h

**Funcionalidades**:
- Definir campos customizados por workspace
- Tipos: text, number, date, select, multi-select
- Adicionar valores aos contatos
- Buscar/filtrar por custom fields

**Entity**: `ContactCustomField`
```json
{
  "workspace_id": "string",
  "field_name": "string",
  "field_type": "enum (text, number, date, select, multi_select)",
  "field_options": "array (for select types)",
  "is_required": "boolean",
  "display_order": "number"
}
```

**Entity**: `ContactCustomFieldValue`
```json
{
  "workspace_id": "string",
  "contact_id": "string",
  "field_id": "string",
  "value": "string/number/date (stored as JSON)"
}
```

---

### 4. Related Contacts (Contact Relationships)
**Prioridade**: BAIXA (mover para Fase 8)  
**Tempo**: 2h

**Funcionalidades**:
- Relacionar contatos (matriz/filial, fornecedor/cliente)
- Visualizar rede de relacionamentos
- Tipos de relacionamento customizáveis

---

## 📋 TASKS PRIORITÁRIAS (FASE 7)

### Sprint 7.1 - Contact Notes (2h)
- [ ] Criar entity ContactNote
- [ ] Criar ContactNoteForm component
- [ ] Criar ContactNotesList component
- [ ] Criar ContactNoteItem component
- [ ] Integrar em ContactDetails (nova tab)
- [ ] CRUD completo de notas
- [ ] Pinned notes feature
- [ ] Validações

### Sprint 7.2 - Activity Timeline (2h)
- [ ] Criar entity ContactActivity
- [ ] Criar ContactActivityTimeline component
- [ ] Criar ContactActivityItem component
- [ ] Criar ContactActivityFilters component
- [ ] Auto-criar activities (triggers)
- [ ] Visual timeline com ícones
- [ ] Integrar em ContactDetails (tab ou section)

### Sprint 7.3 - Testing & Polish (1h)
- [ ] Testar CRUD de notas
- [ ] Testar activity tracking
- [ ] Performance optimization
- [ ] UX polish
- [ ] Documentation

---

## 🎨 DESIGN MOCKUPS

### Contact Notes Tab:
```
┌─────────────────────────────────────┐
│ [Nova Nota] [📌 Pinned First] [🔍]  │
├─────────────────────────────────────┤
│ 📌 PINNED NOTE                      │
│ ┌─────────────────────────────────┐ │
│ │ Importante: Renovar contrato... │ │
│ │ 👤 João • 🕐 Hoje às 14:30      │ │
│ └─────────────────────────────────┘ │
│                                     │
│ 📝 TODAS AS NOTAS                   │
│ ┌─────────────────────────────────┐ │
│ │ 📞 Ligação realizada...         │ │
│ │ 👤 Maria • 🕐 Ontem             │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ 📧 Email enviado...             │ │
│ │ 👤 João • 🕐 2 dias atrás       │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Activity Timeline:
```
┌─────────────────────────────────────┐
│ [Todas] [Notas] [Edições] [Tags]    │
├─────────────────────────────────────┤
│ ●────────────────────────────────── │
│ │ 📝 Nota adicionada                │
│ │ "Ligar amanhã às 10h"             │
│ │ 👤 João • 🕐 15:30                │
│ ●────────────────────────────────── │
│ │ 🏷️ Tag adicionada: Cliente VIP   │
│ │ 👤 Maria • 🕐 14:00               │
│ ●────────────────────────────────── │
│ │ ✏️ Contato editado                │
│ │ Status: Inativo → Ativo           │
│ │ 👤 João • 🕐 Ontem                │
│ ●────────────────────────────────── │
└─────────────────────────────────────┘
```

---

## 🔧 TECHNICAL IMPLEMENTATION

### Note Types Icons:
```javascript
const NOTE_TYPE_ICONS = {
  general: <FileText />,
  call: <Phone />,
  meeting: <Users />,
  email: <Mail />,
  task: <CheckSquare />
};
```

### Activity Type Icons:
```javascript
const ACTIVITY_ICONS = {
  note: <FileText />,
  edit: <Edit2 />,
  tag_added: <Tag />,
  tag_removed: <X />,
  status_change: <Toggle />
};
```

### Relative Time Display:
```javascript
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const timeAgo = formatDistanceToNow(new Date(timestamp), {
  addSuffix: true,
  locale: ptBR
});
// "há 2 horas", "ontem", "há 3 dias"
```

---

## 📊 SUCCESS METRICS

### Notes System:
- ✅ CRUD completo funcionando
- ✅ Notas aparecendo em ordem cronológica
- ✅ Pinned notes no topo
- ✅ Autor visível
- ✅ Delete com confirmação

### Activity Timeline:
- ✅ Activities sendo criadas automaticamente
- ✅ Timeline visual funcionando
- ✅ Filtros funcionando
- ✅ Performance (< 500ms render)

---

## 🚧 OUT OF SCOPE (Mover para Fase 8)

- Contact relationships/hierarchy
- Duplicate detection
- Contact merge
- Advanced custom fields
- File attachments para notes
- @mentions em notes
- Note templates

---

## 🎯 DEFINITION OF DONE

- [ ] Entities criadas e testadas
- [ ] Componentes implementados
- [ ] Integração em ContactDetails
- [ ] CRUD completo funcionando
- [ ] UX polished
- [ ] Performance otimizada
- [ ] Documentation atualizada
- [ ] Zero bugs críticos

---

**Pronto para início da Fase 7 quando aprovado.**