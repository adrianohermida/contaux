import React from 'react';
import { Button } from '@/components/ui/button';

/**
 * Touch Button - Botão otimizado para touch
 * Hit target 48x48px mínimo, feedback tátil
 */
export default function TouchButton({ children, ...props }) {
  return (
    <Button
      {...props}
      className={`
        min-h-[48px] min-w-[48px]
        touch-manipulation
        active:scale-95
        transition-transform
        ${props.className || ''}
      `}
    >
      {children}
    </Button>
  );
}