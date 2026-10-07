/**
 * WorkflowBuilder Component
 * Visual rule builder for workflow automation
 */

import React, { useState } from 'react';
import { useWorkflowBuilder } from '../hooks/useWorkflowBuilder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Play, Save, X } from 'lucide-react';

export default function WorkflowBuilder({ workspaceId, onClose }) {
  const { createWorkflow, getAvailableTriggers, getAvailableActions } = useWorkflowBuilder(workspaceId);
  
  const [name, setName] = useState('');
  const [trigger, setTrigger] = useState('');
  const [actions, setActions] = useState([]);
  const [newAction, setNewAction] = useState('');
  const [errors, setErrors] = useState({});

  const triggers = getAvailableTriggers();
  const availableActions = getAvailableActions();

  const handleAddAction = () => {
    if (!newAction) {
      setErrors((prev) => ({ ...prev, action: 'Please select an action' }));
      return;
    }

    const action = availableActions.find((a) => a.id === newAction);
    setActions((prev) => [...prev, { type: newAction, label: action?.label }]);
    setNewAction('');
    setErrors((prev) => ({ ...prev, action: '' }));
  };

  const handleRemoveAction = (index) => {
    setActions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    // Validate
    if (!name.trim()) {
      setErrors((prev) => ({ ...prev, name: 'Workflow name is required' }));
      return;
    }
    if (!trigger) {
      setErrors((prev) => ({ ...prev, trigger: 'Please select a trigger' }));
      return;
    }
    if (actions.length === 0) {
      setErrors((prev) => ({ ...prev, actions: 'Please add at least one action' }));
      return;
    }

    // Create workflow
    createWorkflow(name, trigger, actions);
    
    // Reset form
    setName('');
    setTrigger('');
    setActions([]);
    setErrors({});
    onClose?.();
  };

  return (
    <div className="space-y-6 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-slate-100">Create Workflow</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="dark:hover:bg-slate-700"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Workflow Name */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100">Workflow Name</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Auto-follow up for hot leads"
            className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-2">{errors.name}</p>
          )}
        </CardContent>
      </Card>

      {/* Trigger Selection */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100">When This Happens (Trigger)</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={trigger} onValueChange={setTrigger}>
            <SelectTrigger className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100">
              <SelectValue placeholder="Select a trigger..." />
            </SelectTrigger>
            <SelectContent className="dark:bg-slate-700 dark:border-slate-600">
              {triggers.map((t) => (
                <SelectItem key={t.id} value={t.id} className="dark:text-slate-100">
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.trigger && (
            <p className="text-sm text-red-500 mt-2">{errors.trigger}</p>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100">Then Do This (Actions)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Action List */}
          {actions.length > 0 && (
            <div className="space-y-2">
              {actions.map((action, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="dark:border-slate-600">
                      {index + 1}
                    </Badge>
                    <span className="dark:text-slate-200">{action.label}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveAction(index)}
                    className="text-red-500 hover:bg-red-50 dark:hover:bg-slate-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Add Action */}
          <div className="flex gap-2">
            <Select value={newAction} onValueChange={setNewAction}>
              <SelectTrigger className="flex-1 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100">
                <SelectValue placeholder="Select an action to add..." />
              </SelectTrigger>
              <SelectContent className="dark:bg-slate-700 dark:border-slate-600">
                {availableActions.map((action) => (
                  <SelectItem key={action.id} value={action.id} className="dark:text-slate-100">
                    {action.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleAddAction}
              className="gap-2 dark:bg-blue-700 dark:hover:bg-blue-600"
            >
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>
          {errors.action && (
            <p className="text-sm text-red-500">{errors.action}</p>
          )}
          {errors.actions && (
            <p className="text-sm text-red-500">{errors.actions}</p>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-2 justify-end">
        <Button
          variant="outline"
          onClick={onClose}
          className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          className="gap-2 dark:bg-green-700 dark:hover:bg-green-600"
        >
          <Save className="w-4 h-4" />
          Save Workflow
        </Button>
      </div>

      {/* Help Text */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          💡 <strong>Tip:</strong> Create workflows to automate repetitive tasks. Workflows will execute automatically when their trigger conditions are met.
        </p>
      </div>
    </div>
  );
}