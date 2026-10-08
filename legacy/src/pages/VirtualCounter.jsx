import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { MessageCircle, Plus, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGlobalAuth } from '../components/auth/useGlobalAuth';
import VirtualCounterChat from '../components/virtualCounter/VirtualCounterChat';

export default function VirtualCounter() {
  const { workspaceId } = useGlobalAuth('internal');
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carregar conversas
  useEffect(() => {
    if (!workspaceId) return;

    const loadConversations = async () => {
      try {
        const data = await base44.entities.VirtualCounterConversation.filter({
          workspace_id: workspaceId
        });
        setConversations(data.sort((a, b) => new Date(b.started_at) - new Date(a.started_at)));
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar conversas:', error);
        setLoading(false);
      }
    };

    loadConversations();

    // Subscribe para novas conversas e atualizações
    const unsubscribe = base44.entities.VirtualCounterConversation.subscribe((event) => {
      if (event.type === 'create' && event.data.workspace_id === workspaceId) {
        setConversations(prev => [event.data, ...prev]);
      } else if (event.type === 'update' && event.data.workspace_id === workspaceId) {
        setConversations(prev => 
          prev.map(c => c.id === event.id ? event.data : c)
        );
      } else if (event.type === 'delete' && event.data?.workspace_id === workspaceId) {
        setConversations(prev => prev.filter(c => c.id !== event.id));
      }
    });

    return unsubscribe;
  }, [workspaceId]);

  const handleNewConversation = useCallback(async () => {
    try {
      const conv = await base44.entities.VirtualCounterConversation.create({
        workspace_id: workspaceId,
        status: 'active',
        started_at: new Date().toISOString()
      });
      setSelectedConv(conv.id);
    } catch (error) {
      console.error('Erro ao criar conversa:', error);
    }
  }, [workspaceId]);

  const handleCloseConversation = useCallback(async (convId) => {
    try {
      await base44.entities.VirtualCounterConversation.update(convId, { status: 'closed' });
    } catch (error) {
      console.error('Erro ao fechar conversa:', error);
    }
  }, []);

  const handleDeleteConversation = useCallback(async (convId) => {
    if (confirm('Deletar esta conversa?')) {
      try {
        await base44.entities.VirtualCounterConversation.delete(convId);
        if (selectedConv === convId) setSelectedConv(null);
      } catch (error) {
        console.error('Erro ao deletar conversa:', error);
      }
    }
  }, [selectedConv]);

  const activeConversations = conversations.filter(c => c.status === 'active').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-slate-500">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Balcão Virtual</h1>
          <p className="text-slate-600 mt-1">Gerenciar conversas com clientes</p>
        </div>
        <Button 
          onClick={handleNewConversation}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nova Conversa
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-slate-600">Conversas Ativas</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{activeConversations}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-slate-600">Total de Conversas</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{conversations.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-slate-600">Tickets Criados</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {conversations.filter(c => c.ticket_id).length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de conversas */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b font-semibold text-slate-900">Conversas</div>
            <div className="divide-y max-h-96 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-4 text-sm text-slate-500 text-center">Nenhuma conversa</div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConv(conv.id)}
                    className={`w-full text-left p-3 hover:bg-slate-50 transition-colors border-l-4 ${
                      selectedConv === conv.id
                        ? 'border-l-blue-600 bg-blue-50'
                        : conv.status === 'active'
                        ? 'border-l-emerald-400'
                        : 'border-l-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {conv.visitor_name || 'Visitante'}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {conv.visitor_email || 'sem email'}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(conv.started_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      {conv.unread_count > 0 && (
                        <span className="bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Chat */}
        <div className="lg:col-span-2">
          {selectedConv ? (
            <div className="space-y-4">
              <VirtualCounterChat 
                conversationId={selectedConv}
                onClose={() => setSelectedConv(null)}
              />
              
              {/* Ações */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    const conv = conversations.find(c => c.id === selectedConv);
                    if (conv?.status === 'active') {
                      handleCloseConversation(selectedConv);
                    }
                  }}
                  disabled={conversations.find(c => c.id === selectedConv)?.status !== 'active'}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Fechar Conversa
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteConversation(selectedConv)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Deletar
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow h-96 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Selecione uma conversa para começar</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}