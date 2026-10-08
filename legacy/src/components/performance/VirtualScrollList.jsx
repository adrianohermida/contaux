/**
 * Virtual Scroll List
 * High-performance list rendering with @tanstack/react-virtual
 */

import React, { useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

export default function VirtualScrollList({
  items = [],
  renderItem,
  itemHeight,
  overscan = 10,
  containerHeight = 500,
  gap = 12,
  isLoading = false,
  emptyMessage = 'Nenhum item encontrado',
}) {
  const parentRef = React.useRef(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight + gap,
    overscan,
    gap,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center" style={{ height: containerHeight }}>
        <div className="text-slate-600 dark:text-slate-400 text-sm">Carregando...</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-slate-50 dark:bg-slate-900/20 rounded-lg border border-slate-200 dark:border-slate-700"
        style={{ height: containerHeight }}
      >
        <p className="text-sm text-slate-600 dark:text-slate-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="overflow-auto"
      style={{ height: containerHeight }}
      role="list"
      aria-label="Lista virtual"
    >
      <div
        style={{
          height: `${totalSize}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualItem) => (
          <div
            key={virtualItem.key}
            role="listitem"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderItem(items[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>
    </div>
  );
}