/**
 * useAppShortcuts Hook
 * Configure and manage web app shortcuts
 */

import { useEffect } from 'react';

const DEFAULT_SHORTCUTS = [
  {
    name: 'New Contact',
    short_name: 'Contact',
    description: 'Create a new contact',
    url: '/contact?new=true',
    icons: [
      {
        src: '/icons/new-contact-96.png',
        sizes: '96x96',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  },
  {
    name: 'View Invoices',
    short_name: 'Invoices',
    description: 'View and manage invoices',
    url: '/invoicing',
    icons: [
      {
        src: '/icons/invoices-96.png',
        sizes: '96x96',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  },
  {
    name: 'Reports',
    short_name: 'Reports',
    description: 'View business reports',
    url: '/reports',
    icons: [
      {
        src: '/icons/reports-96.png',
        sizes: '96x96',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  },
];

export function useAppShortcuts(customShortcuts = []) {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const shortcuts = customShortcuts.length > 0 ? customShortcuts : DEFAULT_SHORTCUTS;

    // Update manifest with shortcuts
    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (manifestLink) {
      const manifestUrl = manifestLink.href;
      
      fetch(manifestUrl)
        .then(res => res.json())
        .then(manifest => {
          manifest.shortcuts = shortcuts;
          // In production, this would be handled by backend
          // For now, shortcuts are defined in web manifest
        })
        .catch(err => console.error('Failed to update shortcuts:', err));
    }
  }, [customShortcuts]);

  return {
    shortcuts: customShortcuts.length > 0 ? customShortcuts : DEFAULT_SHORTCUTS,
  };
}

export default useAppShortcuts;