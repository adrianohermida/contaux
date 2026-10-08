import React from 'react';
import { cn } from '@/lib/utils';
import ContactCard from '../ContactCard';

export default function ContactGridItem({
  contact,
  tags,
  isSelected,
  onSelect,
  onView,
  showCheckbox
}) {
  const handleClick = () => {
    if (showCheckbox) {
      onSelect(contact.id);
    } else {
      onView(contact.id);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className={cn(
        "relative cursor-pointer transition-all rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950 min-h-[200px]",
        showCheckbox && isSelected && "opacity-75 ring-2 ring-blue-500"
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={showCheckbox ? undefined : "button"}
      tabIndex={showCheckbox ? -1 : 0}
      aria-label={`Contato ${contact.company_name}`}
    >
      {showCheckbox && (
        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onSelect(contact.id);
            }}
            className="w-5 h-5 sm:w-6 sm:h-6 rounded border-slate-300 dark:border-slate-600 cursor-pointer"
            aria-label={`Selecionar ${contact.company_name}`}
          />
        </div>
      )}
      <ContactCard contact={contact} tags={tags} onClick={() => {}} />
    </div>
  );
}