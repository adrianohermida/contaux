import React, { memo } from 'react';

const SidebarMenuItemBase = memo(function SidebarMenuItemBase({
  icon: Icon,
  label,
  isActive = false,
  isCollapsed = false,
  onClick,
  badge = null,
  hasSubmenu = false,
  submenuOpen = false,
  children,
  href,
  className = ''
}) {
  const baseClass = 'w-full px-4 py-3 flex items-center gap-3 hover:bg-blue-800 transition-colors';
  const activeClass = isActive ? 'bg-blue-800 border-l-4 border-blue-300' : '';

  if (href) {
    return (
      <a
        href={href}
        className={`block ${baseClass} ${activeClass} ${className}`}
        title={isCollapsed ? label : ''}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        {!isCollapsed && (
          <div className="flex items-center gap-2 flex-1">
            <span className="text-sm">{label}</span>
            {badge}
          </div>
        )}
        {children}
      </a>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`${baseClass} ${activeClass} ${className}`}
      title={isCollapsed ? label : ''}
      aria-expanded={submenuOpen}
      aria-label={label}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      {!isCollapsed && (
        <>
          <div className="flex-1 flex items-center gap-2">
            <span className="text-sm text-left">{label}</span>
            {badge}
          </div>
          {hasSubmenu && children}
        </>
      )}
    </button>
  );
});

export default SidebarMenuItemBase;