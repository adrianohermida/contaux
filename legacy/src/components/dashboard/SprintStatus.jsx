import React from 'react';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function SprintStatus() {
  const sprints = [
    {
      number: 6,
      name: 'Blog Analytics & Advanced Features',
      status: 'completed',
      progress: 100,
      features: 6,
      completedDate: '2026-02-20'
    },
    {
      number: 7,
      name: 'Advanced Analytics & Performance',
      status: 'in_progress',
      progress: 60,
      features: 5,
      completedDate: null
    },
    {
      number: 8,
      name: 'Content & SEO Excellence',
      status: 'planned',
      progress: 0,
      features: 6,
      completedDate: null
    }
  ];

  return (
    <div className="space-y-3">
      {sprints.map((sprint) => (
        <Card key={sprint.number} className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              {sprint.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />}
              {sprint.status === 'in_progress' && <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />}
              {sprint.status === 'planned' && <AlertCircle className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />}

              <div className="flex-1">
                <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                  Sprint {sprint.number}: {sprint.name}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  {sprint.features} features • {sprint.progress}% completo
                </p>
                
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden mt-2">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      sprint.status === 'completed' ? 'bg-green-600' : 'bg-yellow-600'
                    }`}
                    style={{ width: `${sprint.progress}%` }}
                  />
                </div>

                {sprint.completedDate && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                    ✓ Concluído em {new Date(sprint.completedDate).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}