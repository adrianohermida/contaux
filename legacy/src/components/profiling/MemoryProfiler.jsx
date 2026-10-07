import React, { useState, useEffect } from 'react';
import { BarChart3, AlertCircle, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function MemoryProfiler() {
  const [memoryData, setMemoryData] = useState([
    { time: '00:00', used: 45, total: 128 },
    { time: '04:00', used: 52, total: 128 },
    { time: '08:00', used: 68, total: 128 },
    { time: '12:00', used: 85, total: 128 },
    { time: '16:00', used: 95, total: 128 },
    { time: '20:00', used: 102, total: 128 },
    { time: '24:00', used: 115, total: 128 },
  ]);

  const lastMemory = memoryData[memoryData.length - 1];
  const memoryUsagePercent = Math.round((lastMemory.used / lastMemory.total) * 100);
  const leakRate = lastMemory.used - memoryData[0].used;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <p className="text-xs text-blue-600 font-semibold">Usado</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{lastMemory.used}MB</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <p className="text-xs text-blue-600 font-semibold">Total</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{lastMemory.total}MB</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <p className="text-xs text-emerald-600 font-semibold">Livre</p>
          <p className="text-2xl font-bold text-emerald-900 mt-1">{lastMemory.total - lastMemory.used}MB</p>
        </Card>
        <Card className={`p-4 bg-gradient-to-br ${memoryUsagePercent > 80 ? 'from-red-50 to-red-100 border-red-200' : 'from-amber-50 to-amber-100 border-amber-200'}`}>
          <p className={`text-xs font-semibold ${memoryUsagePercent > 80 ? 'text-red-600' : 'text-amber-600'}`}>Uso</p>
          <p className={`text-2xl font-bold mt-1 ${memoryUsagePercent > 80 ? 'text-red-900' : 'text-amber-900'}`}>
            {memoryUsagePercent}%
          </p>
        </Card>
      </div>

      <Card className="p-4 border-blue-200">
        <h3 className="font-semibold mb-4 text-blue-900">Uso ao Longo do Tempo</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={memoryData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#dbeafe" />
            <XAxis dataKey="time" />
            <YAxis domain={[0, 128]} />
            <Tooltip contentStyle={{ backgroundColor: '#f0f9ff', border: '1px solid #bfdbfe' }} />
            <Legend />
            <Line type="monotone" dataKey="used" stroke="#1e40af" name="Usado (MB)" strokeWidth={2} dot={{ fill: '#1e40af' }} />
            <Line type="monotone" dataKey="total" stroke="#60a5fa" name="Total (MB)" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#60a5fa' }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {leakRate > 50 && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-red-900">Possível Memory Leak</p>
              <p className="text-xs text-red-800">Crescimento: +{leakRate}MB desde o início</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}