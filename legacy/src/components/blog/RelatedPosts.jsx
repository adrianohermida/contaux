import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Calendar, Eye } from 'lucide-react';

export default function RelatedPosts({ currentPostId, categoryId, tags = [] }) {
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRelatedPosts();
  }, [currentPostId, categoryId]);

  const loadRelatedPosts = async () => {
    try {
      // Buscar posts da mesma categoria
      const posts = await base44.entities.BlogPost.filter(
        { status: 'published', category_id: categoryId },
        '-publish_date',
        10
      );

      // Remover o post atual
      let filtered = posts.filter(p => p.id !== currentPostId);

      // Ordenar por relevância (tags em comum)
      if (tags.length > 0) {
        filtered = filtered.map(post => {
          const commonTags = (post.tags || []).filter(tag => tags.includes(tag));
          return { ...post, relevance: commonTags.length };
        }).sort((a, b) => b.relevance - a.relevance);
      }

      setRelatedPosts(filtered.slice(0, 3));
    } catch (error) {
      console.error('Erro ao carregar posts relacionados:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-slate-500">Carregando posts relacionados...</div>;
  }

  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-50 py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h3 className="text-2xl font-bold mb-8 text-slate-900">Artigos Relacionados</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {relatedPosts.map(post => (
            <Link key={post.id} to={`${createPageUrl('BlogSingle')}?id=${post.id}`}>
              <div className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow h-full">
                {post.featured_image && (
                  <img 
                    src={post.featured_image} 
                    alt={post.title}
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-4">
                  <h4 className="font-bold text-slate-900 mb-2 line-clamp-2 hover:text-blue-600">
                    {post.title}
                  </h4>
                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.publish_date || post.created_date).toLocaleDateString('pt-BR', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {post.views || 0}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}