import React, { useState } from 'react';
import { Wand2, Loader, Lightbulb, FileText } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

export default function AIAssistant({ onIdeaSelect, onContentGenerated }) {
  const [activeSection, setActiveSection] = useState('ideas');
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState([]);
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');

  const generateIdeas = async () => {
    if (!topic.trim()) return;

    setLoading(true);
    try {
      const response = await base44.functions.invoke('aiGenerateBlogIdea', {
        topic: topic.trim(),
        keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
        tone: 'professional'
      });
      setIdeas(response.data.ideas || []);
    } catch (error) {
      alert('Erro ao gerar ideias: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateContent = async (idea) => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('aiWriteBlogContent', {
        title: idea.title,
        keywords: idea.keywords,
        focusKeyword: idea.focusKeyword,
        tone: 'professional'
      });
      onContentGenerated({
        title: idea.title,
        slug: idea.slug,
        excerpt: idea.excerpt,
        content: response.data.content,
        focus_keyword: idea.focusKeyword,
        seo_keywords: idea.keywords
      });
      alert('Conteúdo gerado! Verifique a aba de Conteúdo');
    } catch (error) {
      alert('Erro ao gerar conteúdo: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Wand2 className="w-5 h-5 text-blue-600" />
        Assistente de IA
      </h3>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveSection('ideas')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeSection === 'ideas'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          Gerar Ideias
        </button>
        <button
          onClick={() => setActiveSection('content')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeSection === 'content'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          Gerar Conteúdo
        </button>
      </div>

      {/* Ideas Section */}
      {activeSection === 'ideas' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Tema/Tópico</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ex: impostos para profissionais autônomos"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Palavras-chave (opcional)</label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="palavra1, palavra2, palavra3"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <Button
            onClick={generateIdeas}
            disabled={loading || !topic}
            className="w-full gap-2"
          >
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            {loading ? 'Gerando...' : 'Gerar 5 Ideias'}
          </Button>

          {ideas.length > 0 && (
            <div className="space-y-2 mt-4">
              {ideas.map((idea, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer" onClick={() => onIdeaSelect(idea)}>
                  <h4 className="font-semibold text-slate-900">{idea.title}</h4>
                  <p className="text-sm text-slate-600 mt-1">{idea.excerpt}</p>
                  <p className="text-xs text-slate-500 mt-2">Palavras-chave: {idea.keywords.join(', ')}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content Section */}
      {activeSection === 'content' && (
        <div className="text-center py-8 text-slate-500">
          <p className="mb-4">Selecione uma ideia na aba anterior para gerar conteúdo automático</p>
          {ideas.length > 0 && (
            <div className="space-y-2">
              {ideas.map((idea, idx) => (
                <Button
                  key={idx}
                  onClick={() => generateContent(idea)}
                  disabled={loading}
                  variant="outline"
                  className="w-full text-left justify-start gap-2"
                >
                  {loading ? <Loader className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                  {idea.title}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}