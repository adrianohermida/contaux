/**
 * Enhanced Contact Form
 * Integrates client and server validation with error UI
 */

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useValidation } from '../validation/useValidation';
import { useAriaLive } from '../a11y/useAriaLive';
import { useServerValidation } from '../hooks/useServerValidation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ValidationError from '../validation/ValidationError';
import ToastNotification from '../notifications/ToastNotification';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

const contactSchema = z.object({
  company_name: z.string().min(2, 'Company name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
});

export default function ContactFormEnhanced({ onSuccess, workspaceId }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('info');
  const [formData, setFormData] = useState({
    company_name: '',
    email: '',
    phone: '',
    status: 'active',
  });

  const { announce, announceSuccess, announceError } = useAriaLive();
  const { errors, validate, validateField, markTouched, getFieldError, reset } = 
    useValidation(contactSchema);
  const { validateEntity, validating, errors: serverErrors } = useServerValidation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleBlur = (e) => {
    markTouched(e.target.name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate(formData)) {
      announceError('Please fix validation errors before submitting');
      setToastMessage('Please fix validation errors');
      setToastType('error');
      return;
    }

    // Server-side validation
    const isValid = await validateEntity('Client', {
      ...formData,
      workspace_id: workspaceId,
    });

    if (!isValid && Object.keys(serverErrors).length > 0) {
      announceError('Server validation failed');
      setToastMessage('Some fields have validation errors');
      setToastType('error');
      return;
    }

    setIsSubmitting(true);
    try {
      await base44.entities.Client.create({
        ...formData,
        workspace_id: workspaceId,
      });

      announceSuccess('Contact created successfully!');
      setToastMessage('Contact created successfully!');
      setToastType('success');
      
      reset();
      setFormData({
        company_name: '',
        email: '',
        phone: '',
        status: 'active',
      });
      
      setTimeout(() => onSuccess?.(), 1500);
    } catch (error) {
      announceError(`Failed to create contact: ${error.message}`);
      setToastMessage(`Error: ${error.message}`);
      setToastType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDisplayError = (fieldName) => {
    return getFieldError(fieldName) || serverErrors[fieldName];
  };

  return (
    <>
      {/* Toast Notifications */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50">
          <ToastNotification
            message={toastMessage}
            type={toastType}
            onClose={() => setToastMessage(null)}
          />
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 p-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
        noValidate
        aria-label="Create new contact form"
      >
        <div className="space-y-2">
          <label
            htmlFor="company_name"
            className="block text-sm font-medium text-slate-900 dark:text-slate-100"
          >
            Company Name <span className="text-red-600" aria-label="required">*</span>
          </label>
          <Input
            id="company_name"
            name="company_name"
            value={formData.company_name}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter company name"
            aria-invalid={!!getDisplayError('company_name')}
            aria-describedby={getDisplayError('company_name') ? 'error-company_name' : undefined}
            className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
            disabled={isSubmitting || validating}
            required
          />
          <ValidationError
            id="error-company_name"
            error={getDisplayError('company_name')}
            visible={true}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-900 dark:text-slate-100"
          >
            Email <span className="text-red-600" aria-label="required">*</span>
          </label>
          <Input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter email address"
            aria-invalid={!!getDisplayError('email')}
            aria-describedby={getDisplayError('email') ? 'error-email' : undefined}
            className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
            disabled={isSubmitting || validating}
            required
          />
          <ValidationError
            id="error-email"
            error={getDisplayError('email')}
            visible={true}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-slate-900 dark:text-slate-100"
          >
            Phone (Optional)
          </label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter phone number"
            className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
            disabled={isSubmitting || validating}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={isSubmitting || validating}
            className="flex-1"
            aria-busy={isSubmitting || validating}
          >
            {isSubmitting || validating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Contact'
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              reset();
              setFormData({
                company_name: '',
                email: '',
                phone: '',
                status: 'active',
              });
            }}
            disabled={isSubmitting}
            className="dark:border-slate-600"
          >
            Clear
          </Button>
        </div>
      </form>
    </>
  );
}