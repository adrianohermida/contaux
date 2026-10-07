import React, { useState, useEffect } from 'react';
import { Calendar, MessageCircle, Eye, Twitter, Facebook, Linkedin, Share2, User, ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import RelatedPosts from '../components/blog/RelatedPosts';
import TableOfContents from '../components/blog/TableOfContents';
import ReadingTime from '../components/blog/ReadingTime';
import BlogReactions from '../components/blog/BlogReactions';
import BookmarkButton from '../components/blog/BookmarkButton';
import ShareButtons from '../components/blog/ShareButtons';

export default function BlogSingle() {
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentForm, setCommentForm] = useState({
    author_name: '',
    author_email: '',
    content: '',
    rating: 5
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadBlogPost();
    addSchemaOrg();
  }, []);

  const addSchemaOrg = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const blogId = urlParams.get('id');
    if (!blogId) return;

    try {
      const response = await base44.functions.invoke('generateSchemaOrg', { type: 'blog-post', id: blogId });
      // Remove schema anterior se existir
      const oldSchema = document.querySelector('script[type="application/ld+json"]');
      if (oldSchema) oldSchema.remove();

      // Adiciona novo schema
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(response.data, null, 2);
      document.head.appendChild(script);
    } catch (error) {
      console.error('Erro ao adicionar Schema.org:', error);
    }
  };

  const loadBlogPost = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const blogId = urlParams.get('id');

      if (!blogId) {
        setLoading(false);
        return;
      }

      const blogs = await base44.entities.BlogPost.filter({ id: blogId, status: 'published' });
      
      if (blogs.length > 0) {
        setBlog(blogs[0]);
        
        // Track view
        await base44.functions.invoke('trackBlogView', { blog_post_id: blogId });

        // Load comments
        const blogComments = await base44.entities.BlogComment.filter(
          { blog_post_id: blogId, status: 'approved' },
          '-created_date'
        );
        setComments(blogComments);
      }
    } catch (error) {
      console.error('Erro ao carregar blog:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await base44.functions.invoke('submitBlogComment', {
        blog_post_id: blog.id,
        author_name: commentForm.author_name,
        author_email: commentForm.author_email,
        content: commentForm.content,
        rating: commentForm.rating
      });

      setCommentForm({
        author_name: '',
        author_email: '',
        content: '',
        rating: 5
      });

      // Reload comments
      const updatedComments = await base44.entities.BlogComment.filter(
        { blog_post_id: blog.id, status: 'approved' },
        '-created_date'
      );
      setComments(updatedComments);
    } catch (error) {
      console.error('Erro ao submeter comentário:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background-primary)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-interactive-default)] mx-auto mb-[var(--spacing-md)]"></div>
          <p className="text-[var(--color-foreground-secondary)]">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-[var(--color-background-primary)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-[var(--font-size-2xl)] font-bold text-[var(--color-foreground-primary)] mb-[var(--spacing-md)]">Post não encontrado</h2>
          <Link to={createPageUrl('Blog')}>
            <Button variant="outline">Voltar para o Blog</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background-primary)]">
      {/* Header with Image */}
      <section 
        className="bg-cover bg-center text-white py-[var(--spacing-2xl)] relative"
        style={{
          backgroundImage: blog.featured_image 
            ? `url(${blog.featured_image})` 
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="max-w-4xl mx-auto px-[var(--spacing-md)] sm:px-[var(--spacing-lg)] relative z-10">
          <Link to={createPageUrl('Blog')} className="inline-flex items-center gap-[var(--spacing-sm)] text-white/90 hover:text-white mb-[var(--spacing-lg)] text-[var(--font-size-sm)]">
            <ArrowLeft className="w-4 h-4" />
            Voltar para o Blog
          </Link>
          <h1 className="text-[var(--font-size-3xl)] sm:text-[var(--font-size-4xl)] md:text-[var(--font-size-5xl)] font-bold mb-[var(--spacing-md)]">{blog.title}</h1>
          {blog.excerpt && (
            <p className="text-blue-100 mb-[var(--spacing-lg)] text-[var(--font-size-lg)]">{blog.excerpt}</p>
          )}
        </div>
      </section>

      {/* Blog Content */}
      <section className="py-[var(--spacing-lg)] sm:py-[var(--spacing-2xl)] px-[var(--spacing-md)] sm:px-[var(--spacing-lg)] max-w-7xl mx-auto">
        <div>
          <div className="grid lg:grid-cols-4 gap-[var(--spacing-xl)]">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-[var(--spacing-xl)]">
            <div>
              <div className="flex items-center gap-[var(--spacing-sm)] mb-[var(--spacing-lg)]">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-[var(--color-interactive-default)]" />
                </div>
                <span className="text-[var(--color-foreground-secondary)] font-medium">{blog.author}</span>
              </div>
              <div className="flex flex-wrap gap-[var(--spacing-md)] sm:gap-[var(--spacing-lg)] text-[var(--font-size-sm)] text-[var(--color-foreground-secondary)] mb-[var(--spacing-lg)]">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(blog.publish_date || blog.created_date).toLocaleDateString('pt-BR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
                <ReadingTime content={blog.content} />
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  {comments.length} Comentários
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  {blog.views || 0} Visualizações
                </div>
              </div>
            </div>

            {/* Content */}
            <div 
              className="prose prose-lg max-w-none text-[var(--color-foreground-primary)] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            {/* Actions Bar */}
            <div className="flex flex-wrap gap-[var(--spacing-sm)] py-[var(--spacing-lg)] border-t border-[var(--color-border-default)]">
              <BookmarkButton blogPostId={blog.id} />
              <Button variant="outline" onClick={() => window.print()}>
                🖨️ Imprimir
              </Button>
            </div>

            {/* Tags & Share */}
            <div className="grid sm:grid-cols-2 gap-[var(--spacing-xl)] py-[var(--spacing-xl)] border-t border-b border-[var(--color-border-default)]">
              <div>
                <h5 className="font-bold mb-[var(--spacing-md)] text-[var(--color-foreground-primary)]">Tags Relacionadas</h5>
                <div className="flex flex-wrap gap-[var(--spacing-sm)]">
                  {(blog.tags || []).slice(0, 5).map((tag, idx) => (
                    <span key={idx} className="px-[var(--spacing-sm)] py-[var(--spacing-xs)] bg-[var(--color-background-secondary)] text-[var(--color-foreground-secondary)] text-[var(--font-size-sm)] rounded hover:bg-[var(--color-interactive-default)] hover:text-white transition-colors cursor-pointer">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <ShareButtons title={blog.title} url={window.location.href} />
              </div>
            </div>

            {/* Reactions */}
            <BlogReactions blogPostId={blog.id} />

            {/* Comments */}
            <div className="space-y-[var(--spacing-lg)]">
              <h3 className="text-[var(--font-size-2xl)] font-bold text-[var(--color-foreground-primary)]">Comentários ({comments.length})</h3>

              {/* Comment Form */}
              <form onSubmit={handleCommentSubmit} className="bg-[var(--color-background-secondary)] p-[var(--spacing-lg)] rounded-lg space-y-[var(--spacing-md)]">
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={commentForm.author_name}
                  onChange={(e) => setCommentForm({ ...commentForm, author_name: e.target.value })}
                  required
                  className="w-full px-[var(--spacing-md)] py-[var(--spacing-xs)] border border-[var(--color-border-default)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-interactive-default)]"
                />
                <input
                  type="email"
                  placeholder="Seu email"
                  value={commentForm.author_email}
                  onChange={(e) => setCommentForm({ ...commentForm, author_email: e.target.value })}
                  required
                  className="w-full px-[var(--spacing-md)] py-[var(--spacing-xs)] border border-[var(--color-border-default)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-interactive-default)]"
                />
                <textarea
                  placeholder="Seu comentário..."
                  value={commentForm.content}
                  onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-[var(--spacing-md)] py-[var(--spacing-xs)] border border-[var(--color-border-default)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-interactive-default)]"
                />
                <div>
                  <label className="block text-[var(--font-size-sm)] font-medium text-[var(--color-foreground-primary)] mb-[var(--spacing-sm)]">
                    Avaliação (0-5 estrelas)
                  </label>
                  <select
                    value={commentForm.rating}
                    onChange={(e) => setCommentForm({ ...commentForm, rating: parseInt(e.target.value) })}
                    className="w-full px-[var(--spacing-md)] py-[var(--spacing-xs)] border border-[var(--color-border-default)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-interactive-default)]"
                  >
                    <option value={5}>5 ⭐⭐⭐⭐⭐</option>
                    <option value={4}>4 ⭐⭐⭐⭐</option>
                    <option value={3}>3 ⭐⭐⭐</option>
                    <option value={2}>2 ⭐⭐</option>
                    <option value={1}>1 ⭐</option>
                  </select>
                </div>
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full bg-[var(--color-interactive-default)] hover:bg-[var(--color-interactive-hover)] text-white"
                >
                  {submitting ? 'Enviando...' : 'Enviar Comentário'}
                </Button>
                </form>

                {/* Comments List */}
                <div className="space-y-[var(--spacing-md)]">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-[var(--color-background-secondary)] p-[var(--spacing-md)] rounded-lg">
                    <div className="flex items-start gap-[var(--spacing-sm)] mb-[var(--spacing-xs)]">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-[var(--font-size-sm)] font-bold text-[var(--color-interactive-default)]">
                          {comment.author_name[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h5 className="font-bold text-[var(--color-foreground-primary)]">{comment.author_name}</h5>
                        <p className="text-[var(--font-size-sm)] text-[var(--color-foreground-secondary)]">
                          {new Date(comment.created_date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      {comment.rating > 0 && (
                        <div className="flex gap-[var(--spacing-xs)]">
                          {[...Array(comment.rating)].map((_, i) => (
                            <span key={i}>⭐</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-[var(--color-foreground-secondary)] text-[var(--font-size-sm)]">{comment.content}</p>
                  </div>
                ))}
                </div>
                </div>
                </div>

                {/* Sidebar */}
                <aside className="lg:col-span-1">
                <TableOfContents content={blog.content} />
                <div className="mt-[var(--spacing-xl)]">
                <h4 className="font-bold mb-[var(--spacing-md)] text-[var(--color-foreground-primary)]">Posts Relacionados</h4>
                <RelatedPosts categoryId={blog.category_id} currentPostId={blog.id} />
                </div>
                </aside>
                </div>
                </div>
                </section>
    </div>
  );
}