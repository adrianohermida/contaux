import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Real-time Collaboration Engine - PHASE 19
 * Document collaboration, presence tracking, and activity feeds
 */

class RealtimeCollaborationEngine {
  constructor() {
    this.activeUsers = new Map();
    this.documents = new Map();
    this.comments = new Map();
    this.activities = new Map();
    this.subscriptions = new Map();
  }

  /**
   * Add user presence
   */
  addUserPresence(userId, documentId, userInfo) {
    const presenceId = `${userId}_${documentId}`;
    
    const presence = {
      user_id: userId,
      document_id: documentId,
      user_name: userInfo.name,
      user_avatar: userInfo.avatar,
      cursor_position: null,
      last_activity: new Date().toISOString(),
      is_editing: false,
      joined_at: new Date().toISOString(),
    };

    this.activeUsers.set(presenceId, presence);

    return {
      presence_id: presenceId,
      status: 'joined',
      active_users_count: this.getActiveUserCount(documentId),
    };
  }

  /**
   * Remove user presence
   */
  removeUserPresence(userId, documentId) {
    const presenceId = `${userId}_${documentId}`;
    this.activeUsers.delete(presenceId);

    return {
      user_id: userId,
      document_id: documentId,
      status: 'left',
      active_users_count: this.getActiveUserCount(documentId),
    };
  }

  /**
   * Get active users in document
   */
  getActiveUserCount(documentId) {
    return Array.from(this.activeUsers.values()).filter(p => p.document_id === documentId).length;
  }

  /**
   * Get active users
   */
  getActiveUsers(documentId) {
    return Array.from(this.activeUsers.values())
      .filter(p => p.document_id === documentId)
      .map(p => ({
        user_id: p.user_id,
        user_name: p.user_name,
        user_avatar: p.user_avatar,
        is_editing: p.is_editing,
        joined_at: p.joined_at,
      }));
  }

