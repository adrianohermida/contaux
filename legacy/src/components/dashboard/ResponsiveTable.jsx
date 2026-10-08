import React from 'react';

export default function ResponsiveTable({ children, caption, className = '' }) {
  return (
    <div className={`w-full ${className}`} role="region" aria-label="Tabela responsiva">
      {/* Desktop: Table */}
      <div className="hidden md:block overflow-x-auto focus:outline-none" tabIndex={-1}>
        <table className="w-full text-sm border-collapse" role="table">
          {caption && (
            <caption className="sr-only text-left mb-2 font-semibold">
              {caption}
            </caption>
          )}
          {children}
        </table>
      </div>
      
      {/* Mobile: Cards (handled by parent component) */}
      <div className="md:hidden" role="presentation">
        {children}
      </div>
    </div>
  );
}