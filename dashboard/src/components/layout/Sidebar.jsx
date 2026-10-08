import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from './navItems'
import { cn } from '@/lib/utils'
import { X, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react'
import { useState } from 'react'

export default function Sidebar({ isOpen, onClose }) {
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('contaux-sidebar-collapsed') === 'true'
  })

  const toggleCollapsed = () => {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem('contaux-sidebar-collapsed', String(next))
  }

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 lg:translate-x-0',
          collapsed ? 'w-16' : 'w-64',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Logo */}
        <div className={cn('flex h-16 items-center border-b border-sidebar-border', collapsed ? 'justify-center px-2' : 'justify-between px-5')}>
          <a href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm shrink-0">
              C
            </span>
            {!collapsed && <span className="text-lg font-bold tracking-tight">Contaux</span>}
          </a>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-sidebar-foreground hover:bg-sidebar-accent lg:hidden"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navegação */}
        <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden p-2" aria-label="Navegação principal">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                cn(
                  'flex items-center rounded-lg text-sm font-medium transition-colors',
                  collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                )
              }
            >
              <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Voltar para o site + collapse */}
        <div className="space-y-1 border-t border-sidebar-border p-2">
          <a
            href="/"
            title={collapsed ? 'Voltar para o site' : undefined}
            className={cn(
              'flex items-center rounded-lg text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              collapsed ? 'justify-center px-0 py-2.5' : 'gap-2 px-3 py-2',
            )}
          >
            <ArrowLeft className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Voltar para o site</span>}
          </a>
          <button
            onClick={toggleCollapsed}
            title={collapsed ? 'Expandir menu' : 'Recolher menu'}
            className={cn(
              'hidden items-center rounded-lg text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground lg:flex',
              collapsed ? 'justify-center px-0 py-2.5' : 'gap-2 px-3 py-2',
            )}
          >
            {collapsed ? <ChevronRight className="h-5 w-5 shrink-0" /> : <><ChevronLeft className="h-5 w-5 shrink-0" /> Recolher</>}
          </button>
        </div>
      </aside>
    </>
  )
}