  /**
   * Add comment thread
   */
  addComment(documentId, commentData) {
    const commentId = 'cmt_' + Math.random().toString(36).substr(2, 12);

    const comment = {
      id: commentId,
      document_id: documentId,
      author_id: commentData.author_id,
      author_name: commentData.author_name,
      content: commentData.content,
      position: commentData.position || null,
      resolved: false,
      replies: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.comments.set(commentId, comment);

    // Log activity
    this.logActivity(documentId, commentData.author_id, 'comment_added', {
      comment_id: commentId,
      author_name: commentData.author_name,
    });

    return comment;
  }

  /**
   * Reply to comment
   */
  replyToComment(commentId, replyData) {
    const comment = this.comments.get(commentId);
    if (!comment) throw new Error('Comment not found');

    const reply = {
      id: 'rpl_' + Math.random().toString(36).substr(2, 10),
      author_id: replyData.author_id,
      author_name: replyData.author_name,
      content: replyData.content,
      created_at: new Date().toISOString(),
    };

    comment.replies.push(reply);
    comment.updated_at = new Date().toISOString();

    // Log activity
    this.logActivity(comment.document_id, replyData.author_id, 'comment_replied', {
      comment_id: commentId,
      author_name: replyData.author_name,
    });

    return reply;
  }

  /**
   * Resolve comment
   */
  resolveComment(commentId, resolvedBy) {
    const comment = this.comments.get(commentId);
    if (!comment) throw new Error('Comment not found');

    comment.resolved = true;
    comment.updated_at = new Date().toISOString();

    // Log activity
    this.logActivity(comment.document_id, resolvedBy, 'comment_resolved', {
      comment_id: commentId,
    });

    return { comment_id: commentId, status: 'resolved' };
  }

  /**
   * Get document comments
   */
  getDocumentComments(documentId) {
    return Array.from(this.comments.values())
      .filter(c => c.document_id === documentId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  /**
   * Log activity
   */
  logActivity(documentId, userId, activityType, details = {}) {
    const activityId = 'act_' + Math.random().toString(36).substr(2, 12);

    const activity = {
      id: activityId,
      document_id: documentId,
      user_id: userId,
      activity_type: activityType,
      details,
      timestamp: new Date().toISOString(),
    };

    this.activities.set(activityId, activity);

    return activity;
  }

  /**
   * Get activity feed
   */
  getActivityFeed(documentId, limit = 50) {
    return Array.from(this.activities.values())
      .filter(a => a.document_id === documentId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit)
      .map(a => ({
        id: a.id,
        activity_type: a.activity_type,
        user_id: a.user_id,
        details: a.details,
        timestamp: a.timestamp,
      }));
  }

  /**
   * Subscribe to document updates
   */
  subscribeToDocument(documentId, userId) {
    const subscriptionId = 'sub_' + Math.random().toString(36).substr(2, 12);

    const subscription = {
      id: subscriptionId,
      document_id: documentId,
      user_id: userId,
      subscribed_at: new Date().toISOString(),
      events: ['presence_changed', 'comment_added', 'content_modified', 'activity_logged'],
    };

    this.subscriptions.set(subscriptionId, subscription);

    return subscription;
  }

  /**
   * Track cursor position
   */
  updateCursorPosition(userId, documentId, position) {
    const presenceId = `${userId}_${documentId}`;
    const presence = this.activeUsers.get(presenceId);

    if (presence) {
      presence.cursor_position = position;
      presence.last_activity = new Date().toISOString();
    }

    // Log activity
    this.logActivity(documentId, userId, 'cursor_moved', { position });

    return { success: true, cursor_position: position };
  }

  /**
   * Get document collaboration stats
   */
  getCollaborationStats(documentId) {
    const comments = this.getDocumentComments(documentId);
    const activities = Array.from(this.activities.values()).filter(a => a.document_id === documentId);
    const activeUsers = this.getActiveUsers(documentId);

    return {
      document_id: documentId,
      active_collaborators: activeUsers.length,
      total_comments: comments.length,
      unresolved_comments: comments.filter(c => !c.resolved).length,
      total_activities: activities.length,
      recent_activities: this.getActivityFeed(documentId, 10),
    };
  }
}

/**
 * Backend handler for collaboration operations
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

    const { action, documentId, userId, userInfo, commentData, commentId, replyData, position, resolvedBy } = await req.json();

    const collaboration = new RealtimeCollaborationEngine();

    switch (action) {
      case 'join-document':
        const presence = collaboration.addUserPresence(userId, documentId, userInfo);
        return Response.json({ success: true, ...presence });

      case 'leave-document':
        const left = collaboration.removeUserPresence(userId, documentId);
        return Response.json({ success: true, ...left });

      case 'get-active-users':
        const activeUsers = collaboration.getActiveUsers(documentId);
        return Response.json({ success: true, active_users: activeUsers });

      case 'add-comment':
        const comment = collaboration.addComment(documentId, commentData);
        return Response.json({ success: true, ...comment });

      case 'reply-comment':
        const reply = collaboration.replyToComment(commentId, replyData);
        return Response.json({ success: true, ...reply });

      case 'resolve-comment':
        const resolved = collaboration.resolveComment(commentId, resolvedBy);
        return Response.json({ success: true, ...resolved });

      case 'get-comments':
        const comments = collaboration.getDocumentComments(documentId);
        return Response.json({ success: true, comments });

      case 'get-activity-feed':
        const feed = collaboration.getActivityFeed(documentId);
        return Response.json({ success: true, feed });

      case 'update-cursor':
        const cursorUpdate = collaboration.updateCursorPosition(userId, documentId, position);
        return Response.json({ success: true, ...cursorUpdate });

      case 'get-stats':
        const stats = collaboration.getCollaborationStats(documentId);
        return Response.json({ success: true, ...stats });

      default:
        return Response.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

export { RealtimeCollaborationEngine };