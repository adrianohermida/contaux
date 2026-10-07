import React, { memo } from 'react';
import SidebarMenuItem from './SidebarMenuItem';

const SidebarMenuList = memo(function SidebarMenuList({
  items,
  collapsed = false,
  unreadCount = 0,
  openMenus = {},
  onToggleSubmenu,
}) {
  return (
    <nav className="flex-1 overflow-y-auto py-2 md:py-4 space-y-0.5 md:space-y-1">
      {items.map((item, index) => (
        <SidebarMenuItem
          key={`${item.label}-${index}`}
          item={item}
          collapsed={collapsed}
          unreadCount={unreadCount}
          onToggleSubmenu={onToggleSubmenu}
          submenuOpen={openMenus[item.label] || false}
        />
      ))}
    </nav>
  );
});

SidebarMenuList.displayName = 'SidebarMenuList';

export default SidebarMenuList;