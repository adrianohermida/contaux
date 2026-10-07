import React from 'react';

/**
 * ResponsiveTable - Converts to card-based layout on mobile
 * @param {Object} props
 * @param {Array} props.columns - Column definitions with key, label, render function
 * @param {Array} props.data - Table data
 * @param {React.ReactNode} props.children - Custom table/card content
 * @param {string} props.className - Additional CSS classes
 */
export default function ResponsiveTable({ columns, data, children, className = '' }) {
  if (children) {
    return children;
  }

  return (
    <>
      {/* Desktop Table */}
      <div className={`hidden md:block overflow-x-auto ${className}`}>
        <table className="w-full border-collapse">
          <thead className="bg-[var(--color-background-secondary)] border-b border-[var(--color-border-default)]">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-[var(--spacing-md)] py-[var(--spacing-sm)] text-left text-sm font-semibold text-[var(--color-foreground-primary)]"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border-default)]">
            {data.map((row, idx) => (
              <tr
                key={row.id || idx}
                className="hover:bg-[var(--color-background-secondary)] transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={`${row.id || idx}-${col.key}`}
                    className="px-[var(--spacing-md)] py-[var(--spacing-sm)] text-sm text-[var(--color-foreground-primary)]"
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-[var(--spacing-md)]">
        {data.map((row, idx) => (
          <div
            key={row.id || idx}
            className="bg-[var(--color-background-primary)] rounded-lg shadow p-[var(--spacing-md)] border border-[var(--color-border-default)]"
          >
            {columns.map((col) => (
              <div key={`${row.id || idx}-${col.key}`} className="flex justify-between py-[var(--spacing-xs)] last:pb-0">
                <span className="text-sm font-medium text-[var(--color-foreground-secondary)]">
                  {col.label}
                </span>
                <span className="text-sm text-[var(--color-foreground-primary)] text-right">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}