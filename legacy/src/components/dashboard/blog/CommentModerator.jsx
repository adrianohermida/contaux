import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

export default function CommentModerator({ blogPostId, onUpdate }) {
  const [expandedComment, setExpandedComment] = useState(null);
  const [isProcessing, setIsProcessing] = useState({});

  const { data: comments = [], refetch } = useQuery({
    queryKey: ['blog-comments-pending', blogPostId],
    queryFn: async () => {
      if (!blogPostId) return [];
      return base44.entities.BlogComment.filter(
        { blog_post_id: blogPostId, status: 'pending' },
        '-created_date'
      );
    },
    enabled: !!blogPostId,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const handleApprove = async (commentId) => {
    setIsProcessing(prev => ({ ...prev, [commentId]: 'approving' }));
    try {
      await base44.entities.BlogComment.update(commentId, { status: 'approved' });
      refetch();
      if (onUpdate) onUpdate();
    } finally {
      setIsProcessing(prev => ({ ...prev, [commentId]: null }));
    }
  };

  const handleReject = async (commentId) => {
    setIsProcessing(prev => ({ ...prev, [commentId]: 'rejecting' }));
    try {
      await base44.entities.BlogComment.update(commentId, { status: 'rejected' });
      refetch();
      if (onUpdate) onUpdate();
    } finally {
      setIsProcessing(prev => ({ ...prev, [commentId]: null }));
    }
  };

  const handleMarkSpam = async (commentId) => {
    setIsProcessing(prev => ({ ...prev, [commentId]: 'spamming' }));
    try {
      await base44.entities.BlogComment.update(commentId, { status: 'spam' });
      refetch();
      if (onUpdate) onUpdate();
    } finally {
      setIsProcessing(prev => ({ ...prev, [commentId]: null }));
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-blue-500" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Comentários Pendentes</h3>
        </div>
        <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-sm font-medium">
          {comments.length}
        </span>
      </div>

      {comments.length === 0 ? (
        <div className="text-center py-8 text-slate-600 dark:text-slate-400">
          <CheckCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p>Nenhum comentário pendente de moderação</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => (
            <div
              key={comment.id}
              className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="font-semibold text-slate-900 dark:text-white">{comment.author_name}</h5>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{comment.author_email}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(comment.created_date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                {comment.rating > 0 && (
                  <div className="flex gap-1">
                    {[...Array(comment.rating)].map((_, i) => <span key={i}>⭐</span>)}
                  </div>
                )}
              </div>

              <p
                className="text-slate-700 dark:text-slate-300 text-sm cursor-pointer"
                onClick={() => setExpandedComment(expandedComment === comment.id ? null : comment.id)}
              >
                {expandedComment === comment.id ? comment.content : comment.content.substring(0, 100) + (comment.content.length > 100 ? '...' : '')}
              </p>

              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  onClick={() => handleApprove(comment.id)}
                  disabled={isProcessing[comment.id] !== null}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isProcessing[comment.id] === 'approving' ? 'Aprovando...' : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Aprovar
                    </>
                  )}
                </Button>

                <Button
                  size="sm"
                  onClick={() => handleReject(comment.id)}
                  disabled={isProcessing[comment.id] !== null}
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/10"
                >
                  {isProcessing[comment.id] === 'rejecting' ? 'Rejeitando...' : (
                    <>
                      <XCircle className="w-4 h-4 mr-1" />
                      Rejeitar
                    </>
                  )}
                </Button>

                <Button
                  size="sm"
                  onClick={() => handleMarkSpam(comment.id)}
                  disabled={isProcessing[comment.id] !== null}
                  variant="outline"
                  className="text-orange-600 border-orange-200 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-900/10"
                >
                  {isProcessing[comment.id] === 'spamming' ? 'Marcando...' : (
                    <>
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      Spam
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}