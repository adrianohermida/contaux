/**
 * ScheduledReports Component
 * Manage automated report scheduling and distribution
 */

import React, { useState } from 'react';
import { useScheduledReports } from '../hooks/useScheduledReports';
import { useGlobalAuth } from '../auth/useGlobalAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Mail, Trash2, Edit2, Plus } from 'lucide-react';

export default function ScheduledReports() {
  const { workspaceId } = useGlobalAuth('internal');
  const { scheduledReports, createSchedule, deleteSchedule } = useScheduledReports(
    workspaceId
  );

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    frequency: 'weekly', // daily, weekly, monthly
    day: 'monday',
    time: '09:00',
    recipients: '',
    format: 'pdf',
  });

  const handleCreate = () => {
    if (formData.name && formData.recipients) {
      createSchedule({
        ...formData,
        recipients: formData.recipients.split(',').map((e) => e.trim()),
      });
      setFormData({
        name: '',
        frequency: 'weekly',
        day: 'monday',
        time: '09:00',
        recipients: '',
        format: 'pdf',
      });
      setShowCreateForm(false);
    }
  };

  const getFrequencyLabel = (frequency) => {
    const labels = {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
    };
    return labels[frequency] || frequency;
  };

  return (
    <div className="space-y-6 p-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Scheduled Reports
        </h1>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Schedule
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Create Scheduled Report
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Report Name
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Weekly Sales Report"
                className="mt-1 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Frequency
              </label>
              <Select
                value={formData.frequency}
                onValueChange={(value) => setFormData({ ...formData, frequency: value })}
              >
                <SelectTrigger className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-700">
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Time
              </label>
              <Input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="mt-1 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Format
              </label>
              <Select
                value={formData.format}
                onValueChange={(value) => setFormData({ ...formData, format: value })}
              >
                <SelectTrigger className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-700">
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Recipients (email addresses, separated by comma)
              </label>
              <Input
                value={formData.recipients}
                onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
                placeholder="email1@example.com, email2@example.com"
                className="mt-1 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowCreateForm(false)}
              className="dark:border-slate-600"
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
              Create Schedule
            </Button>
          </div>
        </div>
      )}

      {/* Scheduled Reports List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scheduledReports.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500 dark:text-slate-400">
            No scheduled reports yet. Create one to get started.
          </div>
        ) : (
          scheduledReports.map((schedule) => (
            <div
              key={schedule.id}
              className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 space-y-4"
            >
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  {schedule.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  ID: {schedule.id}
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Calendar className="w-4 h-4" />
                  <span>{getFrequencyLabel(schedule.frequency)}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Clock className="w-4 h-4" />
                  <span>{schedule.time}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Mail className="w-4 h-4" />
                  <span>{schedule.recipients?.length || 0} recipient(s)</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 dark:border-slate-600"
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteSchedule(schedule.id)}
                  className="flex-1 dark:border-slate-600 text-red-600 dark:text-red-400"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}