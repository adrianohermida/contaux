/**
 * Create Audit Log
 * Backend function to log all actions for compliance
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      action,
      entityType,
      entityId,
      entityName,
      oldValues,
      newValues,
      status = 'success',
      reasonDenied,
    } = body;

    // Extract client info
    const userAgent = req.headers.get('user-agent') || '';
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    // Create audit log
    const auditLog = await base44.asServiceRole.entities.AuditLog?.create({
      workspace_id: user.workspace_id,
      user_email: user.email,
      action,
      entity_type: entityType,
      entity_id: entityId,
      entity_name: entityName,
      old_values: oldValues,
      new_values: newValues,
      ip_address: ipAddress,
      user_agent: userAgent,
      status,
      reason_denied: reasonDenied,
    });

    return Response.json({
      success: true,
      auditLogId: auditLog?.id,
    });
  } catch (error) {
    console.error('Audit log creation failed:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});