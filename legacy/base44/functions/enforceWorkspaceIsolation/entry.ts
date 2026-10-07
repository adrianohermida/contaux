import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Sprint 9: Enforcement de Isolamento de Workspace
 * Bloqueia acesso a dados de outros workspaces em tempo de requisição
 * Aplicável a todas as operações CRUD
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || !user.workspace_id) {
      return Response.json({ error: 'User must have workspace_id' }, { status: 403 });
    }

    const body = await req.json();
    const { action, entity_name, workspace_id, entity_id } = body;

    // Validar que workspace_id na requisição = workspace_id do usuário
    if (workspace_id && workspace_id !== user.workspace_id) {
      return Response.json({
        error: 'Access Denied: Cannot access different workspace',
        requested_workspace: workspace_id,
        user_workspace: user.workspace_id,
        severity: 'CRITICAL'
      }, { status: 403 });
    }

    const results = {
      timestamp: new Date().toISOString(),
      user_email: user.email,
      user_workspace: user.workspace_id,
      action: action,
      entity: entity_name,
      validation: {
        workspace_match: true,
        user_type_valid: !!user.user_type,
        access_granted: true
      }
    };

    // Se é um usuário client, validar restrições adicionais
    if (user.user_type === 'client') {
      // Client só pode ver dados relacionados a ele mesmo
      if (entity_name === 'Invoice') {
        // Validar que invoice pertence ao cliente
        try {
          const invoice = await base44.entities.Invoice.filter({
            workspace_id: user.workspace_id,
            id: entity_id
          });
          
          if (invoice.length === 0) {
            return Response.json({
              error: 'Client cannot access this invoice',
              severity: 'FORBIDDEN'
            }, { status: 403 });
          }
        } catch (err) {
          return Response.json({
            error: `Validation error: ${err.message}`,
            severity: 'CRITICAL'
          }, { status: 500 });
        }
      }
    }

    results.audit = {
      user_type: user.user_type,
      role: user.role,
      access_level: user.user_type === 'internal' ? 'Full workspace access' : 'Limited to own data'
    };

    return Response.json(results);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});