/**
 * Advanced Form Layout Component
 * Multi-step, conditional rendering, auto-save support
 */

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronRight, ChevronLeft, Save } from 'lucide-react';

export default function AdvancedFormLayout({
  steps = [],
  onSubmit,
  onSave,
  autoSave = true,
  autoSaveDelay = 3000,
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  // Auto-save timer
  React.useEffect(() => {
    if (!autoSave || !onSave) return;

    const timer = setTimeout(async () => {
      setIsSaving(true);
      try {
        await onSave(formData);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(null), 2000);
      } catch (error) {
        setSaveStatus('error');
      } finally {
        setIsSaving(false);
      }
    }, autoSaveDelay);

    return () => clearTimeout(timer);
  }, [formData, autoSave, onSave, autoSaveDelay]);

  const handleFieldChange = useCallback((fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value,
    }));
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (onSubmit) {
      await onSubmit(formData);
    }
  };

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white dark:bg-slate-800 rounded-lg">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold dark:text-slate-100">
            {currentStepData?.title}
          </h2>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="space-y-4">
        {currentStepData?.fields?.map(field => (
          <div key={field.name} className="space-y-2">
            <label
              htmlFor={field.name}
              className="block text-sm font-medium dark:text-slate-100"
            >
              {field.label}
              {field.required && <span className="text-red-600">*</span>}
            </label>
            <Input
              id={field.name}
              type={field.type || 'text'}
              value={formData[field.name] || ''}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className="dark:bg-slate-700 dark:border-slate-600"
            />
          </div>
        ))}
      </div>

      {/* Save Status */}
      {saveStatus && (
        <div
          className={`text-sm p-2 rounded ${
            saveStatus === 'saved'
              ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
              : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
          }`}
        >
          {saveStatus === 'saved' ? '✓ Auto-saved' : '✗ Save failed'}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between gap-3 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="dark:border-slate-600"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        {autoSave && onSave && (
          <Button
            type="button"
            variant="ghost"
            disabled={isSaving}
            className="dark:text-slate-400"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        )}

        {currentStep === steps.length - 1 ? (
          <Button type="submit" className="flex-1">
            Submit
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleNext}
            className="flex-1"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </form>
  );
}