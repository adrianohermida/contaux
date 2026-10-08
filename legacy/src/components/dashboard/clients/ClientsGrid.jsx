import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Mail, Phone } from 'lucide-react';

export default function ClientsGrid({
  clients,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
  hasNext,
  hasPrev
}) {
  const navigate = useNavigate();

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-slate-100 text-slate-800'
  };

  const typeLabels = {
    pf: 'Pessoa Física',
    pj: 'Pessoa Jurídica'
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-48 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 dark:text-slate-400 mb-4">Nenhum cliente encontrado</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map((client) => (
          <Card
            key={client.id}
            className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate(`/clients/${client.id}`)}
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">
                  {client.company_name}
                </h3>
                <Badge className={statusColors[client.status]}>
                  {client.status === 'active' ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Mail className="w-4 h-4" />
                <a href={`mailto:${client.email}`} className="hover:text-blue-600 truncate">
                  {client.email}
                </a>
              </div>

              {client.phone && (
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Phone className="w-4 h-4" />
                  {client.phone}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Badge variant="outline" className="text-xs">
                  {typeLabels[client.client_type]}
                </Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6 pt-6 border-t">
          <Button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!hasPrev}
            variant="outline"
            size="sm"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNext}
            variant="outline"
            size="sm"
          >
            Próxima
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}