/**
 * Accessibility-enhanced Button Component
 * Wrapper around Button with ARIA labels and keyboard support
 */

import React, { forwardRef } from 'react';
import { Button } from './button';
import { useAccessibility } from '../a11y/AccessibilityProvider';

const ButtonA11y = forwardRef(({
  icon: Icon,
  iconOnly = false,
  ariaLabel,
  ariaDescribedBy,
  ariaPressed,
  ariaExpanded,
  children,
  disabled,
  onClick,
  className,
  ...props
}, ref) => {
  const { focusVisible } = useAccessibility();

  // Auto-generate aria-label if iconOnly without explicit ariaLabel
  const computedAriaLabel = iconOnly && !ariaLabel 
    ? children ? String(children) : ariaLabel
    : ariaLabel;

  const ariaProps = {};
  if (computedAriaLabel) ariaProps['aria-label'] = computedAriaLabel;
  if (ariaDescribedBy) ariaProps['aria-describedby'] = ariaDescribedBy;
  if (ariaPressed !== undefined) ariaProps['aria-pressed'] = ariaPressed;
  if (ariaExpanded !== undefined) ariaProps['aria-expanded'] = ariaExpanded;

  return (
    <Button
      ref={ref}
      disabled={disabled}
      onClick={onClick}
      className={`${className} ${focusVisible && !disabled ? 'ring-2 ring-offset-2 ring-[var(--color-interactive-default)]' : ''}`}
      {...ariaProps}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {!iconOnly && children}
    </Button>
  );
});

ButtonA11y.displayName = 'ButtonA11y';

export { ButtonA11y };
export default ButtonA11y;