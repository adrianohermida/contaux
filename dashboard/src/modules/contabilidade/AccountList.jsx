import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { accountTypeLabels, accountTypeVariants } from './lib/mockData'
import { Search, Plus, Pencil, ChevronRight, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AccountList({ accounts, onNew, onEdit, onToggle }) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [expanded, setExpanded] = useState(new Set(['1', '2', '3', '4']))

  const filtered = useMemo(() => {
    let result = accounts
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((a) =>
        a.name.toLowerCase().includes(q) || a.code.includes(q),
      )
    }
    if (typeFilter !== 'all') result = result.filter((a) => a.type === typeFilter)
    return result
  }, [accounts, search, typeFilter])

  const roots = filtered.filter((a) => !a.parent_id)
  const childrenOf = (parentId) => filtered.filter((a) => a.parent_id === parentId)

  const toggleExpand = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const renderAccount = (account, depth = 0) => {
    const children = childrenOf(account.id)
    const hasChildren = children.length > 0
    const isExpanded = expanded.has(account.id)

    return (
      <div key={account.id}>
        <div
          className={cn(
            'flex items-center gap-2 border-b border-border px-4 py-2.5 hover:bg-muted/30',
            !account.active && 'opacity-50',
          )}
          style={{ paddingLeft: `${depth * 24 + 16}px` }}
        >
          {hasChildren ? (
            <button onClick={() => toggleExpand(account.id)} className="shrink-0">
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          ) : (
            <span className="w-4 shrink-0" />
          )}
          <span className="w-20 shrink-0 font-mono text-xs text-muted-foreground">{account.code}</span>
          <span className="flex-1 text-sm font-medium">{account.name}</span>
          <Badge variant={accountTypeVariants[account.type]} className="hidden sm:inline-flex">
            {accountTypeLabels[account.type]}
          </Badge>
          <Button variant="ghost" size="sm" onClick={() => onToggle(account.id)}>
            {account.active ? 'Ativa' : 'Inativa'}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onEdit(account)}>
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
        {hasChildren && isExpanded && children.map((child) => renderAccount(child, depth + 1))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar conta..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2">
          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-40">
            <option value="all">Todos os tipos</option>
            {Object.entries(accountTypeLabels).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>
          <Button onClick={onNew}><Plus className="h-4 w-4" /> Nova Conta</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{filtered.length} conta(s)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="hidden md:block overflow-x-auto">
            {roots.map((acc) => renderAccount(acc))}
          </div>
          <div className="space-y-2 p-4 md:hidden">
            {filtered.map((a) => (
              <div key={a.id} className="rounded-md border border-border p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs text-muted-foreground">{a.code}</span>
                    <p className="font-medium">{a.name}</p>
                  </div>
                  <Badge variant={accountTypeVariants[a.type]}>{accountTypeLabels[a.type]}</Badge>
                </div>
                <Button variant="ghost" size="sm" className="mt-2" onClick={() => onEdit(a)}>Editar</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
