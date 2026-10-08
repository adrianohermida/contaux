import React from 'react';
import { Trash2, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const RELATIONSHIP_TYPES = {
  matriz_filial: { label: 'Matriz/Filial', color: 'blue' },
  grupo_economico: { label: 'Grupo Econômico', color: 'purple' },
  parceiro: { label: 'Parceiro', color: 'green' },
  fornecedor: { label: 'Fornecedor', color: 'orange' },
  cliente: { label: 'Cliente', color: 'indigo' },
  outro: { label: 'Outro', color: 'gray' },
};

const colorClasses = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-600', badge: 'bg-blue-100 text-blue-700' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-600', badge: 'bg-purple-100 text-purple-700' },
  green: { bg: 'bg-green-100', text: 'text-green-600', badge: 'bg-green-100 text-green-700' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-600', badge: 'bg-orange-100 text-orange-700' },
  indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', badge: 'bg-indigo-100 text-indigo-700' },
  gray: { bg: 'bg-gray-100', text: 'text-gray-600', badge: 'bg-gray-100 text-gray-700' },
};

export default function RelationshipItem({ relationship, relatedContact, onDelete }) {
  const typeConfig = RELATIONSHIP_TYPES[relationship.relationship_type];
  const colors = colorClasses[typeConfig?.color || 'gray'];

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${colors.bg} flex-shrink-0`}>
            <Link2 className={`w-4 h-4 ${colors.text}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-medium text-slate-900 dark:text-slate-100 truncate">
                {relatedContact?.company_name || 'Carregando...'}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${colors.badge} flex-shrink-0`}>
                {typeConfig?.label || relationship.relationship_type}
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {relatedContact?.email || ''}
            </p>
            {relationship.notes && (
              <p className="text-xs text-slate-500 mt-2 break-words">
                {relationship.notes}
              </p>
            )}
          </div>
          <Button
            onClick={() => {
              if (window.confirm('Remover este relacionamento?')) {
                onDelete(relationship.id);
              }
            }}
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700 flex-shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}