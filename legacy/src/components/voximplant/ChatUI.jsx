import React, { useState, useRef, useEffect } from 'react';
import { Send, X } from 'lucide-react';
import { useVoxImplant } from '../hooks/useVoxImplant';

export default function ChatUI({ contact, onClose }) {
  const { messages, sendMessage } = useVoxImplant();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input, contact.id, contact.name);
      setInput('');
    }
  };

  const contactMessages = messages.filter(
    (m) => m.from === contact.id || contact.name === 'all'
  );

  return (
    <div className="fixed bottom-4 right-4 w-96 h-96 bg-white rounded-lg shadow-xl flex flex-col z-40 border border-slate-200">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex items-center justify-between rounded-t-lg">
        <h3 className="font-semibold">{contact.name}</h3>
        <button
          onClick={onClose}
          className="hover:bg-blue-700 p-1 rounded transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
        {contactMessages.length === 0 ? (
          <p className="text-slate-500 text-sm text-center mt-4">
            Nenhuma mensagem ainda
          </p>
        ) : (
          contactMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.from === contact.id ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.from === contact.id
                    ? 'bg-slate-200 text-slate-900'
                    : 'bg-blue-600 text-white'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="border-t border-slate-200 p-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite uma mensagem..."
          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-all"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}