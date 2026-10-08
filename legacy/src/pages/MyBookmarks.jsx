import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Bookmark, Calendar, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProtectedRoute from '../components/dashboard/ProtectedRoute';

function MyBookmarksContent() {
  const [bookmarks, setBookmarks] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      const user = await base44.auth.me();
      const userBookmarks = await base44.entities.BlogBookmark.filter(
        { user_email: user.email },
        '-created_date'
      );
      setBookmarks(userBookmarks);

      // Carregar posts dos bookmarks
      const postIds = userBookmarks.map(b => b.blog_post_id);
      if (postIds.length > 0) {
        const blogPosts = await base44.entities.BlogPost.list();
        const filteredPosts = blogPosts.filter(p => postIds.includes(p.id));
        setPosts(filteredPosts);
      }
    } catch (error) {
      console.error('Erro ao carregar bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (bookmarkId) => {
    if (!confirm('Deseja remover este artigo dos favoritos?')) return;

    try {
      await base44.entities.BlogBookmark.delete(bookmarkId);
      await loadBookmarks();
    } catch (error) {
      alert('Erro ao remover bookmark: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando seus artigos salvos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-4">
            <Bookmark className="w-8 h-8" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Meus Artigos Salvos</h1>
          </div>
          <p className="text-blue-100 mb-4 text-sm sm:text-base">
            {bookmarks.length} {bookmarks.length === 1 ? 'artigo salvo' : 'artigos salvos'}
          </p>
          <div className="flex gap-2 text-xs sm:text-sm">
            <Link to={createPageUrl('Blog')} className="hover:underline">Blog</Link>
            <span>/</span>
            <span>Meus Favoritos</span>
          </div>
        </div>
      </section>

      {/* Bookmarks List */}
      <section className="py-12 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {bookmarks.length === 0 ? (
            <div className="text-center py-12">
              <Bookmark className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Nenhum artigo salvo ainda</h3>
              <p className="text-slate-600 mb-6">Salve artigos interessantes para ler depois</p>
              <Link to={createPageUrl('Blog')}>
                <Button>Explorar Artigos</Button>
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookmarks.map(bookmark => {
                const post = posts.find(p => p.id === bookmark.blog_post_id);
                if (!post) return null;

                return (
                  <div key={bookmark.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                    {post.featured_image && (
                      <img 
                        src={post.featured_image} 
                        alt={post.title} 
                        className="w-full h-48 object-cover" 
                      />
                    )}
                    <div className="p-4">
                      <Link to={`${createPageUrl('BlogSingle')}?id=${post.id}`}>
                        <h4 className="font-bold text-lg mb-2 hover:text-blue-600 line-clamp-2">
                          {post.title}
                        </h4>
                      </Link>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          {new Date(bookmark.created_date).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="flex items-center gap-2">
                          <Eye className="w-3 h-3" />
                          {post.views || 0}
                        </div>
                      </div>

                      {bookmark.notes && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mb-3">
                          <p className="text-xs text-slate-700">{bookmark.notes}</p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Link to={`${createPageUrl('BlogSingle')}?id=${post.id}`} className="flex-1">
                          <Button variant="outline" className="w-full text-sm">
                            Ler Artigo
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeBookmark(bookmark.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function MyBookmarks() {
  return (
    <ProtectedRoute>
      <MyBookmarksContent />
    </ProtectedRoute>
  );
}