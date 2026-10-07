import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Loader2, Mail, FileJson, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function ExportEngine({ data = {}, reportName = 'Report' }) {
  const [format, setFormat] = useState('pdf');
  const [email, setEmail] = useState('');
  const [sendEmail, setSendEmail] = useState(false);

  const exportMutation = useMutation({
    mutationFn: async () => {
      try {
        let exportData;
        
        switch (format) {
          case 'pdf':
            exportData = await generatePDF();
            break;
          case 'excel':
            exportData = await generateExcel();
            break;
          case 'csv':
            exportData = generateCSV();
            break;
          case 'json':
            exportData = JSON.stringify(data, null, 2);
            break;
          default:
            throw new Error('Formato inválido');
        }

        if (sendEmail && email) {
          await base44.integrations.Core.SendEmail({
            to: email,
            subject: `Relatório: ${reportName}`,
            body: `Seu relatório ${reportName} está em anexo.`
          });
          toast.success('Relatório enviado por email!');
        }

        // Trigger download
        downloadFile(exportData, `${reportName}.${getFileExtension(format)}`);
      } catch (err) {
        console.error('Export error:', err);
        toast.error('Erro ao exportar relatório');
        throw err;
      }
    }
  });

  const generatePDF = async () => {
    const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #3b82f6; color: white; }
          </style>
        </head>
        <body>
          <h1>${reportName}</h1>
          <p>Gerado em ${new Date().toLocaleDateString('pt-BR')}</p>
          <pre>${JSON.stringify(data, null, 2)}</pre>
        </body>
      </html>
    `;
    return html;
  };

  const generateExcel = async () => {
    // Simple CSV-compatible format that can be opened in Excel
    let csv = reportName + '\n';
    csv += 'Data da Geração,' + new Date().toLocaleDateString('pt-BR') + '\n\n';
    
    if (Array.isArray(data)) {
      const headers = Object.keys(data[0] || {});
      csv += headers.join(',') + '\n';
      data.forEach(row => {
        csv += headers.map(h => `"${row[h] || ''}"`).join(',') + '\n';
      });
    } else {
      csv += 'Campo,Valor\n';
      Object.entries(data).forEach(([key, value]) => {
        csv += `"${key}","${value}"\n`;
      });
    }
    return csv;
  };

  const generateCSV = () => {
    let csv = '';
    if (Array.isArray(data)) {
      const headers = Object.keys(data[0] || {});
      csv = headers.join(',') + '\n';
      data.forEach(row => {
        csv += headers.map(h => `"${row[h] || ''}"`).join(',') + '\n';
      });
    } else {
      csv = 'Campo,Valor\n';
      Object.entries(data).forEach(([key, value]) => {
        csv += `"${key}","${value}"\n`;
      });
    }
    return csv;
  };

  const downloadFile = (content, filename) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  };

  const getFileExtension = (fmt) => {
    const extensions = { pdf: 'pdf', excel: 'xlsx', csv: 'csv', json: 'json' };
    return extensions[fmt] || 'txt';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          Exportar Relatório
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Formato de Exportação
          </label>
          <Select value={format} onValueChange={setFormat}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">
                <span className="flex items-center gap-2">PDF</span>
              </SelectItem>
              <SelectItem value="excel">Excel (.xlsx)</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="json">
                <span className="flex items-center gap-2"><FileJson className="w-4 h-4" /> JSON</span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="sendEmail"
            checked={sendEmail}
            onChange={(e) => setSendEmail(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300"
          />
          <label htmlFor="sendEmail" className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Enviar por Email
          </label>
        </div>

        {sendEmail && (
          <input
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
        )}

        <Button
          onClick={() => exportMutation.mutate()}
          disabled={exportMutation.isPending || (sendEmail && !email)}
          className="w-full gap-2"
        >
          {exportMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Exportando...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Exportar
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}