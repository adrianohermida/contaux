import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertTriangle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function BlogComments() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('pending');

  useEffect(() => {
    loadComments();
  }, [filterStatus]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const query = filterStatus === 'all' ? {} : { status: filterStatus };
      const data = await base44.entities.BlogComment.filter(query, '-created_date', 100);
      setComments(data);
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (commentId, newStatus, notes = '') => {
    try {
      const user = await base44.auth.me();
      await base44.entities.BlogComment.update(commentId, {
        status: newStatus,
        moderated_by: user.email,
        moderation_notes: notes
      });
      loadComments();
    } catch (error) {
      alert('Erro ao moderar comentário: ' + error.message);
    }
  };

  const handleDelete = async (commentId) => {
    if (!confirm('Tem certeza que deseja deletar este comentário?')) return;
    
    try {
      await base44.entities.BlogComment.delete(commentId);
      loadComments();
    } catch (error) {
      alert('Erro ao deletar comentário: ' + error.message);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendente' },
      approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Aprovado' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejeitado' },
      spam: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Spam' }
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Moderação de Comentários</h2>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-slate-200 rounded-lg"
        >
          <option value="all">Todos</option>
          <option value="pending">Pendentes</option>
          <option value="approved">Aprovados</option>
          <option value="rejected">Rejeitados</option>
          <option value="spam">Spam</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8">Carregando comentários...</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-slate-600">Nenhum comentário encontrado</div>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => (
            <div key={comment.id} className="bg-white p-6 rounded-lg border border-slate-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-slate-900">{comment.author_name}</h4>
                    {getStatusBadge(comment.status)}
                    {comment.rating > 0 && (
                      <span className="text-yellow-500">{'⭐'.repeat(comment.rating)}</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600">{comment.author_email}</p>
                  <p className="text-xs text-slate-500">
                    {format(new Date(comment.created_date), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>

              <p className="text-slate-700 mb-4">{comment.content}</p>

              {comment.moderated_by && (
                <div className="text-xs text-slate-500 mb-4 p-3 bg-slate-50 rounded">
                  <p>Moderado por: {comment.moderated_by}</p>
                  {comment.moderation_notes && <p>Nota: {comment.moderation_notes}</p>}
                </div>
              )}

              <div className="flex gap-2">
                {comment.status !== 'approved' && (
                  <Button
                    size="sm"
                    onClick={() => handleModerate(comment.id, 'approved')}
                    className="gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Aprovar
                  </Button>
                )}
                {comment.status !== 'rejected' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const notes = prompt('Motivo da rejeição (opcional):');
                      handleModerate(comment.id, 'rejected', notes || '');
                    }}
                    className="gap-2 text-red-600 hover:text-red-700"
                  >
                    <XCircle className="w-4 h-4" />
                    Rejeitar
                  </Button>
                )}
                {comment.status !== 'spam' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleModerate(comment.id, 'spam')}
                    className="gap-2 text-orange-600 hover:text-orange-700"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Marcar como Spam
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(comment.id)}
                  className="gap-2 text-slate-600 hover:text-slate-700"
                >
                  <Trash2 className="w-4 h-4" />
                  Deletar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}