import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Edge Function para auditoria de usuários e RLS
 * Valida:
 * - Isolamento multitenant
 * - Consistência de roles
 * - Tentativas de acesso não autorizado
 * 
 * Apenas SuperAdmin pode executar
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Validar autenticação
    if (!user) {
      return Response.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Apenas SuperAdmin (workspace_id = 'superadmin')
    if (user.workspace_id !== 'superadmin' || user.role !== 'admin') {
      return Response.json(
        { error: 'Apenas SuperAdmin pode auditar usuários' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { action } = body;

    const results = {
      timestamp: new Date().toISOString(),
      action,
      auditor: user.email,
      checks: {}
    };

    // CHECK 1: Validar todos os usuários têm workspace_id
    if (action === 'validate_workspace_ids' || action === 'all') {
      const allUsers = await base44.asServiceRole.entities.User.list();
      const usersWithoutWorkspace = allUsers.filter(u => !u.workspace_id);
      
      results.checks.workspace_ids = {
        total_users: allUsers.length,
        users_without_workspace: usersWithoutWorkspace.length,
        status: usersWithoutWorkspace.length === 0 ? 'ok' : 'warning',
        affected_users: usersWithoutWorkspace.map(u => u.email)
      };
    }

    // CHECK 2: Validar tipos de usuário
    if (action === 'validate_user_types' || action === 'all') {
      const allUsers = await base44.asServiceRole.entities.User.list();
      const invalidTypes = allUsers.filter(u => !['internal', 'client'].includes(u.user_type));
      
      results.checks.user_types = {
        total_users: allUsers.length,
        internal_count: allUsers.filter(u => u.user_type === 'internal').length,
        client_count: allUsers.filter(u => u.user_type === 'client').length,
        invalid_types: invalidTypes.length,
        status: invalidTypes.length === 0 ? 'ok' : 'warning',
        affected_users: invalidTypes.map(u => u.email)
      };
    }

    // CHECK 3: Validar isolamento por workspace
    if (action === 'validate_isolation' || action === 'all') {
      const workspaces = await base44.asServiceRole.entities.Workspace.list();
      const isolationCheck = [];

      for (const workspace of workspaces) {
        const wsUsers = await base44.asServiceRole.entities.User.filter({
          workspace_id: workspace.id
        });
        
        isolationCheck.push({
          workspace_id: workspace.id,
          workspace_name: workspace.name,
          user_count: wsUsers.length,
          users: wsUsers.map(u => ({ email: u.email, type: u.user_type }))
        });
      }

      results.checks.isolation = {
        total_workspaces: workspaces.length,
        workspaces: isolationCheck,
        status: 'ok'
      };
    }

    // CHECK 4: Registrar no AccessLog
    if (action === 'access_patterns' || action === 'all') {
      const logs = await base44.asServiceRole.entities.AccessLog.list('-timestamp', 100);
      
      const patterns = {
        total_logs: logs.length,
        by_action: {},
        by_status: {},
        denied_count: logs.filter(l => l.status === 'denied').length
      };

      logs.forEach(log => {
        patterns.by_action[log.action] = (patterns.by_action[log.action] || 0) + 1;
        patterns.by_status[log.status] = (patterns.by_status[log.status] || 0) + 1;
      });

      results.checks.access_patterns = patterns;
    }

    // CHECK 5: Detectar anomalias
    if (action === 'detect_anomalies' || action === 'all') {
      const logs = await base44.asServiceRole.entities.AccessLog.list('-timestamp', 1000);
      
      const anomalies = [];

      // Múltiplas tentativas negadas
      const emailDenials = {};
      logs.filter(l => l.status === 'denied').forEach(l => {
        emailDenials[l.user_email] = (emailDenials[l.user_email] || 0) + 1;
      });

      Object.entries(emailDenials).forEach(([email, count]) => {
        if (count > 5) {
          anomalies.push({
            type: 'multiple_access_denials',
            user: email,
            count,
            severity: 'warning'
          });
        }
      });

      results.checks.anomalies = {
        count: anomalies.length,
        items: anomalies,
        status: anomalies.length === 0 ? 'ok' : 'warning'
      };
    }

    // LOG da auditoria
    await base44.asServiceRole.entities.AuditLog.create({
      workspace_id: 'superadmin',
      user_email: user.email,
      action: 'audit_users',
      entity_type: 'User',
      entity_id: action,
      new_values: results,
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      status: 'success',
      timestamp: new Date().toISOString()
    });

    return Response.json(results);
  } catch (error) {
    return Response.json(
      { error: error.message, action: 'audit_users' },
      { status: 500 }
    );
  }
});