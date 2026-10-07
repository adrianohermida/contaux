import React, { useCallback, useState } from 'react';
import { FileText, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

/**
 * Document Analyzer - Extrai informações de documentos (PDFs, imagens)
 * Usa InvokeLLM com vision capabilities para análise
 */
export default function DocumentAnalyzer({ onAnalysisComplete }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    await analyzeDocument(selectedFile);
  };

  const analyzeDocument = useCallback(async (doc) => {
    setLoading(true);
    try {
      // 1. Upload file
      const uploadResponse = await base44.integrations.Core.UploadFile({ file: doc });
      const fileUrl = uploadResponse.file_url;

      // 2. Analyze com InvokeLLM (com vision)
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: buildAnalysisPrompt(doc.type),
        file_urls: [fileUrl],
        response_json_schema: {
          type: 'object',
          properties: {
            documentType: { type: 'string' },
            extractedData: { type: 'object' },
            confidence: { type: 'number' },
            warnings: { type: 'array', items: { type: 'string' } },
            suggestions: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      setAnalysis(response);
      onAnalysisComplete?.(response);
    } catch (err) {
      setError(err.message);
      console.error('Erro ao analisar documento:', err);
    } finally {
      setLoading(false);
    }
  }, [onAnalysisComplete]);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
        <input
          type="file"
          onChange={handleFileSelect}
          accept=".pdf,.jpg,.jpeg,.png,.xlsx,.csv"
          className="hidden"
          id="docInput"
        />
        <label htmlFor="docInput" className="cursor-pointer">
          <div className="flex flex-col items-center gap-2">
            <FileText className="w-8 h-8 text-blue-500" />
            <span className="font-medium">Envie um documento</span>
            <span className="text-sm text-gray-500">PDF, Imagem, Excel ou CSV</span>
          </div>
        </label>
      </div>

      {loading && (
        <div className="mt-4 flex items-center justify-center gap-2 p-4 bg-blue-50 rounded-lg">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <span className="text-blue-600">Analisando documento...</span>
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-900">Erro na análise</h3>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {analysis && (
        <div className="mt-4 space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="font-medium text-green-900">Análise Concluída</h3>
            </div>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Tipo:</span> {analysis.documentType}
              </p>
              <p>
                <span className="font-medium">Confiança:</span> {Math.round(analysis.confidence * 100)}%
              </p>
            </div>
          </div>

          {analysis.extractedData && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium mb-2">Dados Extraídos</h3>
              <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-40">
                {JSON.stringify(analysis.extractedData, null, 2)}
              </pre>
            </div>
          )}

          {analysis.warnings?.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-medium text-yellow-900 mb-2">Avisos</h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                {analysis.warnings.map((w, i) => (
                  <li key={i}>• {w}</li>
                ))}
              </ul>
            </div>
          )}

          {analysis.suggestions?.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Recomendações</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                {analysis.suggestions.map((s, i) => (
                  <li key={i}>• {s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function buildAnalysisPrompt(fileType) {
  const prompts = {
    'application/pdf': 'Analise este documento PDF em detalhes. Extraia informações financeiras, datas importantes, valores e qualquer conteúdo relevante.',
    'image/jpeg': 'Analise esta imagem de documento. Extraia texto, valores, nomes, datas e qualquer informação relevante.',
    'image/png': 'Analise esta imagem de documento. Extraia texto, valores, nomes, datas e qualquer informação relevante.',
    'application/vnd.ms-excel': 'Analise esta planilha Excel. Extraia estrutura de dados, valores principais e padrões.',
    'text/csv': 'Analise este arquivo CSV. Extraia estrutura de dados e padrões principais.',
  };

  return prompts[fileType] || 'Analise este documento e extraia informações relevantes.';
}