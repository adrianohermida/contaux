/**
 * Generate Report PDF
 * Backend function to generate PDF reports
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { reportId, report } = body;

    if (!reportId || !report) {
      return Response.json({ error: 'Missing reportId or report data' }, { status: 400 });
    }

    // Create PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;
    const margin = 20;
    const lineHeight = 10;

    // Title
    doc.setFontSize(20);
    doc.text(report.name, margin, yPosition);
    yPosition += lineHeight + 5;

    // Metadata
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Tipo: ${report.type}`, margin, yPosition);
    yPosition += lineHeight;
    doc.text(
      `Gerado em: ${new Date().toLocaleDateString('pt-BR')}`,
      margin,
      yPosition
    );
    yPosition += lineHeight + 10;

    // Description
    if (report.description) {
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text('Descrição:', margin, yPosition);
      yPosition += lineHeight;
      const descLines = doc.splitTextToSize(report.description, pageWidth - 2 * margin);
      doc.setFontSize(10);
      doc.text(descLines, margin, yPosition);
      yPosition += descLines.length * lineHeight + 10;
    }

    // Metrics section
    if (report.metrics && report.metrics.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Métricas Incluídas:', margin, yPosition);
      yPosition += lineHeight + 5;

      doc.setFontSize(10);
      report.metrics.forEach((metric) => {
        const metricLabel = {
          total_contacts: 'Total de Contatos',
          active_contacts: 'Contatos Ativos',
          contact_type: 'Por Tipo (PF/PJ)',
          tags_distribution: 'Distribuição de Tags',
          recent_activity: 'Atividade Recente',
        }[metric] || metric;

        doc.text(`• ${metricLabel}`, margin + 5, yPosition);
        yPosition += lineHeight;

        // Page break if needed
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = 20;
        }
      });
    }

    // Footer
    yPosition = pageHeight - 20;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('© 2026 Contact Manager', margin, yPosition);
    doc.text(`Página 1`, pageWidth - margin - 30, yPosition);

    // Generate PDF bytes
    const pdfBytes = doc.output('arraybuffer');

    // Upload to storage
    const uploadResponse = await base44.integrations.Core.UploadFile({
      file: new Blob([pdfBytes], { type: 'application/pdf' }),
    });

    return Response.json({
      success: true,
      file_url: uploadResponse.file_url,
    });
  } catch (error) {
    console.error('PDF generation failed:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});