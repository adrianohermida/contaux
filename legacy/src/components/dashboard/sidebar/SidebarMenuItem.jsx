import React, { memo } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import SidebarMenuItemBase from './SidebarMenuItemBase';
import SidebarBadge from './SidebarBadge';

const SidebarMenuItem = memo(function SidebarMenuItem({
  item,
  collapsed = false,
  unreadCount = 0,
  onToggleSubmenu,
  submenuOpen = false,
}) {
  const location = useLocation();

  const isActive = (page) => {
    return location.pathname === `/${page.toLowerCase()}`;
  };

  const badge = item.badge === 'unread' && (
    <SidebarBadge count={unreadCount} collapsed={collapsed} />
  );

  // Item simples (sem submenu)
  if (!item.submenu) {
    return (
      <div>
        <SidebarMenuItemBase
          icon={item.icon}
          label={item.label}
          isActive={isActive(item.page)}
          isCollapsed={collapsed}
          href={`/${item.page.toLowerCase()}`}
          badge={badge}
        />
      </div>
    );
  }

  // Item com submenu
  return (
    <div>
      <SidebarMenuItemBase
        icon={item.icon}
        label={item.label}
        isCollapsed={collapsed}
        onClick={() => onToggleSubmenu(item.label)}
        badge={badge}
        hasSubmenu={true}
        submenuOpen={submenuOpen}
      >
        {!collapsed && (
          submenuOpen ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )
        )}
      </SidebarMenuItemBase>

      {/* Submenu items */}
      {!collapsed && submenuOpen && (
        <div className="bg-blue-950">
          {item.submenu.map((sub, subIndex) => (
            <a
              key={subIndex}
              href={`/${sub.page.toLowerCase()}`}
              className={`block px-12 py-2 text-sm hover:bg-blue-800 transition-colors ${
                isActive(sub.page) ? 'bg-blue-800 text-blue-200' : 'text-blue-100'
              }`}
            >
              {sub.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
});

export default SidebarMenuItem;