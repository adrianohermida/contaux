import React, { useState, useCallback } from 'react';
import { MessageCircle, Send, Trash2, Reply } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

/**
 * Comment Thread - Discussões no documento
 * Comentários, respostas, menciones, resoluções
 */
export default function CommentThread({ documentId, selectedText = '' }) {
  const [comments, setComments] = useState([
    {
      id: 1,
      author: 'João',
      avatar: 'J',
      text: 'Este parágrafo precisa de revisão',
      timestamp: new Date(Date.now() - 3600000),
      resolved: false,
      replies: [
        { id: 1.1, author: 'Maria', avatar: 'M', text: 'Concordo, vou revisar', timestamp: new Date(Date.now() - 1800000) }
      ]
    }
  ]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);

  const addComment = useCallback(() => {
    if (!newComment.trim()) return;

    const comment = {
      id: Math.random(),
      author: 'Você',
      avatar: 'V',
      text: newComment,
      timestamp: new Date(),
      resolved: false,
      replies: []
    };

    setComments([...comments, comment]);
    setNewComment('');
  }, [newComment, comments]);

  const resolveComment = useCallback((commentId) => {
    setComments(comments.map(c =>
      c.id === commentId ? { ...c, resolved: !c.resolved } : c
    ));
  }, [comments]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold">Comentários</h3>
      </div>

      {selectedText && (
        <Card className="p-3 bg-blue-50 border-blue-200">
          <p className="text-xs text-gray-600">Texto selecionado:</p>
          <p className="text-sm font-mono mt-1">"{selectedText}"</p>
        </Card>
      )}

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {comments.map(comment => (
          <Card key={comment.id} className={`p-3 ${comment.resolved ? 'bg-green-50' : 'bg-white'}`}>
            <div className="flex gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback>{comment.avatar}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{comment.author}</p>
                  <span className="text-xs text-gray-500">{comment.timestamp.toLocaleTimeString('pt-BR')}</span>
                </div>
                <p className="text-sm text-gray-700 mt-1">{comment.text}</p>
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => resolveComment(comment.id)}
                    className="text-xs"
                  >
                    {comment.resolved ? '✅ Resolvido' : 'Marcar como resolvido'}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-3">
        <div className="flex gap-2">
          <Input
            placeholder="Deixe um comentário..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addComment()}
          />
          <Button onClick={addComment} size="sm">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}