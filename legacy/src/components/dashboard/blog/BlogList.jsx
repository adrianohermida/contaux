import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Edit2, Trash2, Search, BarChart, AlertCircle, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import BlogAnalyticsDashboard from './BlogAnalyticsDashboard';

export default function BlogList({ onEdit, categories = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBlogForAnalytics, setSelectedBlogForAnalytics] = useState(null);

  const { data: blogs = [], isLoading, refetch, error } = useQuery({
    queryKey: ['BlogPost-list', statusFilter],
    queryFn: async () => {
      const query = statusFilter === 'all' ? {} : { status: statusFilter };
      return base44.entities.BlogPost.filter(query);
    },
    staleTime: 5 * 60 * 1000,
    retry: 2
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => base44.entities.BlogPost.delete(id),
    onSuccess: () => {
      toast.success('Blog deletado com sucesso');
      refetch();
    },
    onError: (error) => {
      toast.error('Erro ao deletar blog: ' + error.message);
    }
  });

  const handleDeleteBlog = (id, title) => {
    if (confirm(`Tem certeza que deseja deletar "${title}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const filteredBlogs = useMemo(() => {
    return blogs.filter(blog =>
      blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.slug?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [blogs, searchTerm]);

  const getStatusBadge = (status) => {
    const statusMap = {
      draft: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Rascunho' },
      review: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Revisão' },
      scheduled: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Agendado' },
      published: { bg: 'bg-green-100', text: 'text-green-700', label: 'Publicado' }
    };
    const style = statusMap[status] || statusMap.draft;
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      {style.label}
    </span>;
  };

  if (error && !blogs.length) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p className="text-red-600 mb-4">Erro ao carregar blogs</p>
        <Button onClick={() => refetch()} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Tentar Novamente
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return <div className="text-center py-8 text-slate-500">Carregando blogs...</div>;
  }

  if (selectedBlogForAnalytics) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          onClick={() => setSelectedBlogForAnalytics(null)}
        >
          ← Voltar para Lista
        </Button>
        <BlogAnalyticsDashboard blogPostId={selectedBlogForAnalytics} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header & Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por título ou slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm"
          >
            <option value="all">Todos</option>
            <option value="draft">Rascunho</option>
            <option value="review">Revisão</option>
            <option value="scheduled">Agendado</option>
            <option value="published">Publicado</option>
          </select>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por título ou slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-slate-200 rounded-lg text-sm min-w-[150px]"
        >
          <option value="all">Todos</option>
          <option value="draft">Rascunho</option>
          <option value="review">Revisão</option>
          <option value="scheduled">Agendado</option>
          <option value="published">Publicado</option>
        </select>
        <Button onClick={() => refetch()} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Blogs Table */}
      {filteredBlogs.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Nenhum blog encontrado</p>
          <p className="text-slate-400 text-sm mt-1">Tente ajustar seus filtros de busca</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Título</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Views</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">SEO Score</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredBlogs.map(blog => (
                <tr key={blog.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-slate-900">{blog.title}</p>
                      <p className="text-xs text-slate-500">/{blog.slug}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(blog.status)}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{blog.views || 0}</td>
                  <td className="px-6 py-4">
                    {blog.seo_score ? (
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                          <span className="text-sm font-semibold text-blue-600">{blog.seo_score}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedBlogForAnalytics(blog.id)}
                        className="p-2 hover:bg-purple-50 rounded-lg text-purple-600 transition-colors"
                        title="Ver Analytics"
                      >
                        <BarChart className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(blog)}
                        className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBlog(blog.id, blog.title)}
                        disabled={deleteMutation.isPending}
                        className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors disabled:opacity-50"
                        title="Deletar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}