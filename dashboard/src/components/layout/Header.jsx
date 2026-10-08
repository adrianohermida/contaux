import { Menu, Moon, Sun, RefreshCw, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { getRoleLabel } from '@/lib/roles'

export default function Header({ onMenuClick, isDark, onToggleTheme, onRefresh, refreshing }) {
  const { user, logout } = useAuth()
  const initials = (user?.name || 'AD').split(' ').map((w) => w[0]).slice(0, 2).join('')

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </Button>
        <h1 className="text-lg font-semibold tracking-tight">Dashboard</h1>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={refreshing}
          className="hidden sm:inline-flex"
        >
          <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} aria-hidden="true" />
          Atualizar
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleTheme}
          aria-label="Alternar tema"
        >
          {isDark ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
        </Button>
        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium leading-tight">{user?.name || 'Usuário'}</p>
            <p className="text-xs text-muted-foreground leading-tight">{getRoleLabel(user?.role)}</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
            {initials}
          </div>
          <Button variant="ghost" size="icon" onClick={logout} aria-label="Sair">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
