import React, { memo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

const SidebarHeader = memo(function SidebarHeader({
  collapsed = false,
  onToggleCollapse,
}) {
  return (
    <div className="p-4 border-b border-blue-800 flex items-center justify-between">
      {!collapsed && (
        <h2 className="text-xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
          Contaux
        </h2>
      )}
      <button
        onClick={onToggleCollapse}
        className="p-2 hover:bg-blue-800 rounded-lg transition-colors"
        aria-label="Toggle sidebar"
        title={collapsed ? 'Expandir' : 'Recolher'}
      >
        {collapsed ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <ChevronDown className="w-5 h-5" />
        )}
      </button>
    </div>
  );
});

export default SidebarHeader;