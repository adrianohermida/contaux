import React from 'react';
import { Phone, MessageCircle, MoreVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ContactListItem({ contact, isOnline, onCall, onChat }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
              {contact.name.charAt(0).toUpperCase()}
            </div>
            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
              isOnline ? 'bg-green-500' : 'bg-slate-400'
            }`} />
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 truncate">{contact.name}</p>
            <p className="text-sm text-slate-500 truncate">{contact.email}</p>
            <div className="mt-1">
              <Badge variant={isOnline ? "default" : "secondary"} className="text-xs">
                {isOnline ? '🟢 Online' : '⚪ Offline'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onCall(contact)}
            className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-all"
            title="Chamar"
          >
            <Phone className="w-5 h-5" />
          </button>
          <button
            onClick={() => onChat(contact)}
            className="p-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-all"
            title="Mensagem"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}