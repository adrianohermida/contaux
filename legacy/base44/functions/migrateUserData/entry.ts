import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Migração User: adiciona workspace_id e user_type
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Apenas admin pode executar
    if (user.role !== 'admin') {
      return Response.json(
        { error: 'Apenas administradores' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { action, workspace_id } = body;

    const results = {
      timestamp: new Date().toISOString(),
      action,
      results: []
    };

    // ACTION 1: Diagnosticar Users sem workspace_id/user_type
    if (action === 'diagnose') {
      try {
        const users = await base44.asServiceRole.entities.User.list();
        const missing = users.filter(u => !u.data?.workspace_id || !u.data?.user_type);

        results.results = {
          total_users: users.length,
          missing_count: missing.length,
          missing_users: missing.map(u => ({
            id: u.id,
            email: u.email,
            role: u.role,
            has_workspace_id: !!u.data?.workspace_id,
            has_user_type: !!u.data?.user_type
          }))
        };

        return Response.json(results);
      } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
      }
    }

    // ACTION 2: Atribuir workspace_id
    if (action === 'assign_workspace') {
      if (!workspace_id) {
        return Response.json(
          { error: 'workspace_id obrigatorio' },
          { status: 400 }
        );
      }

      try {
        const users = await base44.asServiceRole.entities.User.list();
        const missing = users.filter(u => !u.data?.workspace_id);

        let updated = 0;
        const errors = [];

        for (const u of missing) {
          try {
            const updateData = { ...u.data };
            updateData.workspace_id = workspace_id;

            await base44.asServiceRole.entities.User.update(u.id, updateData);
            updated++;
          } catch (err) {
            errors.push({
              email: u.email,
              error: err.message
            });
          }
        }

        results.results = {
          total_to_update: missing.length,
          updated,
          failed: errors.length,
          errors: errors.slice(0, 2)
        };

        return Response.json(results);
      } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
      }
    }

    // ACTION 3: Atribuir user_type baseado em role
    if (action === 'assign_user_type') {
      try {
        const users = await base44.asServiceRole.entities.User.list();
        const missing = users.filter(u => !u.data?.user_type);

        let updated = 0;
        const errors = [];

        for (const u of missing) {
          try {
            const updateData = { ...u.data };
            updateData.user_type = u.role === 'admin' ? 'internal' : 'client';

            await base44.asServiceRole.entities.User.update(u.id, updateData);
            updated++;
          } catch (err) {
            errors.push({
              email: u.email,
              error: err.message
            });
          }
        }

        results.results = {
          total_to_update: missing.length,
          updated,
          failed: errors.length,
          errors: errors.slice(0, 2)
        };

        return Response.json(results);
      } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
      }
    }

    return Response.json(
      { error: 'Unknown action' },
      { status: 400 }
    );
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});