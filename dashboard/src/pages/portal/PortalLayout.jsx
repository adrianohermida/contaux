import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { FileText, Receipt, LifeBuoy, LayoutDashboard, LogOut } from 'lucide-react'

const PORTAL_NAV = [
  { icon: LayoutDashboard, label: 'Início', path: '/portal' },
  { icon: Receipt, label: 'Faturas', path: '/portal/faturas' },
  { icon: FileText, label: 'Documentos', path: '/portal/documentos' },
  { icon: LifeBuoy, label: 'Suporte', path: '/portal/suporte' },
]

export default function PortalLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            C
          </span>
          <span className="font-bold tracking-tight text-sm sm:text-base">Portal do Cliente</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-sm text-muted-foreground hidden sm:inline">{user?.name}</span>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar desktop */}
        <aside className="hidden md:flex w-56 flex-col border-r border-border p-3 min-h-[calc(100vh-3.5rem)] lg:min-h-[calc(100vh-4rem)]">
          <nav className="space-y-1">
            {PORTAL_NAV.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/portal'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )
                }
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-3 sm:p-4 lg:p-6">
          {/* Nav mobile — bottom bar icon-first */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 flex h-14 items-center justify-around border-t border-border bg-background/95 backdrop-blur-sm" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            {PORTAL_NAV.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/portal'}
                className={({ isActive }) =>
                  cn(
                    'flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[10px] font-medium transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground',
                  )
                }
              >
                <item.icon className="h-5 w-5 shrink-0" strokeWidth={2} />
                <span className="leading-none">{item.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="pb-16 md:pb-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
