import React from 'react';
import { Button } from '@/components/ui/button';

export default function MatchItem({ match, primaryContact, onMerge }) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{match.company_name}</p>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          {match.email}
        </p>
        <div className="flex gap-1 mt-1 flex-wrap">
          {match.match_reasons.map((reason, rIdx) => (
            <span
              key={rIdx}
              className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700"
            >
              {reason}
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0 ml-4">
        <span className="text-sm font-bold text-orange-600">
          {Math.round(match.match_score * 100)}%
        </span>
        <Button
          onClick={() =>
            onMerge(primaryContact, {
              id: match.contact_id,
              company_name: match.company_name,
              email: match.email
            })
          }
          size="sm"
          variant="outline"
        >
          Mesclar
        </Button>
      </div>
    </div>
  );
}