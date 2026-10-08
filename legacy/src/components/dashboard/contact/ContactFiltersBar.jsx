import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import ContactListFilters from '../ContactListFilters';
import ContactSorting from '../ContactSorting';

export default function ContactFiltersBar({
  searchTerm,
  onSearchChange,
  filters,
  onFiltersChange,
  tags,
  sortBy,
  sortOrder,
  onSortChange
}) {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          type="text"
          placeholder="Buscar por nome ou email..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex gap-2">
        <ContactListFilters onFilterChange={onFiltersChange} tags={tags} />
        <ContactSorting 
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={onSortChange}
        />
      </div>
    </div>
  );
}