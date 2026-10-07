import React from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import ContactGridItem from './ContactGridItem';

export default function ContactGrid({
  paginatedItems,
  isLoading,
  selectedIds,
  onSelect,
  onViewContact,
  contacts,
  allAssignments,
  tagsMap,
  assignmentMap,
  getContactTags,
  currentPage,
  totalPages,
  onPageChange,
  hasNext,
  hasPrev,
  onNewContact,
  onImportClick
}) {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white dark:bg-slate-800 rounded-xl border p-6">
              <div className="space-y-3">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
              </div>
            </div>
          ))
        ) : paginatedItems.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {contacts.length === 0 ? 'Nenhum contato encontrado' : 'Nenhum contato corresponde aos filtros'}
            </p>
            <div className="flex gap-2 justify-center">
              {contacts.length === 0 && (
                <Button onClick={onImportClick} variant="outline" className="gap-2">
                  <Upload className="w-4 h-4" />
                  Importar CSV
                </Button>
              )}
              <Button onClick={onNewContact} variant="outline">
                {contacts.length === 0 ? 'Criar primeiro contato' : 'Limpar filtros'}
              </Button>
            </div>
          </div>
        ) : (
          paginatedItems.map(contact => {
            const contactTags = getContactTags(contact.id, assignmentMap, tagsMap);
            
            return (
              <ContactGridItem
                key={contact.id}
                contact={contact}
                tags={contactTags}
                isSelected={selectedIds.includes(contact.id)}
                onSelect={onSelect}
                onView={onViewContact}
                showCheckbox={selectedIds.length > 0}
              />
            );
          })
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        hasNext={hasNext}
        hasPrev={hasPrev}
      />
    </div>
  );
}