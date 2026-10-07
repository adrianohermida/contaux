import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Testa conectividade de integrações
 * Verifica se secrets estão configurados corretamente
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Apenas admins podem testar integrações
    if (user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { integration } = body;

    const results = {
      timestamp: new Date().toISOString(),
      integration,
      tests: {}
    };

    // Teste: ENCRYPTION_KEY
    if (integration === 'encryption' || integration === 'all') {
      try {
        const encKey = Deno.env.get('ENCRYPTION_KEY');
        if (!encKey) {
          results.tests.encryption = { 
            status: 'missing', 
            message: 'ENCRYPTION_KEY not configured' 
          };
        } else if (encKey.length < 32) {
          results.tests.encryption = { 
            status: 'invalid', 
            message: 'ENCRYPTION_KEY too short (min 32 chars)' 
          };
        } else {
          results.tests.encryption = { 
            status: 'ok', 
            message: 'ENCRYPTION_KEY configured',
            length: encKey.length 
          };
        }
      } catch (e) {
        results.tests.encryption = { status: 'error', message: e.message };
      }
    }

    // Teste: BACKUP_STORAGE_KEY
    if (integration === 'backup-storage' || integration === 'all') {
      try {
        const backupKey = Deno.env.get('BACKUP_STORAGE_KEY');
        if (!backupKey) {
          results.tests.backup_storage = { 
            status: 'missing', 
            message: 'BACKUP_STORAGE_KEY not configured' 
          };
        } else {
          results.tests.backup_storage = { 
            status: 'ok', 
            message: 'BACKUP_STORAGE_KEY configured',
            type: backupKey.includes('supabase') ? 'supabase' : 
                  backupKey.includes('AKIA') ? 'aws' : 'unknown'
          };
        }
      } catch (e) {
        results.tests.backup_storage = { status: 'error', message: e.message };
      }
    }

    // Teste: VOXIMPLANT
    if (integration === 'voximplant' || integration === 'all') {
      try {
        const voxKey = Deno.env.get('VOXIMPLANT_API_KEY');
        const voxAccount = Deno.env.get('VOXIMPLANT_ACCOUNT_ID');
        
        if (!voxKey || !voxAccount) {
          results.tests.voximplant = { 
            status: 'missing', 
            message: 'VOXIMPLANT_API_KEY or VOXIMPLANT_ACCOUNT_ID not configured' 
          };
        } else {
          // Teste básico da API
          const testResponse = await fetch('https://api.voximplant.com/api/v2/account/getAccountInfo', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `api_key=${voxKey}&account_id=${voxAccount}`
          });

          if (testResponse.ok) {
            results.tests.voximplant = { 
              status: 'ok', 
              message: 'Voximplant API accessible' 
            };
          } else {
            results.tests.voximplant = { 
              status: 'error', 
              message: `Voximplant API error: ${testResponse.status}` 
            };
          }
        }
      } catch (e) {
        results.tests.voximplant = { status: 'error', message: e.message };
      }
    }

    // Log do teste
    await base44.asServiceRole.entities.AuditLog.create({
      tenant_id: user.tenant_id || user.email.split('@')[0],
      user_email: user.email,
      action: 'view',
      entity_type: 'IntegrationTest',
      entity_id: integration,
      new_values: results,
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown',
      status: 'success',
      timestamp: new Date().toISOString()
    });

    return Response.json(results);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});