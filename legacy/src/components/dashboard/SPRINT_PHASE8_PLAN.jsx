# 🚀 FASE 8 - POLISH & ADVANCED CONTACT FEATURES
**Sprint Plan** | **Prioridade**: ALTA | **Estimativa**: 6-8 horas  
**Status**: PLANEJADO - Aguardando Aprovação

---

## 🎯 OBJETIVOS DA FASE 8

Adicionar features avançadas e polir o módulo de contatos para torná-lo enterprise-grade com recursos de produtividade e relacionamentos complexos.

---

## 📋 FEATURES PLANEJADAS

### 1. **Contact Relationships** 
**Prioridade**: ALTA | **Tempo**: 2h

**Objetivo**: Relacionamentos entre contatos (matriz/filial, grupo econômico)

**Implementação**:
- Nova entity: `ContactRelationship`
  - contact_id (pai)
  - related_contact_id (filho)
  - relationship_type (enum: matriz_filial, grupo_economico, parceiro, fornecedor)
  - notes

**UI**:
- Nova tab "Relacionamentos" em ContactDetails
- Componente `ContactRelationshipManager.jsx`
- Visual tree/graph para visualizar hierarquia
- Add/remove relationships facilmente

**Use Cases**:
- Empresa matriz com múltiplas filiais
- Grupo econômico com várias empresas
- Parceiros comerciais vinculados

---

### 2. **Duplicate Detection & Contact Merge**
**Prioridade**: ALTA | **Tempo**: 2-3h

**Objetivo**: Detectar duplicatas e permitir merge de contatos

**Implementação**:
- Backend function: `detectDuplicates.js`
  - Lógica: email, CNPJ/CPF, nome similar
  - Fuzzy matching para nomes
- Componente: `ContactMergeDialog.jsx`
  - Comparar side-by-side
  - Selecionar campos a manter
  - Preview antes de merge
- Activity log do merge

**UI**:
- Badge "Possível duplicata" em ContactCard
- Botão "Mesclar contatos" em Contact details
- Wizard de 3 passos: Detectar → Comparar → Confirmar

---

### 3. **Custom Fields System**
**Prioridade**: MÉDIA | **Tempo**: 2h

**Objetivo**: Campos customizáveis por workspace

**Implementação**:
- Nova entity: `CustomField`
  - workspace_id
  - entity_type (sempre "contact")
  - field_name
  - field_type (text, number, date, select, multiselect)
  - options (para select/multiselect)
  - is_required
- Entity: `CustomFieldValue`
  - custom_field_id
  - entity_id (contact_id)
  - value

**UI**:
- Settings: Gerenciar custom fields
- ContactDetails: Exibir custom fields
- Form dinâmico baseado em definições

**Use Cases**:
- Adicionar "Segmento de mercado"
- Adicionar "Faturamento anual"
- Campos específicos por tipo de negócio

---

### 4. **File Attachments**
**Prioridade**: MÉDIA | **Tempo**: 1.5h

**Objetivo**: Anexar arquivos aos contatos

**Implementação**:
- Entity: `ContactAttachment`
  - workspace_id
  - contact_id
  - file_url (from UploadFile)
  - file_name
  - file_size
  - file_type
  - description

**UI**:
- Nova tab "Arquivos" em ContactDetails
- Componente: `ContactAttachments.jsx`
- Drag & drop upload
- Preview para PDFs/imagens
- Download button

**Use Cases**:
- Contratos
- Certidões
- Documentos fiscais
- Propostas comerciais

---

### 5. **Note Templates**
**Prioridade**: BAIXA | **Tempo**: 1h

**Objetivo**: Templates rápidos para notas comuns

**Implementação**:
- Entity: `NoteTemplate`
  - workspace_id
  - name
  - content (template com variáveis)
  - note_type
- ContactNoteForm: Dropdown de templates
- Variáveis: {{company_name}}, {{phone}}, etc.

**UI**:
- Botão "Templates" no form de notas
- Popover com lista de templates
- Substituição automática de variáveis

**Exemplos**:
- "Follow-up pós-reunião"
- "Primeira ligação"
- "Proposta enviada"

---

### 6. **Rich Text Notes** (Opcional)
**Prioridade**: BAIXA | **Tempo**: 1h

**Objetivo**: Formatação rica em notas

**Implementação**:
- Substituir Textarea por React-Quill
- Salvar HTML em content
- Render HTML em display

**Features**:
- Bold, italic, underline
- Listas (ordered/unordered)
- Links
- Headings

---

### 7. **@Mentions em Notas** (Opcional)
**Prioridade**: BAIXA | **Tempo**: 1.5h

**Objetivo**: Mencionar usuários em notas

**Implementação**:
- Parse @ mentions em content
- Entity: `NoteMention`
  - note_id
  - user_email
- Notificação ao usuário mencionado
- Highlight @ mentions em UI

