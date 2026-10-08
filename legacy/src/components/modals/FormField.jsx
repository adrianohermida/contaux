import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

/**
 * FormField - Componente padrão para campos de formulário
 * ✅ Dark mode, ARIA labels, error descriptions
 */
export default function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  placeholder,
  options,
  rows,
  id,
  ...props
}) {
  const errorId = error ? `${name}-error` : undefined;
  const requiredIndicator = required ? <span className="text-[var(--color-error)] ml-1" aria-label="obrigatório">*</span> : null;

  // Select
  if (type === 'select' && options) {
    return (
      <div className="flex flex-col gap-[var(--spacing-md)]">
         <label htmlFor={name} className="text-[var(--font-size-sm)] font-semibold text-[var(--color-foreground-primary)]">
           {label}
           {requiredIndicator}
         </label>
         <Select value={value} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger id={name} className={`bg-[var(--color-background-primary)] border-[var(--color-border-default)] text-[var(--color-foreground-primary)] ${error ? 'border-[var(--color-error)]' : ''}`} aria-describedby={errorId} aria-invalid={!!error}>
            <SelectValue placeholder={placeholder || `Selecione ${label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent className="bg-[var(--color-background-primary)] border-[var(--color-border-default)]">
            {options.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && <span id={errorId} className="text-[var(--font-size-xs)] text-[var(--color-error)] mt-[var(--spacing-xs)]">{error}</span>}
        </div>
        );
        }

        // Textarea
        if (type === 'textarea') {
    return (
      <div className="flex flex-col gap-[var(--spacing-md)]">
         <label htmlFor={name} className="text-[var(--font-size-sm)] font-semibold text-[var(--color-foreground-primary)]">
           {label}
           {requiredIndicator}
         </label>
         <Textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows || 3}
          disabled={disabled}
          className={`bg-[var(--color-background-primary)] border-[var(--color-border-default)] text-[var(--color-foreground-primary)] placeholder:text-[var(--color-foreground-disabled)] ${error ? 'border-[var(--color-error)]' : ''}`}
          aria-describedby={errorId}
          aria-invalid={!!error}
          {...props}
        />
        {error && <span id={errorId} className="text-[var(--font-size-xs)] text-[var(--color-error)] mt-[var(--spacing-xs)]">{error}</span>}
        </div>
        );
        }

        // Input padrão
  return (
    <div className="flex flex-col gap-[var(--spacing-md)]">
       <label htmlFor={name} className="text-[var(--font-size-sm)] font-semibold text-[var(--color-foreground-primary)]">
         {label}
         {requiredIndicator}
       </label>
       <Input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`bg-[var(--color-background-primary)] border-[var(--color-border-default)] text-[var(--color-foreground-primary)] placeholder:text-[var(--color-foreground-disabled)] ${error ? 'border-[var(--color-error)]' : ''}`}
        aria-describedby={errorId}
        aria-invalid={!!error}
        {...props}
      />
      {error && <span id={errorId} className="text-[var(--font-size-xs)] text-[var(--color-error)] mt-[var(--spacing-xs)]">{error}</span>}
      </div>
      );
      }