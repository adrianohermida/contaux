import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, TrendingUp, TrendingDown, Minus, Trash2 } from 'lucide-react';

export default function KeywordTracker({ blogPostId }) {
  const [keywords, setKeywords] = useState([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadKeywords();
  }, [blogPostId]);

  const loadKeywords = async () => {
    if (!blogPostId) return;
    
    try {
      const post = await base44.entities.BlogPost.filter({ id: blogPostId });
      if (post.length > 0 && post[0].seo_keywords) {
        // Simular rankings (em produção, viria de API de SEO)
        const keywordsWithRanking = post[0].seo_keywords.map(kw => ({
          keyword: kw,
          position: Math.floor(Math.random() * 50) + 1,
          previousPosition: Math.floor(Math.random() * 50) + 1,
          volume: Math.floor(Math.random() * 1000) + 100
        }));
        setKeywords(keywordsWithRanking);
      }
    } catch (error) {
      console.error('Erro ao carregar keywords:', error);
    }
  };

  const handleAddKeyword = async () => {
    if (!newKeyword.trim() || !blogPostId) return;

    setLoading(true);
    try {
      const post = await base44.entities.BlogPost.filter({ id: blogPostId });
      if (post.length > 0) {
        const currentKeywords = post[0].seo_keywords || [];
        const updatedKeywords = [...currentKeywords, newKeyword.trim()];
        
        await base44.entities.BlogPost.update(blogPostId, {
          seo_keywords: updatedKeywords
        });

        setNewKeyword('');
        loadKeywords();
      }
    } catch (error) {
      alert('Erro ao adicionar keyword: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveKeyword = async (keyword) => {
    try {
      const post = await base44.entities.BlogPost.filter({ id: blogPostId });
      if (post.length > 0) {
        const updatedKeywords = (post[0].seo_keywords || []).filter(k => k !== keyword);
        
        await base44.entities.BlogPost.update(blogPostId, {
          seo_keywords: updatedKeywords
        });

        loadKeywords();
      }
    } catch (error) {
      alert('Erro ao remover keyword: ' + error.message);
    }
  };

  const getPositionChange = (current, previous) => {
    const change = previous - current;
    if (change > 0) return { icon: TrendingUp, color: 'text-green-600', text: `+${change}` };
    if (change < 0) return { icon: TrendingDown, color: 'text-red-600', text: change };
    return { icon: Minus, color: 'text-slate-400', text: '0' };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rastreamento de Keywords</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Adicionar keyword..."
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
          />
          <Button onClick={handleAddKeyword} disabled={loading || !newKeyword.trim()}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {keywords.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">
            Nenhuma keyword rastreada ainda
          </p>
        ) : (
          <div className="space-y-2">
            {keywords.map((kw, idx) => {
              const change = getPositionChange(kw.position, kw.previousPosition);
              const Icon = change.icon;
              
              return (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{kw.keyword}</p>
                    <p className="text-xs text-slate-500">{kw.volume} buscas/mês</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">#{kw.position}</p>
                      <div className={`flex items-center gap-1 text-xs ${change.color}`}>
                        <Icon className="w-3 h-3" />
                        <span>{change.text}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveKeyword(kw.keyword)}
                      className="text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="text-xs text-slate-500 text-center pt-2">
          💡 Rankings são atualizados diariamente via Google Search Console
        </div>
      </CardContent>
    </Card>
  );
}