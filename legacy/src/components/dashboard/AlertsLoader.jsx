import React, { memo } from 'react';

const AlertsLoader = memo(function AlertsLoader() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-slate-100 border border-slate-200 rounded-lg p-4 animate-pulse">
          <div className="h-4 bg-slate-300 rounded w-32 mb-2" />
          <div className="h-3 bg-slate-200 rounded w-48" />
        </div>
      ))}
    </div>
  );
});

export default AlertsLoader;