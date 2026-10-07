/**
 * Contact Form - Accessibility Enhanced
 * Integrated validation and proper ARIA labeling
 */

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useValidation } from '../validation/useValidation';
import { useAriaLive } from '../a11y/useAriaLive';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import ValidationError from '../validation/ValidationError';
import { z } from 'zod';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const contactSchema = z.object({
  company_name: z.string().min(2, 'Company name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
});

export default function ContactFormA11y({ onSuccess, workspaceId }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    email: '',
    phone: '',
    status: 'active',
  });

  const { announce, announceSuccess, announceError } = useAriaLive();
  const { errors, validate, validateField, markTouched, getFieldError, reset } = 
    useValidation(contactSchema);

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
      return;
    }

    setIsSubmitting(true);
    try {
      await base44.entities.Client.create({
        ...formData,
        workspace_id: workspaceId,
      });

      announceSuccess('Contact created successfully!');
      reset();
      setFormData({
        company_name: '',
        email: '',
        phone: '',
        status: 'active',
      });
      onSuccess?.();
    } catch (error) {
      announceError(`Failed to create contact: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
          aria-invalid={!!getFieldError('company_name')}
          aria-describedby={getFieldError('company_name') ? 'error-company_name' : undefined}
          className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
          required
        />
        <ValidationError
          id="error-company_name"
          error={getFieldError('company_name')}
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
          aria-invalid={!!getFieldError('email')}
          aria-describedby={getFieldError('email') ? 'error-email' : undefined}
          className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
          required
        />
        <ValidationError
          id="error-email"
          error={getFieldError('email')}
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
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1"
          aria-busy={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create Contact'}
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
          className="dark:border-slate-600"
        >
          Clear
        </Button>
      </div>
    </form>
  );
}