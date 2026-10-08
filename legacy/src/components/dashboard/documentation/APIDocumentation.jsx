import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Copy, CheckCircle, Code } from 'lucide-react';

export default function APIDocumentation() {
  const [copiedCode, setCopiedCode] = useState(null);

  const copyCode = (id, code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const endpoints = [
    {
      id: 'list-clients',
      method: 'GET',
      path: '/api/v1/clients',
      desc: 'Listar todos os clientes',
      params: [
        { name: 'limit', type: 'number', desc: 'Limite de resultados (padrão: 50)' },
        { name: 'offset', type: 'number', desc: 'Deslocamento para paginação' }
      ],
      example: `curl -X GET "https://api.example.com/api/v1/clients?limit=10" \\
  -H "Authorization: Bearer YOUR_API_KEY"`
    },
    {
      id: 'create-invoice',
      method: 'POST',
      path: '/api/v1/invoices',
      desc: 'Criar nova fatura',
      params: [
        { name: 'client_id', type: 'string', desc: 'ID do cliente' },
        { name: 'amount', type: 'number', desc: 'Valor da fatura' },
        { name: 'due_date', type: 'date', desc: 'Data de vencimento' }
      ],
      example: `curl -X POST "https://api.example.com/api/v1/invoices" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "client_id": "123",
    "amount": 1500.00,
    "due_date": "2026-03-21"
  }'`
    },
    {
      id: 'get-report',
      method: 'GET',
      path: '/api/v1/reports/{report_id}',
      desc: 'Obter detalhes de um relatório',
      params: [
        { name: 'report_id', type: 'string', desc: 'ID do relatório (path param)' }
      ],
      example: `curl -X GET "https://api.example.com/api/v1/reports/report-123" \\
  -H "Authorization: Bearer YOUR_API_KEY"`
    }
  ];

  return (
    <div className="space-y-6">
      {/* API Key Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Documentação da API
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Base URL:</strong> https://api.example.com/api/v1
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-900">
              <strong>Autenticação:</strong> Use Bearer token no header Authorization
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Endpoints */}
      <div className="space-y-3">
        {endpoints.map((endpoint) => (
          <Card key={endpoint.id}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded text-xs font-bold text-white ${
                  endpoint.method === 'GET' ? 'bg-blue-600' :
                  endpoint.method === 'POST' ? 'bg-green-600' :
                  endpoint.method === 'PUT' ? 'bg-amber-600' :
                  'bg-red-600'
                }`}>
                  {endpoint.method}
                </span>
                <div className="flex-1">
                  <p className="font-mono text-sm font-semibold">{endpoint.path}</p>
                  <p className="text-sm text-slate-600">{endpoint.desc}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {endpoint.params.length > 0 && (
                <div>
                  <p className="font-medium text-slate-900 mb-2">Parâmetros:</p>
                  <div className="space-y-2">
                    {endpoint.params.map((param, idx) => (
                      <div key={idx} className="px-3 py-2 bg-slate-50 rounded text-sm">
                        <span className="font-mono font-bold text-blue-600">{param.name}</span>
                        <span className="text-slate-600 ml-2">({param.type})</span>
                        <p className="text-xs text-slate-600 mt-1">{param.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="font-medium text-slate-900 mb-2">Exemplo:</p>
                <div className="bg-slate-900 text-slate-100 p-4 rounded font-mono text-xs overflow-x-auto relative group">
                  <pre>{endpoint.example}</pre>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => copyCode(endpoint.id, endpoint.example)}
                  >
                    {copiedCode === endpoint.id ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-400" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* SDK Example */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Exemplo com SDK
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-900 text-slate-100 p-4 rounded font-mono text-xs overflow-x-auto">
            <pre>{`import { base44 } from '@/api/base44Client';

// Listar clientes
const clients = await base44.entities.Client.list();

// Criar fatura
const invoice = await base44.entities.Invoice.create({
  client_id: 'client-123',
  amount: 1500.00,
  due_date: '2026-03-21'
});

// Obter relatório
const report = await base44.entities.Report.get('report-123');`}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}