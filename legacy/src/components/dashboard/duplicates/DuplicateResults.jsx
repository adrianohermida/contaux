import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DuplicateItem from './DuplicateItem';
import DuplicatesEmpty from './DuplicatesEmpty';

export default function DuplicateResults({ duplicates, onMerge }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resultados da Verificação</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <div>
              <p className="text-sm font-medium">Total de Contatos</p>
              <p className="text-2xl font-bold">{duplicates.total_contacts}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Duplicatas Encontradas</p>
              <p className="text-2xl font-bold text-red-600">{duplicates.duplicates_found}</p>
            </div>
          </div>

          {duplicates.duplicates_found === 0 ? (
            <DuplicatesEmpty />
          ) : (
            <div className="space-y-4">
              {duplicates.duplicates.map((dup, idx) => (
                <DuplicateItem
                  key={idx}
                  duplicate={dup}
                  onMerge={onMerge}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}