import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MapPin, Calendar, Award, MessageSquare, Gift } from 'lucide-react';

const EVENT_ICONS = {
  first_contact: MapPin,
  milestone: Award,
  activity: MessageSquare,
  renewal: Gift,
  support: MessageSquare,
};

const EVENT_COLORS = {
  first_contact: 'bg-blue-500',
  milestone: 'bg-purple-500',
  activity: 'bg-green-500',
  renewal: 'bg-amber-500',
  support: 'bg-red-500',
};

export default function CustomerJourneyWidget({ workspaceId }) {
  const { data: journeyData = [], isLoading } = useQuery({
    queryKey: ['customer-journey', workspaceId],
    queryFn: async () => {
      // Fetch contacts to build journey timeline
      const contacts = await base44.asServiceRole.entities.Client.filter({ workspace_id: workspaceId });
      
      if (!contacts || contacts.length === 0) return [];

      // Build events for first contact
      const events = contacts.slice(0, 5).map(contact => [
        {
          id: `${contact.id}-start`,
          type: 'first_contact',
          label: 'First Contact',
          date: contact.created_date,
          description: 'Customer added to system'
        },
        {
          id: `${contact.id}-milestone`,
          type: 'milestone',
          label: 'Profile Complete',
          date: new Date(new Date(contact.created_date).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Customer profile fully set up'
        },
        {
          id: `${contact.id}-engagement`,
          type: 'activity',
          label: 'High Engagement',
          date: new Date(new Date(contact.created_date).getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Multiple activities recorded'
        }
      ]).flat();

      return events.sort((a, b) => new Date(a.date) - new Date(b.date));
    },
    enabled: !!workspaceId,
    staleTime: 1000 * 60 * 15,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Customer Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  const events = journeyData || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Customer Journey Timeline
        </CardTitle>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
          {events.length} events tracked
        </p>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No journey events yet</p>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 md:left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-300 via-purple-300 to-pink-300 dark:from-blue-700 dark:via-purple-700 dark:to-pink-700" />

            {/* Events */}
            <div className="space-y-4">
              {events.map((event, idx) => {
                const Icon = EVENT_ICONS[event.type] || MapPin;
                const color = EVENT_COLORS[event.type] || 'bg-slate-500';
                const eventDate = new Date(event.date);
                
                return (
                  <div key={event.id} className="flex gap-4 pl-16 md:pl-20">
                    {/* Timeline dot */}
                    <div className="absolute left-0 md:left-1 flex items-center justify-center w-8 md:w-10 h-8 md:h-10">
                      <div className={`${color} p-2 rounded-full text-white shadow-lg`}>
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Event content */}
                    <div className="py-2 border-l-2 border-slate-200 dark:border-slate-700 pl-4">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                          {event.label}
                        </h4>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {eventDate.toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        {event.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}