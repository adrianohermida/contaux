import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { MessageCircle, X, Send, Loader } from 'lucide-react';

export default function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [visitorName, setVisitorName] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [showForm, setShowForm] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleStartChat = async (e) => {
    e.preventDefault();
    if (!visitorName || !visitorEmail) return;

    setLoading(true);
    try {
      const conv = await base44.entities.VirtualCounterConversation.create({
        workspace_id: 'public_workspace',
        visitor_name: visitorName,
        visitor_email: visitorEmail,
        status: 'active'
      });
      setConversationId(conv.id);
      setShowForm(false);
      setLoading(false);

      const unsubscribe = base44.entities.VirtualCounterMessage.subscribe((event) => {
        if (event.data.conversation_id === conv.id) {
          setMessages(prev => [...prev, event.data]);
        }
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Erro ao criar conversa:', error);
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !conversationId) return;

    const messageText = input;
    setInput('');

    try {
      const localMsg = {
        id: `temp_${Date.now()}`,
        conversation_id: conversationId,
        sender_type: 'visitor',
        sender_name: visitorName,
        content: messageText,
        created_date: new Date().toISOString()
      };
      setMessages(prev => [...prev, localMsg]);

      await base44.entities.VirtualCounterMessage.create({
        conversation_id: conversationId,
        sender_type: 'visitor',
        sender_name: visitorName,
        content: messageText
      });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setInput(messageText);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 z-40 hover:scale-110"
          aria-label="Abrir chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-96 bg-white dark:bg-slate-800 rounded-lg shadow-2xl flex flex-col z-50 overflow-hidden">
          <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
            <div>
              <h3 className="font-bold">Balcão Virtual</h3>
              <p className="text-xs text-blue-100">Responderemos em breve</p>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                setShowForm(true);
                setMessages([]);
                setConversationId(null);
              }}
              className="hover:bg-blue-700 p-1 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-700">
            {showForm ? (
              <form onSubmit={handleStartChat} className="space-y-3 h-full flex flex-col justify-center">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200 block mb-1">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    placeholder="Seu nome"
                    required
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-600 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200 block mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={visitorEmail}
                    onChange={(e) => setVisitorEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-600 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {loading ? <Loader className="w-4 h-4 inline mr-2 animate-spin" /> : 'Iniciar Chat'}
                </button>
              </form>
            ) : (
              <>
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center">
                    <p className="text-slate-500 dark:text-slate-400 text-xs">
                      Olá! Como podemos ajudar?
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_type === 'visitor' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                          msg.sender_type === 'visitor'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-500'
                        }`}
                      >
                        <p className="text-xs font-semibold mb-0.5 opacity-75">
                          {msg.sender_name}
                        </p>
                        <p>{msg.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
          </div>

          {!showForm && (
            <form onSubmit={handleSendMessage} className="border-t border-slate-200 dark:border-slate-600 p-3 bg-white dark:bg-slate-800 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
}