import React from 'react';

export default function SidebarBadge({ count, collapsed = false }) {
  if (!count || count === 0 || collapsed) return null;

  return (
    <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
      {count > 99 ? '99+' : count}
    </span>
  );
}