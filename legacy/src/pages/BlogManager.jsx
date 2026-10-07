import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, BarChart3, Clock, MessageSquare, Upload, AlertCircle, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import BlogEditor from '../components/dashboard/blog/BlogEditor';
import BlogList from '../components/dashboard/blog/BlogList';
import AIAssistant from '../components/dashboard/blog/AIAssistant';
import SEOAnalyzer from '../components/dashboard/blog/SEOAnalyzer';
import BlogComments from '../components/dashboard/blog/BlogComments';
import BlogAnalyticsDashboard from '../components/dashboard/blog/BlogAnalyticsDashboard';
import BlogScheduler from '../components/dashboard/blog/BlogScheduler';
import CommentModerator from '../components/dashboard/blog/CommentModerator';
import BlogPostCSVUploader from '../components/dashboard/BlogPostCSVUploader';

export default function BlogManager() {
  const [view, setView] = useState('list');
  const [editingBlog, setEditingBlog] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: categories = [], isLoading: categoriesLoading, refetch: refetchCategories, error: categoriesError } = useQuery({
    queryKey: ['BlogCategory-list'],
    queryFn: async () => base44.entities.BlogCategory.list(),
    staleTime: 10 * 60 * 1000,
    retry: 2
  });

  const handleNewBlog = () => {
    setEditingBlog(null);
    setView('editor');
  };

  const handleEditBlog = (blog) => {
    setEditingBlog(blog);
    setView('editor');
  };

  const handleSaveBlog = async (data) => {
    try {
      if (editingBlog?.id) {
        await base44.entities.BlogPost.update(editingBlog.id, data);
        toast.success('Blog atualizado com sucesso');
      } else {
        await base44.entities.BlogPost.create(data);
        toast.success('Blog criado com sucesso');
      }
      setRefreshKey(prev => prev + 1);
      setView('list');
      setEditingBlog(null);
    } catch (error) {
      toast.error('Erro ao salvar blog: ' + error.message);
    }
  };

  const handleContentGenerated = (content) => {
    setEditingBlog(prev => ({
      ...prev || {},
      content: prev?.content ? prev.content + '\n' + content : content
    }));
  };

  if (categoriesError && !categories.length) {
    return (
      <div className="space-y-[var(--spacing-lg)]">
        <h1 className="text-[var(--font-size-3xl)] font-bold text-[var(--color-foreground-primary)]">Gerenciador de Blogs</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-[var(--spacing-2xl)] text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-[var(--spacing-md)]" />
          <p className="text-red-600 mb-[var(--spacing-md)]">Erro ao carregar categorias</p>
          <Button onClick={() => refetchCategories()} className="gap-[var(--spacing-sm)]">
            <RefreshCw className="w-4 h-4" />
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-[var(--spacing-lg)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[var(--font-size-3xl)] font-bold text-[var(--color-foreground-primary)]">Gerenciador de Blogs</h1>
          <p className="text-[var(--color-foreground-secondary)] mt-[var(--spacing-xs)]">Crie, edite, otimize e agende seus artigos com IA</p>
        </div>
        <div className="flex gap-[var(--spacing-sm)]">
          {view === 'list' && (
            <>
              <Button onClick={() => refetchCategories()} variant="outline" size="sm" className="gap-[var(--spacing-sm)]">
                <RefreshCw className="w-4 h-4" />
                Atualizar
              </Button>
              <Button onClick={handleNewBlog} className="gap-[var(--spacing-sm)] bg-[var(--color-interactive-default)] hover:bg-[var(--color-interactive-hover)]">
                <Plus className="w-4 h-4" />
                Novo Blog
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-[var(--spacing-sm)] bg-[var(--color-background-primary)] rounded-lg shadow p-[var(--spacing-xs)] overflow-x-auto">
        <button
          onClick={() => setView('list')}
          className={`px-[var(--spacing-md)] py-[var(--spacing-sm)] rounded-lg font-medium transition-colors whitespace-nowrap ${
            view === 'list'
              ? 'bg-blue-100 text-blue-700'
              : 'text-[var(--color-foreground-secondary)] hover:text-[var(--color-foreground-primary)]'
          }`}
        >
          📋 Lista
        </button>
        <button
          onClick={() => setView('editor')}
          className={`px-[var(--spacing-md)] py-[var(--spacing-sm)] rounded-lg font-medium transition-colors whitespace-nowrap ${
            view === 'editor'
              ? 'bg-blue-100 text-blue-700'
              : 'text-[var(--color-foreground-secondary)] hover:text-[var(--color-foreground-primary)]'
          }`}
        >
          ✍️ Editor
        </button>
        <button
          onClick={() => setView('analytics')}
          className={`px-[var(--spacing-md)] py-[var(--spacing-sm)] rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-[var(--spacing-sm)] ${
            view === 'analytics'
              ? 'bg-blue-100 text-blue-700'
              : 'text-[var(--color-foreground-secondary)] hover:text-[var(--color-foreground-primary)]'
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Analytics
        </button>
        <button
          onClick={() => setView('scheduler')}
          className={`px-[var(--spacing-md)] py-[var(--spacing-sm)] rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-[var(--spacing-sm)] ${
            view === 'scheduler'
              ? 'bg-blue-100 text-blue-700'
              : 'text-[var(--color-foreground-secondary)] hover:text-[var(--color-foreground-primary)]'
          }`}
        >
          <Clock className="w-4 h-4" /> Agendamento
        </button>
        <button
          onClick={() => setView('moderator')}
          className={`px-[var(--spacing-md)] py-[var(--spacing-sm)] rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-[var(--spacing-sm)] ${
            view === 'moderator'
              ? 'bg-blue-100 text-blue-700'
              : 'text-[var(--color-foreground-secondary)] hover:text-[var(--color-foreground-primary)]'
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Moderação
        </button>
        <button
          onClick={() => setView('assistant')}
          className={`px-[var(--spacing-md)] py-[var(--spacing-sm)] rounded-lg font-medium transition-colors whitespace-nowrap ${
            view === 'assistant'
              ? 'bg-blue-100 text-blue-700'
              : 'text-[var(--color-foreground-secondary)] hover:text-[var(--color-foreground-primary)]'
          }`}
        >
          🤖 Assistente IA
        </button>
        <button
          onClick={() => setView('import')}
          className={`px-[var(--spacing-md)] py-[var(--spacing-sm)] rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-[var(--spacing-sm)] ${
            view === 'import'
              ? 'bg-blue-100 text-blue-700'
              : 'text-[var(--color-foreground-secondary)] hover:text-[var(--color-foreground-primary)]'
          }`}
        >
          <Upload className="w-4 h-4" /> Importar CSV
        </button>
        </div>

      {/* Content */}
      {view === 'list' && (
        <BlogList
          key={refreshKey}
          onEdit={handleEditBlog}
          categories={categories}
        />
      )}

      {view === 'editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[var(--spacing-lg)]">
          <div className="lg:col-span-2">
            <div className="bg-[var(--color-background-primary)] rounded-lg shadow p-[var(--spacing-lg)]">
              <h2 className="text-xl font-bold text-[var(--color-foreground-primary)] mb-[var(--spacing-md)]">
                {editingBlog?.id ? '✏️ Editar Blog' : '📝 Novo Blog'}
              </h2>
              <BlogEditor
                blog={editingBlog}
                onSave={handleSaveBlog}
                categories={categories}
              />
            </div>
          </div>

          <div className="space-y-[var(--spacing-lg)]">
            {editingBlog && (
              <SEOAnalyzer blogData={editingBlog} />
            )}
          </div>
          </div>
          )}

          {view === 'analytics' && editingBlog && (
          <div className="space-y-[var(--spacing-lg)]">
          <h2 className="text-[var(--font-size-2xl)] font-bold text-[var(--color-foreground-primary)]">📊 Analytics - {editingBlog.title}</h2>
          <BlogAnalyticsDashboard blogPostId={editingBlog.id} days={30} />
        </div>
      )}

      {view === 'scheduler' && editingBlog && (
        <div className="max-w-2xl">
          <h2 className="text-[var(--font-size-2xl)] font-bold text-[var(--color-foreground-primary)] mb-[var(--spacing-lg)]">⏰ Agendar Publicação</h2>
          <BlogScheduler 
            blogPostId={editingBlog.id}
            currentStatus={editingBlog.status}
            onSchedule={() => setRefreshKey(prev => prev + 1)}
          />
        </div>
      )}

      {view === 'moderator' && editingBlog && (
        <div>
          <h2 className="text-[var(--font-size-2xl)] font-bold text-[var(--color-foreground-primary)] mb-[var(--spacing-lg)]">💬 Moderação de Comentários</h2>
          <CommentModerator 
            blogPostId={editingBlog.id}
            onUpdate={() => setRefreshKey(prev => prev + 1)}
          />
        </div>
      )}

      {view === 'assistant' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--spacing-lg)]">
          <AIAssistant
            onContentGenerated={handleContentGenerated}
          />

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-[var(--spacing-lg)]">
            <h3 className="text-lg font-semibold text-blue-900 mb-[var(--spacing-md)]">💡 Como Usar</h3>
            <ul className="space-y-[var(--spacing-sm)] text-sm text-blue-800">
              <li className="flex gap-2">
                <span className="font-bold">1.</span>
                <span>Insira um tema ou tópico que você quer explorar</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">2.</span>
                <span>Adicione palavras-chave para melhor otimização SEO</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">3.</span>
                <span>Clique em "Gerar Ideias" para obter 5 sugestões</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">4.</span>
                <span>Selecione uma ideia e gere o conteúdo automático</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">5.</span>
                <span>Revise, otimize e publique seu blog</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {view === 'comments' && (
        <BlogComments />
      )}

      {view === 'import' && (
        <div className="max-w-2xl">
          <h2 className="text-[var(--font-size-2xl)] font-bold text-[var(--color-foreground-primary)] mb-[var(--spacing-lg)]">📥 Importar Publicações</h2>
          <BlogPostCSVUploader 
            onSuccess={() => setRefreshKey(prev => prev + 1)}
          />
        </div>
      )}
      </div>
      );
      }