import React, { useState, useEffect } from 'react';
import { Save, FileText, Wand2, Image, Loader } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import BlogScheduler from './BlogScheduler';
import ImageGenerator from './ImageGenerator';

export default function BlogEditor({ blog, onSave, categories = [] }) {
  const [formData, setFormData] = useState(blog || {
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image: '',
    category_id: '',
    seo_title: '',
    seo_description: '',
    focus_keyword: '',
    seo_keywords: [],
    status: 'draft',
    scheduled_date: '',
    publish_date: ''
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('content');

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(formData);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  };

  const handleTitleChange = (value) => {
    handleFieldChange('title', value);
    if (!formData.slug || formData.slug === '') {
      handleFieldChange('slug', generateSlug(value));
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200">
        {['content', 'seo', 'image', 'publish'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab === 'publish' ? '📅 Publicar' : tab === 'image' ? '📸 Imagem' : tab === 'seo' ? '🔍 SEO' : '✍️ Conteúdo'}
          </button>
        ))}
      </div>

      {/* Content Tab */}
      {activeTab === 'content' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Título do Blog</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Digite o título do artigo"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => handleFieldChange('slug', e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="url-amigavel"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Categoria</label>
              <select
                value={formData.category_id || ''}
                onChange={(e) => handleFieldChange('category_id', e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione categoria</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Resumo</label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => handleFieldChange('excerpt', e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
              placeholder="Resumo para preview"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Conteúdo</label>
            <ReactQuill
              value={formData.content}
              onChange={(content) => handleFieldChange('content', content)}
              theme="snow"
              modules={{
                toolbar: [
                  [{ header: [2, 3, false] }],
                  ['bold', 'italic', 'underline'],
                  ['blockquote', 'code-block'],
                  [{ list: 'ordered' }, { list: 'bullet' }],
                  ['link'],
                  ['clean']
                ]
              }}
              className="h-96 bg-white"
            />
          </div>
        </div>
      )}

      {/* SEO Tab */}
      {activeTab === 'seo' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Palavra-chave Principal</label>
            <input
              type="text"
              value={formData.focus_keyword}
              onChange={(e) => handleFieldChange('focus_keyword', e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: contabilidade para advogados"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">SEO Title (50-60 caracteres)</label>
            <input
              type="text"
              value={formData.seo_title}
              onChange={(e) => handleFieldChange('seo_title', e.target.value)}
              maxLength={60}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Título para mecanismos de busca"
            />
            <p className="text-xs text-slate-500 mt-1">{formData.seo_title?.length || 0}/60</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Meta Description (50-160 caracteres)</label>
            <textarea
              value={formData.seo_description}
              onChange={(e) => handleFieldChange('seo_description', e.target.value)}
              maxLength={160}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
              placeholder="Descrição para preview no Google"
            />
            <p className="text-xs text-slate-500 mt-1">{formData.seo_description?.length || 0}/160</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Palavras-chave (separadas por vírgula)</label>
            <textarea
              value={formData.seo_keywords?.join(', ') || ''}
              onChange={(e) => handleFieldChange('seo_keywords', e.target.value.split(',').map(k => k.trim()))}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
              placeholder="palavra1, palavra2, palavra3"
            />
          </div>
        </div>
      )}

      {/* Image Tab */}
      {activeTab === 'image' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Imagem em Destaque</label>
            {formData.featured_image && (
              <div className="mb-4">
                <img src={formData.featured_image} alt="Featured" className="w-full max-h-60 object-cover rounded-lg" />
              </div>
            )}
            <input
              type="text"
              value={formData.featured_image}
              onChange={(e) => handleFieldChange('featured_image', e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="URL da imagem"
            />
            <p className="text-xs text-slate-500 mt-2">Cole a URL da imagem ou use o gerador de IA</p>
          </div>

          <ImageGenerator
            blogTitle={formData.title}
            keywords={formData.seo_keywords}
            onImageGenerated={(url) => handleFieldChange('featured_image', url)}
          />
        </div>
      )}

      {/* Publish Tab */}
      {activeTab === 'publish' && (
        <BlogScheduler
          blogData={formData}
          onSchedule={(scheduleData) => {
            setFormData(prev => ({ ...prev, ...scheduleData }));
          }}
        />
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-slate-200">
        <Button
          onClick={handleSave}
          disabled={loading || !formData.title || !formData.content}
          className="gap-2 flex-1"
        >
          {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {loading ? 'Salvando...' : 'Salvar Blog'}
        </Button>

        <select
          value={formData.status}
          onChange={(e) => handleFieldChange('status', e.target.value)}
          className="px-4 py-2 border border-slate-200 rounded-lg text-sm"
        >
          <option value="draft">Rascunho</option>
          <option value="review">Em Revisão</option>
          <option value="scheduled">Agendado</option>
          <option value="published">Publicado</option>
        </select>

        {formData.status === 'published' && formData.id && (
          <Button
            onClick={async () => {
              try {
                const { toast } = await import('sonner');
                await base44.functions.invoke('sendNewsletterPost', {
                  blog_post_id: formData.id
                });
                toast.success('Newsletter enviada com sucesso!');
              } catch (error) {
                const { toast } = await import('sonner');
                toast.error('Erro ao enviar newsletter: ' + error.message);
              }
            }}
            variant="outline"
            className="gap-2"
          >
            📧 Enviar Newsletter
          </Button>
        )}
      </div>
    </div>
  );
}