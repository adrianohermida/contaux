import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Heart, Lightbulb, ThumbsUp, Sparkles } from 'lucide-react';

const reactionConfig = {
  like: { icon: ThumbsUp, label: 'Gostei', color: 'text-blue-600', bgColor: 'bg-blue-50', hoverBg: 'hover:bg-blue-100' },
  love: { icon: Heart, label: 'Amei', color: 'text-red-600', bgColor: 'bg-red-50', hoverBg: 'hover:bg-red-100' },
  insightful: { icon: Lightbulb, label: 'Perspicaz', color: 'text-yellow-600', bgColor: 'bg-yellow-50', hoverBg: 'hover:bg-yellow-100' },
  helpful: { icon: Sparkles, label: 'Útil', color: 'text-green-600', bgColor: 'bg-green-50', hoverBg: 'hover:bg-green-100' }
};

export default function BlogReactions({ blogPostId }) {
  const [reactions, setReactions] = useState({});
  const [userReaction, setUserReaction] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReactions();
  }, [blogPostId]);

  const loadReactions = async () => {
    try {
      const allReactions = await base44.entities.BlogReaction.filter({ blog_post_id: blogPostId });
      
      // Contar reações por tipo
      const counts = allReactions.reduce((acc, r) => {
        acc[r.reaction_type] = (acc[r.reaction_type] || 0) + 1;
        return acc;
      }, {});
      
      setReactions(counts);

      // Verificar reação do usuário (por IP ou email se logado)
      try {
        const user = await base44.auth.me();
        const myReaction = allReactions.find(r => r.user_email === user.email);
        if (myReaction) setUserReaction(myReaction.reaction_type);
      } catch {
        // Usuário não autenticado - ok
      }
    } catch (error) {
      console.error('Erro ao carregar reações:', error);
    }
  };

  const handleReaction = async (type) => {
    if (loading) return;
    
    setLoading(true);
    try {
      let userEmail = 'anonymous';
      try {
        const user = await base44.auth.me();
        userEmail = user.email;
      } catch {
        // Usuário não logado
      }

      if (userReaction === type) {
        // Remover reação
        const existingReactions = await base44.entities.BlogReaction.filter({
          blog_post_id: blogPostId,
          user_email: userEmail,
          reaction_type: type
        });
        
        if (existingReactions.length > 0) {
          await base44.entities.BlogReaction.delete(existingReactions[0].id);
        }
        setUserReaction(null);
      } else {
        // Remover reação anterior se existir
        if (userReaction) {
          const existingReactions = await base44.entities.BlogReaction.filter({
            blog_post_id: blogPostId,
            user_email: userEmail
          });
          
          for (const reaction of existingReactions) {
            await base44.entities.BlogReaction.delete(reaction.id);
          }
        }

        // Adicionar nova reação
        await base44.entities.BlogReaction.create({
          blog_post_id: blogPostId,
          user_email: userEmail,
          reaction_type: type
        });
        setUserReaction(type);
      }

      await loadReactions();
    } catch (error) {
      alert('Erro ao reagir: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 rounded-lg p-4 sm:p-6">
      <h4 className="font-bold text-slate-900 mb-4 text-sm sm:text-base">Como você avalia este artigo?</h4>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {Object.entries(reactionConfig).map(([type, config]) => {
          const Icon = config.icon;
          const count = reactions[type] || 0;
          const isActive = userReaction === type;
          
          return (
            <button
              key={type}
              onClick={() => handleReaction(type)}
              disabled={loading}
              className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                isActive 
                  ? `${config.bgColor} border-current ${config.color}` 
                  : `bg-white border-slate-200 text-slate-600 ${config.hoverBg}`
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? config.color : ''}`} />
              <span className="text-xs font-medium">{config.label}</span>
              {count > 0 && (
                <span className="text-xs text-slate-500">{count}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}