---

### 8. **Contact Export Enhanced**
**Prioridade**: MÉDIA | **Tempo**: 30min

**Objetivo**: Export com mais opções

**Implementação**:
- Adicionar export de notas junto com contato
- Adicionar export de activities
- Formato: CSV com múltiplas sheets ou JSON completo

---

### 9. **Contact Quick Actions**
**Prioridade**: MÉDIA | **Tempo**: 45min

**Objetivo**: Ações rápidas em ContactCard

**Implementação**:
- Dropdown de ações em ContactCard
- Quick actions:
  - Adicionar nota rápida (modal small)
  - Ligar (integração futura)
  - Email (mailto link ou integração)
  - WhatsApp (web.whatsapp.com link)

---

### 10. **Contact Statistics Dashboard**
**Prioridade**: BAIXA | **Tempo**: 1h

**Objetivo**: Dashboard de métricas de contatos

**Implementação**:
- Página: `ContactsDashboard.js`
- Métricas:
  - Total de contatos
  - Crescimento mensal
  - Top tags
  - Notas por tipo
  - Activities timeline geral

---

## 📦 ESTRUTURA DE IMPLEMENTAÇÃO

### Entities a Criar:
1. ContactRelationship
2. CustomField
3. CustomFieldValue
4. ContactAttachment
5. NoteTemplate
6. NoteMention (opcional)

### Componentes a Criar:
1. `ContactRelationshipManager.jsx`
2. `ContactMergeDialog.jsx`
3. `DuplicateDetector.jsx`
4. `CustomFieldsManager.jsx`
5. `ContactAttachments.jsx`
6. `NoteTemplateSelector.jsx`
7. `ContactQuickActions.jsx`
8. `ContactsDashboard.jsx` (opcional)

### Backend Functions:
1. `detectDuplicates.js`
2. `mergeContacts.js`

---

## 🎯 PRIORIZAÇÃO RECOMENDADA

### Sprint 8.1 (Core Features - 4h):
1. ✅ Contact Relationships (2h)
2. ✅ Duplicate Detection & Merge (2h)

### Sprint 8.2 (Productivity - 3h):
3. ✅ Custom Fields System (2h)
4. ✅ File Attachments (1h)

### Sprint 8.3 (Polish - 2h):
5. ✅ Note Templates (1h)
6. ✅ Contact Quick Actions (45min)
7. ✅ Export Enhanced (30min)

### Sprint 8.4 (Optional):
8. Rich Text Notes (1h)
9. @Mentions (1.5h)
10. Statistics Dashboard (1h)

---

## ✅ ACCEPTANCE CRITERIA

### Contact Relationships:
- [ ] Pode criar relacionamento entre contatos
- [ ] Visualização em árvore/grafo
- [ ] Activity log ao criar/remover relacionamento
- [ ] Validação: não criar ciclos

### Duplicate Detection:
- [ ] Detecta duplicatas por email, documento, nome
- [ ] UI para comparar side-by-side
- [ ] Merge preserva histórico (notes, activities, tags)
- [ ] Activity log do merge

### Custom Fields:
- [ ] Admin pode criar custom fields
- [ ] Campos aparecem em contact form
- [ ] Validação de campos required
- [ ] Valores salvos e exibidos corretamente

### File Attachments:
- [ ] Upload de arquivos (max 10MB)
- [ ] Lista de anexos com metadata
- [ ] Download funcional
- [ ] Activity log ao anexar arquivo

### Note Templates:
- [ ] Criar/editar/deletar templates
- [ ] Selecionar template ao criar nota
- [ ] Variáveis substituídas corretamente

---

## 🚀 IMPACTO ESPERADO

### Produtividade:
- 40% mais rápido criar notas (templates)
- 60% menos duplicatas (detection)
- 100% visibilidade de relacionamentos

### Organização:
- Custom fields = flexibilidade
- Attachments = tudo centralizado
- Relationships = contexto completo

### Enterprise-Ready:
- Merge = data quality
- Attachments = compliance
- Custom fields = adaptabilidade

---

## 📈 MÉTRICAS DE SUCESSO

- Tempo médio para criar nota: < 30s
- Taxa de duplicatas detectadas: > 90%
- Adoção de custom fields: > 50% dos workspaces
- Satisfação com attachments: > 85%

---

## 🎯 DECISÃO NECESSÁRIA

**Qual abordagem preferir?**

### Opção A: Sprint 8.1 + 8.2 (Core + Productivity)
**Recomendado**: Foco em features de alto impacto
- Contact Relationships
- Duplicate Detection
- Custom Fields
- File Attachments

### Opção B: Sprint Completo (All Features)
Todas as 10 features em uma única fase

### Opção C: Fase 8 Reduzida (Quick Wins)
- Note Templates
- Quick Actions
- Export Enhanced

---

**Aguardando decisão do usuário para iniciar implementação.**