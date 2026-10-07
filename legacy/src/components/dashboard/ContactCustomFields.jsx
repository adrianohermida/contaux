import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';

export default function ContactCustomFields({ contactId, workspaceId, disabled = false }) {
  const [values, setValues] = useState({});
  const queryClient = useQueryClient();

  const { data: customFields = [] } = useQuery({
    queryKey: ['custom-fields', workspaceId],
    queryFn: () => base44.entities.CustomField.filter({ 
      workspace_id: workspaceId,
      is_active: true,
    }),
    enabled: !!workspaceId,
  });

  const { data: fieldValues = [] } = useQuery({
    queryKey: ['custom-field-values', contactId],
    queryFn: () => base44.entities.CustomFieldValue.filter({ entity_id: contactId }),
    enabled: !!contactId && contactId !== 'new',
  });

  useEffect(() => {
    const initialValues = {};
    fieldValues.forEach(fv => {
      initialValues[fv.custom_field_id] = fv.value;
    });
    setValues(initialValues);
  }, [fieldValues]);

  const saveValueMutation = useMutation({
    mutationFn: async ({ fieldId, value }) => {
      const existingValue = fieldValues.find(fv => fv.custom_field_id === fieldId);
      
      if (existingValue) {
        return await base44.entities.CustomFieldValue.update(existingValue.id, { value });
      } else {
        return await base44.entities.CustomFieldValue.create({
          workspace_id: workspaceId,
          custom_field_id: fieldId,
          entity_id: contactId,
          value,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-field-values'] });
    },
  });

  const handleChange = (fieldId, value) => {
    setValues(prev => ({ ...prev, [fieldId]: value }));
    
    if (!disabled && contactId !== 'new') {
      saveValueMutation.mutate({ fieldId, value });
    }
  };

  // Return values for form submission (new contact)
  const getCustomFieldsData = () => {
    return Object.entries(values).map(([fieldId, value]) => ({
      custom_field_id: fieldId,
      value,
    }));
  };

  if (customFields.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-slate-900 dark:text-slate-100">Campos Personalizados</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {customFields.sort((a, b) => a.display_order - b.display_order).map((field) => (
          <div key={field.id}>
            <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">
              {field.field_label}
              {field.is_required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {field.field_type === 'text' && (
              <Input
                value={values[field.id] || ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
                disabled={disabled}
                required={field.is_required}
              />
            )}

            {field.field_type === 'number' && (
              <Input
                type="number"
                value={values[field.id] || ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
                disabled={disabled}
                required={field.is_required}
              />
            )}

            {field.field_type === 'date' && (
              <Input
                type="date"
                value={values[field.id] || ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
                disabled={disabled}
                required={field.is_required}
              />
            )}

            {field.field_type === 'select' && (
              <select
                value={values[field.id] || ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
                disabled={disabled}
                required={field.is_required}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-slate-100 disabled:opacity-60"
              >
                <option value="">Selecione...</option>
                {field.options?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}

            {field.field_type === 'multiselect' && (
              <select
                multiple
                value={(values[field.id] || '').split(',').filter(Boolean)}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions).map(o => o.value);
                  handleChange(field.id, selected.join(','));
                }}
                disabled={disabled}
                required={field.is_required}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-slate-100 disabled:opacity-60"
                size={Math.min(4, field.options?.length || 4)}
              >
                {field.options?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}

            {field.field_type === 'boolean' && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={values[field.id] === 'true'}
                  onChange={(e) => handleChange(field.id, e.target.checked ? 'true' : 'false')}
                  disabled={disabled}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm text-slate-600 dark:text-slate-400">Sim</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Export function to get custom fields data for new contacts
export { ContactCustomFields };