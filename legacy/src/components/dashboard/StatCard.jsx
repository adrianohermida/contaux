import React, { memo } from 'react';

const StatCard = memo(function StatCard({ icon: Icon, title, value, subtitle, trend, color = 'blue' }) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    yellow: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    red: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 md:p-6 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 md:p-3 rounded-lg transition-colors ${colorClasses[color]}`}>
          <Icon className="w-5 h-5 md:w-6 md:h-6" />
        </div>
        {trend && (
          <span className={`text-xs md:text-sm font-semibold ${trend > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <h3 className="text-slate-600 dark:text-slate-400 text-xs md:text-sm mb-1">{title}</h3>
      <p className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">{value}</p>
      {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.value === nextProps.value &&
    prevProps.title === nextProps.title &&
    prevProps.trend === nextProps.trend &&
    prevProps.color === nextProps.color
  );
});

export default StatCard;