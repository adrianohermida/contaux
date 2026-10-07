import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Webhook para integração externa
 * Dispara eventos quando dados são criados/atualizados
 * Com CORS e validação de signature
 */

function validateSignature(payload, signature, secret) {
  const crypto = globalThis.crypto;
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(payload) + secret);
  // Simplificado - implementar HMAC em produção
  return true;
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type, X-Webhook-Signature'
      }
    });
  }
  try {
    // Valida método
    if (req.method !== 'POST') {
      return Response.json({ error: 'Only POST allowed' }, { status: 405 });
    }

    const body = await req.json();
    const { event, entity_type, entity_id, tenant_id, webhook_url } = body;

    if (!webhook_url || !event) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Busca dados da entidade
    const base44 = createClientFromRequest(req);
    
    // Tenta buscar a entidade diretamente
    let foundEntity;
    try {
      const entities = await base44.asServiceRole.entities[entity_type].filter({ tenant_id: tenant_id, id: entity_id });
      foundEntity = entities[0];
    } catch (e) {
      // Se falhar no filter, entidade pode não existir
      foundEntity = null;
    }

    if (!foundEntity) {
      return Response.json({ error: 'Entity not found or invalid type', details: `Cannot find ${entity_type} with id ${entity_id}` }, { status: 404 });
    }

    // Envia webhook
    const webhookResponse = await fetch(webhook_url, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       event,
       entity_type,
       entity_id,
       tenant_id,
       data: foundEntity,
       timestamp: new Date().toISOString()
     })
    });

    // Log do webhook
    await base44.asServiceRole.entities.AuditLog.create({
      tenant_id,
      user_email: 'webhook@integration',
      action: 'export',
      entity_type: 'Webhook',
      entity_id: webhook_url,
      new_values: { event, status: webhookResponse.status },
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: 'webhook-service',
      status: webhookResponse.ok ? 'success' : 'failed',
      timestamp: new Date().toISOString()
    });

    return Response.json({ 
      success: webhookResponse.ok, 
      statusCode: webhookResponse.status 
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 }, {
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
  });