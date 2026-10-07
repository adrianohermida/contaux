import React, { memo } from 'react';

const StatCardSkeleton = memo(function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 md:p-6 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-200 dark:bg-slate-700 rounded-lg" />
      </div>
      <div className="h-3 md:h-4 bg-slate-200 dark:bg-slate-700 rounded w-24 mb-2" />
      <div className="h-6 md:h-8 bg-slate-200 dark:bg-slate-700 rounded w-32 mb-2" />
      <div className="h-2 md:h-3 bg-slate-100 dark:bg-slate-600 rounded w-40" />
    </div>
  );
});

export default StatCardSkeleton;