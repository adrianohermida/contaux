/**
 * LiveCursorTracker Component
 * Display real-time collaboration cursors
 */

import React from 'react';

const COLORS = [
  'rgb(59, 130, 246)',   // blue
  'rgb(16, 185, 129)',   // green
  'rgb(239, 68, 68)',    // red
  'rgb(168, 85, 247)',   // purple
  'rgb(249, 115, 22)',   // orange
  'rgb(236, 72, 153)',   // pink
];

export default function LiveCursorTracker({ cursors = [] }) {
  const getCursorColor = (index) => {
    return COLORS[index % COLORS.length];
  };

  if (!cursors || cursors.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {cursors.map((cursor, index) => (
        <div
          key={cursor.userId}
          className="absolute transition-all duration-75"
          style={{
            left: `${cursor.x}px`,
            top: `${cursor.y}px`,
            transform: 'translate(-2px, -2px)',
          }}
        >
          {/* Cursor Pointer */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill={getCursorColor(index)}
            xmlns="http://www.w3.org/2000/svg"
            style={{
              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))',
            }}
          >
            <path d="M3 3l18.364 18.364-5.441-10.805h7.076V9.641H8.441L3 3z" />
          </svg>

          {/* User Label */}
          <div
            className="absolute top-6 left-0 px-2 py-1 rounded text-xs font-semibold text-white whitespace-nowrap"
            style={{
              backgroundColor: getCursorColor(index),
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            {cursor.userName}
          </div>
        </div>
      ))}
    </div>
  );
}