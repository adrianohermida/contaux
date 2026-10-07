/**
 * UserSettingsPanel Component
 * User preferences and settings management
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Palette, Bell } from 'lucide-react';

export default function UserSettingsPanel() {
  const [settings, setSettings] = useState({
    theme: 'dark',
    language: 'pt-BR',
    notifications: true,
    emailUpdates: false,
    layoutMode: 'full',
  });

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6 dark:bg-slate-900 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-slate-100">Settings</h2>
        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900">User Preferences</Badge>
      </div>

      {/* Theme Settings */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base dark:text-slate-100">
            <Palette className="w-4 h-4" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Theme
            </label>
            <Select value={settings.theme} onValueChange={(val) => handleSettingChange('theme', val)}>
              <SelectTrigger className="w-32 dark:bg-slate-700 dark:border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="dark:bg-slate-700">
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="auto">Auto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Layout
            </label>
            <Select value={settings.layoutMode} onValueChange={(val) => handleSettingChange('layoutMode', val)}>
              <SelectTrigger className="w-32 dark:bg-slate-700 dark:border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="dark:bg-slate-700">
                <SelectItem value="full">Full</SelectItem>
                <SelectItem value="compact">Compact</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base dark:text-slate-100">
            <Bell className="w-4 h-4" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-700 rounded">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Push Notifications
            </label>
            <Switch
              checked={settings.notifications}
              onCheckedChange={(val) => handleSettingChange('notifications', val)}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-700 rounded">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Email Updates
            </label>
            <Switch
              checked={settings.emailUpdates}
              onCheckedChange={(val) => handleSettingChange('emailUpdates', val)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Language Settings */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base dark:text-slate-100">
            <Settings className="w-4 h-4" />
            Language & Region
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Language
            </label>
            <Select value={settings.language} onValueChange={(val) => handleSettingChange('language', val)}>
              <SelectTrigger className="w-40 dark:bg-slate-700 dark:border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="dark:bg-slate-700">
                <SelectItem value="pt-BR">Português (BR)</SelectItem>
                <SelectItem value="en-US">English (US)</SelectItem>
                <SelectItem value="es-ES">Español</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        <Button variant="outline" className="dark:border-slate-600 dark:text-slate-300">
          Reset
        </Button>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">Save Changes</Button>
      </div>
    </div>
  );
}