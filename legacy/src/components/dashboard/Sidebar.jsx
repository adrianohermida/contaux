import React, { memo, useEffect } from 'react';
import { SIDEBAR_MENU_ITEMS } from './sidebar/sidebarConfig';
import { useSidebarMenu } from './sidebar/useSidebarMenu';
import SidebarHeader from './sidebar/SidebarHeader';
import SidebarMenuList from './sidebar/SidebarMenuList';
import SidebarFooter from './sidebar/SidebarFooter';

const Sidebar = memo(function Sidebar({ collapsed, setCollapsed }) {
  const { unreadCount, openMenus, toggleSubmenu } = useSidebarMenu();

  // Persistir estado do collapse
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  return (
    <aside className={`bg-[var(--color-background-primary)] border-r border-[var(--color-border-default)] text-[var(--color-foreground-primary)] h-full transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} flex flex-col shadow-lg overflow-y-auto`}>
      <SidebarHeader collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />
      <SidebarMenuList
        items={SIDEBAR_MENU_ITEMS}
        collapsed={collapsed}
        unreadCount={unreadCount}
        openMenus={openMenus}
        onToggleSubmenu={toggleSubmenu}
      />
      <SidebarFooter collapsed={collapsed} />
    </aside>
  );
});

export default Sidebar;