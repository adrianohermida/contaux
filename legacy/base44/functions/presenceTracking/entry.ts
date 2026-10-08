import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Presence Tracking & Real-time Sync - PHASE 19
 * Track user presence, activity, and real-time updates
 */

class PresenceTracker {
  constructor() {
    this.userSessions = new Map();
    this.documentSessions = new Map();
    this.syncQueue = [];
  }

  /**
   * Create user session
   */
  createUserSession(userId, sessionData) {
    const sessionId = 'sess_' + Math.random().toString(36).substr(2, 14);

    const session = {
      id: sessionId,
      user_id: userId,
      status: 'active',
      started_at: new Date().toISOString(),
      last_activity: new Date().toISOString(),
      documents_open: [],
      device_info: sessionData.device_info || {},
      ip_address: sessionData.ip_address,
      timezone: sessionData.timezone,
    };

    this.userSessions.set(sessionId, session);

    return session;
  }

  /**
   * End user session
   */
  endUserSession(sessionId) {
    const session = this.userSessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    session.status = 'inactive';
    session.ended_at = new Date().toISOString();

    return {
      session_id: sessionId,
      status: 'ended',
      duration_seconds: Math.floor((new Date(session.ended_at) - new Date(session.started_at)) / 1000),
    };
  }

  /**
   * Update user activity
   */
  updateUserActivity(sessionId) {
    const session = this.userSessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    session.last_activity = new Date().toISOString();

    return {
      session_id: sessionId,
      last_activity: session.last_activity,
    };
  }

  /**
   * Track document session
   */
  trackDocumentSession(sessionId, documentId, action) {
    const docSessionId = 'docsess_' + Math.random().toString(36).substr(2, 12);

    const docSession = {
      id: docSessionId,
      session_id: sessionId,
      document_id: documentId,
      action, // opened, closed, edited, viewed
      timestamp: new Date().toISOString(),
      duration_seconds: null,
    };

    this.documentSessions.set(docSessionId, docSession);

    // Update user session
    const session = this.userSessions.get(sessionId);
    if (session) {
      if (action === 'opened' && !session.documents_open.includes(documentId)) {
        session.documents_open.push(documentId);
      } else if (action === 'closed') {
        session.documents_open = session.documents_open.filter(id => id !== documentId);
      }
    }

    return docSession;
  }

  /**
   * Queue data for sync
   */
  queueForSync(data) {
    const syncId = 'sync_' + Math.random().toString(36).substr(2, 12);

    const syncItem = {
      id: syncId,
      data,
      status: 'pending',
      created_at: new Date().toISOString(),
      synced_at: null,
      retry_count: 0,
    };

    this.syncQueue.push(syncItem);

    return syncItem;
  }

  /**
   * Process sync queue
   */
  processSyncQueue() {
    const pendingItems = this.syncQueue.filter(item => item.status === 'pending').slice(0, 100);

    const results = pendingItems.map(item => {
      try {
        item.status = 'synced';
        item.synced_at = new Date().toISOString();

        return {
          sync_id: item.id,
          status: 'success',
        };
      } catch (error) {
        item.retry_count++;
        item.status = item.retry_count > 3 ? 'failed' : 'pending';

        return {
          sync_id: item.id,
          status: 'failed',
          error: error.message,
        };
      }
    });

    return {
      processed_items: results.length,
      successful: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status === 'failed').length,
      results,
    };
  }

  /**
   * Get user presence
   */
  getUserPresence(userId) {
    const userSessions = Array.from(this.userSessions.values()).filter(s => s.user_id === userId);

    return {
      user_id: userId,
      sessions_count: userSessions.length,
      active_sessions: userSessions.filter(s => s.status === 'active').length,
      sessions: userSessions.map(s => ({
        session_id: s.id,
        status: s.status,
        started_at: s.started_at,
        documents_open: s.documents_open,
        timezone: s.timezone,
      })),
    };
  }

  /**
   * Get document presence
   */
  getDocumentPresence(documentId) {
    const docSessions = Array.from(this.documentSessions.values()).filter(ds => ds.document_id === documentId);
    const uniqueUsers = new Set(
      Array.from(this.userSessions.values())
        .filter(s => s.documents_open.includes(documentId) && s.status === 'active')
        .map(s => s.user_id)
    );

    return {
      document_id: documentId,
      active_users_count: uniqueUsers.size,
      total_sessions: docSessions.length,
      sessions: docSessions.map(ds => ({
        session_id: ds.session_id,
        action: ds.action,
        timestamp: ds.timestamp,
      })),
    };
  }

  /**
   * Get sync queue stats
   */
  getSyncQueueStats() {
    const pending = this.syncQueue.filter(item => item.status === 'pending');
    const synced = this.syncQueue.filter(item => item.status === 'synced');
    const failed = this.syncQueue.filter(item => item.status === 'failed');

    return {
      total_items: this.syncQueue.length,
      pending_items: pending.length,
      synced_items: synced.length,
      failed_items: failed.length,
      success_rate: this.syncQueue.length > 0 ? ((synced.length / this.syncQueue.length) * 100).toFixed(2) + '%' : 'N/A',
      pending_size_bytes: pending.reduce((sum, item) => sum + JSON.stringify(item.data).length, 0),
    };
  }
}

/**
 * Backend handler for presence tracking
 */
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'POST required' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user?.workspace_id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, userId, sessionId, sessionData, documentId, docAction, syncData } = await req.json();

    const tracker = new PresenceTracker();

    switch (action) {
      case 'create-session':
        const session = tracker.createUserSession(userId, sessionData);
        return Response.json({ success: true, ...session });

      case 'end-session':
        const ended = tracker.endUserSession(sessionId);
        return Response.json({ success: true, ...ended });

      case 'update-activity':
        const updated = tracker.updateUserActivity(sessionId);
        return Response.json({ success: true, ...updated });

      case 'track-document':
        const docSession = tracker.trackDocumentSession(sessionId, documentId, docAction);
        return Response.json({ success: true, ...docSession });

      case 'queue-sync':
        const queued = tracker.queueForSync(syncData);
        return Response.json({ success: true, ...queued });

      case 'process-sync':
        const syncResult = tracker.processSyncQueue();
        return Response.json({ success: true, ...syncResult });

      case 'get-user-presence':
        const userPresence = tracker.getUserPresence(userId);
        return Response.json({ success: true, ...userPresence });

      case 'get-document-presence':
        const docPresence = tracker.getDocumentPresence(documentId);
        return Response.json({ success: true, ...docPresence });

      case 'get-sync-stats':
        const syncStats = tracker.getSyncQueueStats();
        return Response.json({ success: true, ...syncStats });

      default:
        return Response.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

export { PresenceTracker };