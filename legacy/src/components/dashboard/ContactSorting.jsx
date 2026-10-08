import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const SORT_OPTIONS = [
  { value: 'company_name', label: 'Nome', field: 'company_name' },
  { value: 'email', label: 'Email', field: 'email' },
  { value: 'created_date', label: 'Data de Criação', field: 'created_date' },
  { value: 'status', label: 'Status', field: 'status' },
];

export default function ContactSorting({ sortBy, sortOrder, onSortChange }) {
  const currentOption = SORT_OPTIONS.find(opt => opt.value === sortBy);

  const handleSort = (value) => {
    if (value === sortBy) {
      // Toggle order
      onSortChange(value, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      onSortChange(value, 'asc');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          {sortOrder === 'asc' ? (
            <ArrowUp className="w-4 h-4" />
          ) : sortOrder === 'desc' ? (
            <ArrowDown className="w-4 h-4" />
          ) : (
            <ArrowUpDown className="w-4 h-4" />
          )}
          {currentOption ? currentOption.label : 'Ordenar'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {SORT_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleSort(option.value)}
            className="flex items-center justify-between gap-4"
          >
            <span>{option.label}</span>
            {sortBy === option.value && (
              sortOrder === 'asc' ? (
                <ArrowUp className="w-4 h-4" />
              ) : (
                <ArrowDown className="w-4 h-4" />
              )
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}