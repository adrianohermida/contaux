import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

export function useSidebarMenu() {
  // Persist submenu state across page reloads
  const [openMenus, setOpenMenus] = useState(() => {
    try {
      const saved = sessionStorage.getItem('sidebarOpenMenus');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Carregar unread messages - otimizado com cache
  const { data: unreadConversations = [], error, isLoading } = useQuery({
    queryKey: ['sidebar-unread'],
    queryFn: async () => {
      const { base44 } = await import('@/api/base44Client');
      return base44.entities.VirtualCounterConversation.filter({ status: 'active' });
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  // Persist submenu state changes
  useEffect(() => {
    sessionStorage.setItem('sidebarOpenMenus', JSON.stringify(openMenus));
  }, [openMenus]);

  // Log query errors for debugging
  useEffect(() => {
    if (error) {
      console.warn('[Sidebar] Failed to load unread conversations:', error);
    }
  }, [error]);

  // Memoizar contagem de unread
  const unreadCount = useMemo(() => 
    unreadConversations.reduce((sum, c) => sum + (c.unread_count || 0), 0),
    [unreadConversations]
  );

  // Toggle de submenu com memory eficiente
  const toggleSubmenu = useCallback((label) => {
    setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
  }, []);

  // Obter estado de submenu
  const isSubmenuOpen = useCallback((label) => {
    return openMenus[label] || false;
  }, [openMenus]);

  return {
    unreadCount,
    openMenus,
    toggleSubmenu,
    isSubmenuOpen,
    error,
    isLoading,
  };
}