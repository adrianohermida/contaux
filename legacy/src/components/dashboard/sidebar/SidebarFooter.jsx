import React, { memo } from 'react';
import SidebarShortcuts from '../SidebarShortcuts';

const SidebarFooter = memo(function SidebarFooter({ collapsed = false }) {
  if (collapsed) return null;

  return (
    <>
      <SidebarShortcuts />
      <div className="p-4 border-t border-blue-800 text-xs text-blue-200 text-center">
        <p>Contaux v1.0.0</p>
      </div>
    </>
  );
});

export default SidebarFooter;