import React from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';

export default function MessageBubble({ message, isUser }) {
  const bgColor = isUser ? 'bg-blue-600 text-white ml-auto' : 'bg-slate-200 text-slate-900 mr-auto';
  const textAlign = isUser ? 'text-right' : 'text-left';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`${bgColor} rounded-lg px-4 py-2 max-w-xs lg:max-w-md break-words shadow-sm`}>
        <p className="text-sm">{message.content}</p>
        
        {/* Action indicators */}
        {message.action_type !== 'message' && (
          <div className={`text-xs mt-1.5 flex items-center gap-1 ${isUser ? 'text-blue-100' : 'text-slate-600'}`}>
            {message.action_type === 'ticket_created' && (
              <>
                <CheckCircle2 className="w-3 h-3" />
                <span>Ticket #{message.metadata?.ticket_id} criado</span>
              </>
            )}
            {message.action_type === 'transferred' && (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Transferindo para agente...</span>
              </>
            )}
          </div>
        )}
        
        <div className={`text-xs mt-1 opacity-70`}>
          {new Date(message.created_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}