/**
 * UNIFIED HEADER COMPONENT
 * Shared header for Contact and Clients pages
 * Flexible button actions and title
 */

import React from 'react';
import { Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function UnifiedHeader({
  title,
  filteredCount,
  totalCount,
  itemName = 'item',
  onNewItem,
  onImportClick,
  actionButtons = [] // Array of {label, icon: Component, onClick, component}
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-[var(--spacing-md)] sm:gap-[var(--spacing-lg)]">
      <div className="flex-1">
        <h1 className="text-[var(--font-size-2xl)] sm:text-[var(--font-size-3xl)] font-bold text-[var(--color-foreground-primary)] break-words">
          {title}
        </h1>
        <p className="text-[var(--font-size-sm)] sm:text-[var(--font-size-base)] text-[var(--color-foreground-secondary)] mt-[var(--spacing-xs)]">
          {filteredCount} de {totalCount} {itemName}{totalCount !== 1 ? 's' : ''}
        </p>
      </div>
      
      <div className="flex gap-[var(--spacing-sm)] flex-wrap sm:flex-nowrap sm:justify-end">
        {/* Custom Action Buttons */}
        {actionButtons.map((btn, idx) => {
          // If component is provided, render it directly
          if (btn.component) {
            return <div key={idx}>{btn.component()}</div>;
          }
          
          const Icon = btn.icon;
          return (
            <Button
              key={idx}
              onClick={btn.onClick}
              variant="outline"
              size="sm"
              className="gap-2 min-h-[44px]"
              aria-label={btn.label}
            >
              {Icon && <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />}
              <span className="hidden sm:inline">{btn.label}</span>
            </Button>
          );
        })}
        
        {/* Import Button */}
        {onImportClick && (
          <Button 
            onClick={onImportClick} 
            variant="outline" 
            size="sm" 
            className="gap-2 min-h-[44px]"
            aria-label="Importar itens"
          >
            <Upload className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">Importar</span>
          </Button>
        )}
        
        {/* New Item Button */}
        {onNewItem && (
          <Button 
            onClick={onNewItem} 
            size="sm" 
            className="gap-2 min-h-[44px]"
            aria-label={`Criar novo ${itemName}`}
          >
            <Plus className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">Novo</span>
          </Button>
        )}
      </div>
    </div>
  );
}