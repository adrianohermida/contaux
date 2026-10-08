import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Bell, User, LogOut, Settings, Loader2, Moon, Sun } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUserAndTenantOptimized } from '../hooks/useUserAndTenantOptimized';
import { useDebounce } from '../hooks/useDebounce';
import { useTheme } from '../hooks/useTheme';
import UserPreferences from './UserPreferences';
import Breadcrumbs from './Breadcrumbs';
import SearchBox from './SearchBox';
import MobileBackButton from '../MobileBackButton';

const DashboardHeader = memo(function DashboardHeader() {
  const { user, tenantId } = useUserAndTenantOptimized();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Lazy-load notifications with React Query
  const { data: notifications = [], isLoading: notificationsLoading } = useQuery({
    queryKey: ['header-notifications', tenantId], // ✅ Simplificada - sem user?.email
    queryFn: async () => {
      if (!tenantId || !user?.email) return [];
      const notifs = await base44.entities.Notification.filter({
        tenant_id: tenantId,
        user_email: user.email
      });
      return notifs.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 5);
    },
    enabled: !!tenantId && !!user?.email,
    staleTime: 2 * 60 * 1000, // ✅ 2 minutos
    gcTime: 5 * 60 * 1000,
  });

  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.is_read).length,
    [notifications]
  );

  const handleLogout = useCallback(async () => {
    await base44.auth.logout();
  }, []);

  return (
    <>
      <header className="bg-[var(--color-background-primary)] border-b border-[var(--color-border-default)] sticky top-0 z-40 transition-colors" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
         <div className="px-[var(--spacing-sm)] sm:px-[var(--spacing-lg)] py-[var(--spacing-sm)] sm:py-[var(--spacing-md)] flex items-center justify-between gap-[var(--spacing-sm)] sm:gap-[var(--spacing-md)]">
        {/* Mobile Back Button */}
        <MobileBackButton />
        
        {/* Search */}
        <SearchBox query={searchQuery} onQueryChange={setSearchQuery} />

        {/* Right Section */}
        <div className="ml-[var(--spacing-sm)] sm:ml-[var(--spacing-lg)] flex items-center gap-[var(--spacing-sm)] sm:gap-[var(--spacing-md)] flex-shrink-0">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-[var(--spacing-xs)] hover:bg-[var(--color-background-secondary)] rounded-lg transition-colors"
            title={`Alternar para tema ${theme === 'dark' ? 'claro' : 'escuro'}`}
            aria-label={`Alternar para tema ${theme === 'dark' ? 'claro' : 'escuro'}`}
            aria-pressed={theme === 'dark'}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-slate-400" aria-hidden="true" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" aria-hidden="true" />
            )}
          </button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative p-[var(--spacing-xs)] sm:p-[var(--spacing-xs)] hover:bg-[var(--color-background-secondary)] rounded-lg transition-colors" aria-label={`Notificações${unreadCount > 0 ? ` (${unreadCount} não lidas)` : ''}`} aria-pressed={unreadCount > 0}>
                {notificationsLoading ? (
                   <Loader2 className="w-4 sm:w-5 h-4 sm:h-5 text-[var(--color-foreground-muted)] animate-spin" aria-hidden="true" />
                 ) : (
                   <>
                     <Bell className="w-4 sm:w-5 h-4 sm:h-5 text-[var(--color-foreground-muted)]" aria-hidden="true" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold" aria-label={`${unreadCount} notificações não lidas`}>{unreadCount}</span>
                    )}
                  </>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96 bg-[var(--color-background-primary)] border-[var(--color-border-default)]">
              <div className="p-[var(--spacing-md)] text-[var(--color-foreground-primary)]">
                <h3 className="font-semibold mb-[var(--spacing-sm)]">Notificações</h3>
                {notificationsLoading ? (
                   <div className="flex justify-center py-4">
                     <Loader2 className="w-5 h-5 animate-spin text-slate-400" aria-label="Carregando notificações" />
                   </div>
                 ) : notifications.length === 0 ? (
                   <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">Nenhuma notificação</p>
                 ) : (
                   <div className="space-y-[var(--spacing-sm)] max-h-80 overflow-y-auto">
                     {notifications.map((notif) => (
                       <div key={notif.id} className={`p-[var(--spacing-sm)] rounded-lg text-[var(--font-size-sm)] border-l-4 transition-colors ${
                         notif.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 dark:border-emerald-500 text-emerald-900 dark:text-emerald-200' :
                         notif.type === 'error' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-500 dark:border-amber-500 text-amber-900 dark:text-amber-200' :
                         notif.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500 dark:border-yellow-500 text-yellow-900 dark:text-yellow-200' :
                         'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-500 text-blue-900 dark:text-blue-200'
                       } ${!notif.is_read ? 'font-medium' : ''}`} role="article" aria-label={notif.title}>
                         <p>{notif.title}</p>
                         <p className="text-xs opacity-75 mt-1">{notif.message}</p>
                       </div>
                     ))}
                   </div>
                 )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-[var(--spacing-sm)] p-[var(--spacing-xs)] hover:bg-[var(--color-background-secondary)] rounded-lg transition-colors" aria-label={`Menu do usuário ${user?.full_name || 'Usuário'}`}>
                <div className="w-8 h-8 bg-[var(--color-interactive-default)] rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" aria-hidden="true" />
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-[var(--font-size-sm)] font-medium text-[var(--color-foreground-primary)]">
                    {user?.full_name || 'Usuário'}
                  </p>
                  <p className="text-[var(--font-size-xs)] text-[var(--color-foreground-secondary)]">{user?.role === 'admin' ? 'Administrador' : 'Usuário'}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[var(--color-background-primary)] border-[var(--color-border-default)] text-[var(--color-foreground-primary)]">
              <DropdownMenuItem onClick={() => setPreferencesOpen(true)}>
                <Settings className="w-4 h-4 mr-[var(--spacing-sm)]" aria-hidden="true" />
                Preferências
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-[var(--color-error)]">
                <LogOut className="w-4 h-4 mr-[var(--spacing-sm)]" aria-hidden="true" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <UserPreferences 
        user={user} 
        tenantId={tenantId} 
        isOpen={preferencesOpen} 
        onClose={() => setPreferencesOpen(false)} 
      />
      </header>

      {/* Breadcrumbs */}
      <div className="sticky top-14 z-30 dark:bg-slate-900">
        <Breadcrumbs />
      </div>
    </>
  );
});

export default DashboardHeader;