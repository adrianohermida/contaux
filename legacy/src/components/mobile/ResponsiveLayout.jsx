import React from 'react';

/**
 * Responsive Layout - Grid responsivo para mobile
 * Adapta automaticamente baseado no tamanho da tela
 */
export default function ResponsiveLayout({ children, cols = 1 }) {
  return (
    <div className={`
      grid gap-4
      grid-cols-1
      sm:grid-cols-1
      md:grid-cols-2
      lg:grid-cols-${cols}
      xl:grid-cols-${cols}
      w-full
      auto-rows-max
    `}>
      {React.Children.map(children, (child) => (
        <div className="min-w-0">
          {child}
        </div>
      ))}
    </div>
  );
}