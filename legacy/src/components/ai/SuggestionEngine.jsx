import React, { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Lightbulb, Loader2 } from 'lucide-react';

/**
 * AI Suggestion Engine - Recomenda ações inteligentes baseado em dados
 * Usa InvokeLLM para gerar sugestões contextualizadas
 */
export default function SuggestionEngine({ workspaceId, entityType, contextData }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const generateSuggestions = useCallback(async () => {
    if (!workspaceId || !entityType) return;

    setLoading(true);
    try {
      const prompt = buildPrompt(entityType, contextData);
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            suggestions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  action: { type: 'string' },
                  priority: { type: 'string', enum: ['low', 'medium', 'high'] },
                  confidence: { type: 'number' }
                }
              }
            }
          }
        }
      });

      setSuggestions(response.suggestions || []);
    } catch (error) {
      console.error('Erro ao gerar sugestões:', error);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, entityType, contextData]);

  // Auto-generate on mount
  React.useEffect(() => {
    generateSuggestions();
  }, [generateSuggestions]);

  return (
    <div className="space-y-3">
      {loading && (
        <div className="flex items-center gap-2 text-blue-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Gerando sugestões...</span>
        </div>
      )}

      {suggestions.map((suggestion, idx) => (
        <div
          key={idx}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-blue-900">{suggestion.title}</h4>
              <p className="text-sm text-blue-800 mt-1">{suggestion.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(suggestion.priority)}`}>
                  {suggestion.priority}
                </span>
                <span className="text-xs text-blue-600">
                  Confiança: {Math.round(suggestion.confidence * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}

      {!loading && suggestions.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          Nenhuma sugestão disponível no momento
        </div>
      )}
    </div>
  );
}

function buildPrompt(entityType, contextData) {
  const baseContext = {
    Invoice: 'Você é um especialista em gestão financeira analisando faturas.',
    Client: 'Você é um especialista em CRM analisando dados de clientes.',
    Payment: 'Você é um especialista em gestão de pagamentos analisando transações.',
    LegalProcess: 'Você é um especialista em processos judiciais analisando casos.',
  };

  return `${baseContext[entityType] || 'Você é um assistente de negócios inteligente.'}

Contexto atual:
${JSON.stringify(contextData, null, 2)}

Gere 3-5 sugestões acionáveis e bem fundamentadas para otimizar a situação. 
Cada sugestão deve incluir:
- title: Título breve
- description: Explicação detalhada
- action: Ação específica a tomar
- priority: Prioridade (low/medium/high)
- confidence: Confiança da sugestão (0-1)`;
}

function getPriorityColor(priority) {
  const colors = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-red-100 text-red-700'
  };
  return colors[priority] || colors.medium;
}