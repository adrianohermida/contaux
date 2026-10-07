import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import MatchItem from './MatchItem';

export default function DuplicateItem({ duplicate, onMerge }) {
  return (
    <Card className="border-orange-200">
      <CardContent className="pt-4">
        <div className="space-y-3">
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-100">
              {duplicate.company_name}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {duplicate.email}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Possíveis duplicatas:
            </p>
            {duplicate.matches.map((match, mIdx) => (
              <MatchItem
                key={mIdx}
                match={match}
                primaryContact={{
                  id: duplicate.contact_id,
                  company_name: duplicate.company_name,
                  email: duplicate.email
                }}
                onMerge={onMerge}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}