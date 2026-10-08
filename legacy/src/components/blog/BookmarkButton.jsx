import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BookmarkButton({ blogPostId }) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkBookmark();
  }, [blogPostId]);

  const checkBookmark = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      const bookmarks = await base44.entities.BlogBookmark.filter({
        blog_post_id: blogPostId,
        user_email: currentUser.email
      });
      
      setIsBookmarked(bookmarks.length > 0);
    } catch {
      // Usuário não autenticado
      setUser(null);
    }
  };

  const toggleBookmark = async () => {
    if (!user) {
      alert('Faça login para salvar seus artigos favoritos');
      base44.auth.redirectToLogin(window.location.href);
      return;
    }

    setLoading(true);
    try {
      if (isBookmarked) {
        const bookmarks = await base44.entities.BlogBookmark.filter({
          blog_post_id: blogPostId,
          user_email: user.email
        });
        
        if (bookmarks.length > 0) {
          await base44.entities.BlogBookmark.delete(bookmarks[0].id);
        }
        setIsBookmarked(false);
      } else {
        await base44.entities.BlogBookmark.create({
          blog_post_id: blogPostId,
          user_email: user.email
        });
        setIsBookmarked(true);
      }
    } catch (error) {
      alert('Erro ao salvar favorito: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={toggleBookmark}
      disabled={loading}
      variant={isBookmarked ? "default" : "outline"}
      className="gap-2"
    >
      {isBookmarked ? (
        <>
          <BookmarkCheck className="w-4 h-4" />
          Salvo
        </>
      ) : (
        <>
          <Bookmark className="w-4 h-4" />
          Salvar para depois
        </>
      )}
    </Button>
  );
}