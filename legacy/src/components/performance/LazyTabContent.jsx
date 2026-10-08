/**
 * Lazy Tab Content
 * Load tab content only when active
 */

import React from 'react';

export default function LazyTabContent({ isActive, children }) {
  if (!isActive) return null;
  return <>{children}</>;
}