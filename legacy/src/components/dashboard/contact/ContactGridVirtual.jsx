/**
 * Contact Grid Virtual
 * Virtual scrolling for large contact lists
 */

import React, { useMemo } from 'react';
import VirtualScrollList from '@/components/performance/VirtualScrollList';
import ContactGridItem from './ContactGridItem';

export default function ContactGridVirtual({
  contacts = [],
  isLoading = false,
  selectedIds = [],
  onSelect = () => {},
  onView = () => {},
  showCheckbox = false,
  containerHeight = 600,
}) {
  const itemHeight = useMemo(() => {
    // Approximate height of card + gap
    return 280;
  }, []);

  const renderItem = (contact) => (
    <div key={contact.id} className="px-2">
      <ContactGridItem
        contact={contact}
        tags={[]}
        isSelected={selectedIds.includes(contact.id)}
        onSelect={(id) => onSelect(id)}
        onView={onView}
        showCheckbox={showCheckbox}
      />
    </div>
  );

  return (
    <VirtualScrollList
      items={contacts}
      renderItem={renderItem}
      itemHeight={itemHeight}
      containerHeight={containerHeight}
      isLoading={isLoading}
      emptyMessage="Nenhum contato encontrado"
      overscan={5}
    />
  );
}