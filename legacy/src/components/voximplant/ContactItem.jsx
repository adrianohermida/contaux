import React from 'react';
import { Phone, MessageCircle, Circle } from 'lucide-react';

export default function ContactItem({ contact, onCall, onChat, isOnline }) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-slate-50 border-b border-slate-200 transition-all">
      <div className="flex items-center gap-3 flex-1">
        {/* Avatar */}
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
            {contact.name.charAt(0).toUpperCase()}
          </div>
          {isOnline && (
            <Circle className="w-4 h-4 bg-green-500 absolute bottom-0 right-0 rounded-full" />
          )}
        </div>

        {/* Contact Info */}
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900">{contact.name}</h3>
          <p className="text-sm text-slate-600">{contact.email}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onCall(contact)}
          className="p-2 hover:bg-blue-100 rounded-full transition-all text-blue-600 hover:text-blue-700"
          title="Fazer chamada"
        >
          <Phone className="w-5 h-5" />
        </button>
        <button
          onClick={() => onChat(contact)}
          className="p-2 hover:bg-blue-100 rounded-full transition-all text-blue-600 hover:text-blue-700"
          title="Enviar mensagem"
        >
          <MessageCircle className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}