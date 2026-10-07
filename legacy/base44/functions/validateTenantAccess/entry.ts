import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Backend validation para Row Level Security
 * Garante que usuários só acessem dados do seu tenant
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ valid: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { tenantId, entityType, entityId } = body;

    // Extrai workspace_id do usuário (Sprint 8: migração concluída)
    const userWorkspaceId = user.workspace_id;
    
    if (!userWorkspaceId) {
      return Response.json({ valid: false, error: 'User must have workspace_id' }, { status: 403 });
    }

    // Valida se workspace solicitado pertence ao usuário
    if (tenantId !== userWorkspaceId) {
      // Log de tentativa de acesso não autorizado
      await base44.asServiceRole.entities.SecurityLog.create({
        tenant_id: userWorkspaceId,
        user_email: user.email,
        event_type: 'permission_denied',
        severity: 'high',
        description: `Tentativa de acesso ao workspace ${tenantId} por usuário do workspace ${userWorkspaceId}`,
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        device_info: req.headers.get('user-agent') || 'unknown',
        action_taken: 'blocked',
        resolved: false,
        timestamp: new Date().toISOString()
      });

      return Response.json({ valid: false, error: 'Tenant mismatch' }, { status: 403 });
    }

    // Se entityId foi fornecido, valida que o record pertence ao workspace
    if (entityId && entityType) {
      const entity = await base44.asServiceRole.entities[entityType].list();
      const record = entity.find(r => r.id === entityId && r.workspace_id === userWorkspaceId);
      
      if (!record) {
        await base44.asServiceRole.entities.SecurityLog.create({
          tenant_id: userWorkspaceId,
          user_email: user.email,
          event_type: 'permission_denied',
          severity: 'medium',
          description: `Tentativa de acesso a ${entityType}/${entityId} não pertencente ao workspace`,
          ip_address: req.headers.get('x-forwarded-for') || 'unknown',
          device_info: req.headers.get('user-agent') || 'unknown',
          action_taken: 'blocked',
          resolved: false,
          timestamp: new Date().toISOString()
        });

        return Response.json({ valid: false, error: 'Resource not found' }, { status: 404 });
      }
    }

    return Response.json({ valid: true, workspaceId: userWorkspaceId });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});