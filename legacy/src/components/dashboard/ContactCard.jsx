import React from 'react';
import { Clock, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TAG_COLORS = {
  blue: 'bg-blue-100 text-blue-800',
  green: 'bg-green-100 text-green-800',
  red: 'bg-red-100 text-red-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  purple: 'bg-purple-100 text-purple-800',
  pink: 'bg-pink-100 text-pink-800',
  indigo: 'bg-indigo-100 text-indigo-800',
  orange: 'bg-orange-100 text-orange-800',
};

const ContactCard = React.memo(({ contact, onClick, tags = [] }) => {
  const isNew = new Date(contact.created_date).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000;

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow relative overflow-hidden"
      onClick={onClick}
    >
      {isNew && (
        <div className="absolute top-0 right-0 bg-blue-600 text-white px-2 py-1 text-xs font-semibold rounded-bl-lg flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Novo
        </div>
      )}
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{contact.company_name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-slate-600 dark:text-slate-400">{contact.email}</p>
        {contact.phone && (
          <p className="text-sm text-slate-600 dark:text-slate-400">{contact.phone}</p>
        )}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <span className={`text-xs px-2 py-1 rounded-full ${contact.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
              {contact.status === 'active' ? 'Ativo' : 'Inativo'}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {contact.client_type === 'pf' ? 'PF' : 'PJ'}
            </span>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 2).map((tag) => (
                <span
                  key={tag.id}
                  className={`text-xs px-2 py-0.5 rounded-full ${TAG_COLORS[tag.color] || TAG_COLORS.blue}`}
                >
                  {tag.name}
                </span>
              ))}
              {tags.length > 2 && (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  +{tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

ContactCard.displayName = 'ContactCard';

export default ContactCard;