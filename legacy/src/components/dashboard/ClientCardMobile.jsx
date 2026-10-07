import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2, Mail, Phone, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ClientCardMobile({ client, onEdit, onDelete }) {
  const navigate = useNavigate();
  const handleDelete = () => {
    if (confirm(`Tem certeza que deseja deletar ${client.company_name}?`)) {
      onDelete(client.id);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4 space-y-3">
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-white truncate">
          {client.company_name}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
          {client.client_type === 'pf' ? client.cpf : client.cnpj}
        </p>
      </div>

      {client.email && (
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
          <Mail className="w-3 h-3" />
          <a href={`mailto:${client.email}`} className="truncate hover:text-blue-600">
            {client.email}
          </a>
        </div>
      )}

      {client.phone && (
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
          <Phone className="w-3 h-3" />
          <a href={`tel:${client.phone}`}>{client.phone}</a>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          onClick={() => navigate(`/clientdetail/${client.id}`)}
          size="sm"
          variant="outline"
          className="flex-1"
        >
          <Eye className="w-3 h-3 mr-1" />
          Detalhes
        </Button>
        <Button
          onClick={() => onEdit(client)}
          size="sm"
          variant="outline"
        >
          <Edit2 className="w-3 h-3" />
        </Button>
        <Button
          onClick={handleDelete}
          size="sm"
          variant="destructive"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}