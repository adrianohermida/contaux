import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Sincronizar dados com Google Sheets
 * Exporta invoices, payments, clients para planilha
 * Requer Google Sheets OAuth configurado
 */

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'Only POST allowed' }, { status: 405 });
    }

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { spreadsheet_id, entity_type, tenant_id } = body;

    if (!spreadsheet_id || !entity_type || !tenant_id) {
      return Response.json(
        { error: 'Missing required: spreadsheet_id, entity_type, tenant_id' },
        { status: 400 }
      );
    }

    // Valida que usuário tem acesso ao tenant
    if (user.tenant_id !== tenant_id && !user.role?.includes('admin')) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Busca dados da entidade
    const data = await base44.asServiceRole.entities[entity_type].filter({ 
      tenant_id: tenant_id 
    });

    if (!data || data.length === 0) {
      return Response.json({ success: true, message: 'No data to sync' });
    }

    // Tenta obter Google Sheets token (requer OAuth autorizado)
    let accessToken;
    try {
      accessToken = await base44.asServiceRole.connectors.getAccessToken('googlesheets');
    } catch (e) {
      return Response.json(
        { error: 'Google Sheets not authorized. Please authorize in dashboard.' },
        { status: 403 }
      );
    }

    // Prepara dados para Sheets
    const headers = Object.keys(data[0] || {});
    const values = [headers, ...data.map(row => headers.map(h => row[h] || ''))];

    // Chama Google Sheets API
    const sheetsResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet_id}/values/A1?valueInputOption=RAW`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ values })
      }
    );

    if (!sheetsResponse.ok) {
      const error = await sheetsResponse.json();
      return Response.json({ error: error.message }, { status: sheetsResponse.status });
    }

    // Log de auditoria
    await base44.asServiceRole.entities.AuditLog.create({
      tenant_id,
      user_email: user.email,
      action: 'export',
      entity_type: 'GoogleSheets',
      entity_id: spreadsheet_id,
      new_values: { synced_rows: data.length, entity_type },
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: 'sheets-sync',
      status: 'success',
      timestamp: new Date().toISOString()
    });

    return Response.json({
      success: true,
      message: `Synced ${data.length} rows to Google Sheets`,
      spreadsheet_id,
      synced_rows: data.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});