import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Eye, MessageCircle, Share2, Clock, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function BlogAnalyticsDashboard({ blogPostId, days = 30 }) {
  const { data: analytics = [] } = useQuery({
    queryKey: ['blog-analytics', blogPostId, days],
    queryFn: async () => {
      if (!blogPostId) return [];
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const data = await base44.entities.BlogAnalytics.filter(
        { blog_post_id: blogPostId },
        '-date',
        1000
      );
      
      return data.filter(a => new Date(a.date) >= cutoffDate);
    },
    enabled: !!blogPostId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const metrics = useMemo(() => {
    if (analytics.length === 0) {
      return {
        totalViews: 0,
        uniqueVisitors: 0,
        avgTimeOnPage: 0,
        bounceRate: 0,
        scrollDepth: 0,
        shares: 0,
        clicks: 0,
      };
    }

    return {
      totalViews: analytics.reduce((sum, a) => sum + (a.views || 0), 0),
      uniqueVisitors: analytics.reduce((sum, a) => sum + (a.unique_visitors || 0), 0),
      avgTimeOnPage: Math.round(analytics.reduce((sum, a) => sum + (a.average_time_on_page || 0), 0) / analytics.length),
      bounceRate: Math.round(analytics.reduce((sum, a) => sum + (a.bounce_rate || 0), 0) / analytics.length),
      scrollDepth: Math.round(analytics.reduce((sum, a) => sum + (a.scroll_depth || 0), 0) / analytics.length),
      shares: analytics.reduce((sum, a) => sum + (a.shares || 0), 0),
      clicks: analytics.reduce((sum, a) => sum + (a.clicks || 0), 0),
    };
  }, [analytics]);

  const chartData = useMemo(() => {
    return analytics.reverse().map(a => ({
      date: new Date(a.date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
      views: a.views || 0,
      unique: a.unique_visitors || 0,
      engagement: ((a.scroll_depth || 0) + (100 - (a.bounce_rate || 0))) / 2,
    }));
  }, [analytics]);

  const sourceData = useMemo(() => {
    const sources = {};
    analytics.forEach(a => {
      const source = a.source || 'direct';
      sources[source] = (sources[source] || 0) + (a.views || 0);
    });
    
    return Object.entries(sources).map(([source, views]) => ({
      source: source.charAt(0).toUpperCase() + source.slice(1),
      views,
    }));
  }, [analytics]);

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Visualizações</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.totalViews.toLocaleString('pt-BR')}</p>
            </div>
            <Eye className="w-10 h-10 text-blue-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Visitantes Únicos</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.uniqueVisitors.toLocaleString('pt-BR')}</p>
            </div>
            <Users className="w-10 h-10 text-green-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Tempo Médio</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.avgTimeOnPage}s</p>
            </div>
            <Clock className="w-10 h-10 text-orange-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Taxa Rejeição</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.bounceRate}%</p>
            </div>
            <TrendingUp className="w-10 h-10 text-red-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views Over Time */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Visualizações por Dia</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" />
              <XAxis dataKey="date" stroke="rgba(100,116,139,0.5)" />
              <YAxis stroke="rgba(100,116,139,0.5)" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', border: 'none', borderRadius: '8px', color: '#fff' }}
              />
              <Legend />
              <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="unique" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Traffic Sources */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Fontes de Tráfego</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sourceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" />
              <XAxis dataKey="source" stroke="rgba(100,116,139,0.5)" />
              <YAxis stroke="rgba(100,116,139,0.5)" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', border: 'none', borderRadius: '8px', color: '#fff' }}
              />
              <Bar dataKey="views" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Share2 className="w-8 h-8 text-purple-500 opacity-50" />
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Compartilhamentos</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{metrics.shares}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-pink-500 opacity-50" />
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Cliques em Links</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{metrics.clicks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-cyan-500 opacity-50" />
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Profundidade Scroll</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{metrics.scrollDepth}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}