# Spec — Módulo 2: CRM (Clientes & Contatos)

## Objetivo
Gestão completa de clientes e contatos: cadastro, busca, filtros, tags, relacionamentos, histórico e deduplicação.

## Páginas
| Rota | Descrição |
|------|-----------|
| `/clientes` | Lista de clientes com filtros e busca |
| `/clientes/:id` | Detalhe do cliente (contatos, notas, atividades, anexos) |
| `/contatos` | Lista de contatos (CRM) |

## Componentes (máx. 200 linhas cada)
| Componente | Responsabilidade |
|------------|----------------|
| `ClientList` | Grid/tabela de clientes com paginação |
| `ClientForm` | Formulário criar/editar cliente (PF/PJ) |
| `ClientDetail` | Abas: dados, contatos, notas, atividades, anexos |
| `ContactList` | Lista de contatos com filtros |
| `ContactForm` | Formulário criar/editar contato |
| `TagManager` | Gestão de tags e categorias |
| `CSVImport` | Importação de clientes via CSV |
| `CSVExport` | Exportação de clientes para CSV |
| `DuplicateDetector` | Detecção e merge de duplicatas |

## Entidades
```
Client {
  name, type (PF/PJ), document (CPF/CNPJ), email, phone,
  status (active/inactive/prospect), workspace_id,
  address { street, number, city, state, zip, complement },
  fiscal_data { inscricao_estadual, inscricao_municipal, regime_tributario },
  created_date, updated_date
}

Contact {
  name, email, phone, position, client_id (optional),
  tags [], notes [], activities [], attachments [],
  workspace_id, created_date
}

ContactTag { name, color, workspace_id }
ContactNote { contact_id, content, author, created_date }
ContactActivity { contact_id, type, description, created_date }
```

## Regras de negócio
1. **Validação CPF:** 11 dígitos, cálculo de dígitos verificadores
2. **Validação CNPJ:** 14 dígitos, cálculo de dígitos verificadores
3. **CEP lookup:** Via ViaCEP API ao digitar CEP
4. **Deduplicação:** Detectar por CPF/CNPJ + nome similar (Levenshtein)
5. **Tags:** Máximo 10 tags por contato
6. **Soft delete:** Clientes inativados, não removidos (LGPD)

## Funções backend
| Função | Descrição |
|--------|-----------|
| `validateClientDocument` | Valida CPF/CNPJ com dígito verificador |
| `mergeContacts` | Mescla dois contatos duplicados |
| `detectDuplicates` | Escaneia e retorna possíveis duplicatas |
| `exportToCSV` | Exporta lista para CSV |

## Referência legada
- `legacy/src/pages/Clients.jsx` (197 linhas)
- `legacy/src/pages/Contact.jsx` (329 linhas)
- `legacy/src/pages/ContactDetails.jsx` (245 linhas)
- `legacy/src/components/dashboard/ClientForm.jsx`
- `legacy/src/components/dashboard/contact/` (subdiretório com ~15 componentes)
- `legacy/base44/functions/validateClientDocument/entry.ts`
- `legacy/base44/functions/mergeContacts/entry.ts`
- `legacy/base44/functions/detectDuplicates/entry.ts`

## Critérios de aceite
- [ ] CRUD completo de clientes (criar, listar, editar, inativar)
- [ ] Validação CPF/CNPJ no backend
- [ ] Busca por nome, documento, email
- [ ] Filtros: status, tipo (PF/PJ), tag
- [ ] Ordenação: nome, data criação, data atualização
- [ ] Tags: criar, aplicar, filtrar, remover
- [ ] Importação CSV com preview
- [ ] Exportação CSV
- [ ] Detecção de duplicatas
- [ ] Página de detalhe com abas
- [ ] Notas e atividades por contato
- [ ] Dark mode + mobile 373px
