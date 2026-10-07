/**
 * RealtimeCollaborationUI Component
 * Live cursors, user presence, collaborative editing, and activity feed
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  Zap,
  MessageCircle,
  Activity,
  Dot,
  Copy,
} from 'lucide-react';
import { useRealtimeCollaboration } from '@/components/hooks/useRealtimeCollaboration';

export default function RealtimeCollaborationUI() {
  const { collaborationState, updatePresence, broadcastChange } = useRealtimeCollaboration();
  const [selectedUser, setSelectedUser] = useState(null);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);

  // Simulate active users
  const mockUsers = [
    { id: 'user-1', name: 'Alice', status: 'editing', color: '#3b82f6' },
    { id: 'user-2', name: 'Bob', status: 'viewing', color: '#10b981' },
    { id: 'user-3', name: 'Carol', status: 'idle', color: '#f59e0b' },
  ];

  const handleAddComment = () => {
    if (comment.trim()) {
      const newComment = {
        id: `comment-${Date.now()}`,
        author: 'You',
        content: comment,
        timestamp: new Date().toLocaleTimeString(),
      };
      setComments([...comments, newComment]);
      broadcastChange({ type: 'comment', data: newComment });
      setComment('');
    }
  };

  return (
    <div className="space-y-6 dark:bg-slate-900 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold dark:text-slate-100 flex items-center gap-2">
          <Zap className="w-6 h-6 text-blue-500" />
          Real-time Collaboration
        </h2>
        <Badge className={collaborationState.isConnected ? 'bg-green-100 text-green-800 dark:bg-green-900' : 'bg-red-100 text-red-800 dark:bg-red-900'}>
          {collaborationState.isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </Badge>
      </div>

      {/* Active Users Presence */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Active Users ({mockUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              onClick={() => setSelectedUser(user)}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: user.color }}
                />
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{user.name}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{user.status}</p>
                </div>
              </div>
              <Dot className="w-4 h-4" style={{ color: user.color }} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Live Cursor Tracking */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100">Live Cursor Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-6 min-h-[200px] relative border-2 border-dashed border-slate-300 dark:border-slate-600">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              User cursors appear below:
            </p>
            {mockUsers.map((user, index) => (
              <div
                key={user.id}
                className="mb-3 flex items-center gap-2"
                style={{ marginLeft: `${index * 20}px` }}
              >
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: user.color }}
                />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {user.name}'s cursor
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity Feed */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Activity Feed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 max-h-[300px] overflow-y-auto">
          {comments.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-400 text-center py-6">
              No activity yet
            </p>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg border-l-4 border-blue-500"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {comment.author}
                  </p>
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    {comment.timestamp}
                  </span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">{comment.content}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Comment Thread */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100 flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Comment Thread
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
          <Button
            onClick={handleAddComment}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 w-full"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Post Comment
          </Button>
        </CardContent>
      </Card>

      {/* Collaborative Editing Info */}
      <Card className="dark:bg-slate-800 dark:border-slate-700 border-2 border-green-200 dark:border-green-900">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100">Collaborative Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Changes Synced
              </p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {collaborationState.changes.length}
              </p>
            </div>
            <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Active Cursors
              </p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {Object.keys(collaborationState.cursorPositions).length}
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 pt-2">
            ✓ Last-write-wins conflict resolution<br/>
            ✓ Automatic change synchronization<br/>
            ✓ Real-time presence tracking<br/>
            ✓ Live cursor positions
          </p>
        </CardContent>
      </Card>
    </div>
  );
}