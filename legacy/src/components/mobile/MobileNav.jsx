import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

/**
 * Mobile Navigation - Menu responsivo para mobile
 * Toggle menu, bottom navigation, mobile-first design
 */
export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  const mainMenu = [
    { label: 'Dashboard', path: createPageUrl('Dashboard') },
    { label: 'Clients', path: createPageUrl('Clients') },
    { label: 'Invoices', path: createPageUrl('Invoicing') },
    { label: 'Reports', path: createPageUrl('Reports') },
    { label: 'Settings', path: createPageUrl('SettingsPage') },
  ];

  const bottomMenu = [
    { label: 'Dashboard', icon: '📊', path: createPageUrl('Dashboard') },
    { label: 'Clients', icon: '👥', path: createPageUrl('Clients') },
    { label: 'Invoices', icon: '📄', path: createPageUrl('Invoicing') },
    { label: 'Reports', icon: '📈', path: createPageUrl('Reports') },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold">App</h1>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 top-14 bg-white z-40 overflow-y-auto pb-20">
          <nav className="space-y-1 p-4">
            {mainMenu.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="block px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg font-medium"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex justify-around">
        {bottomMenu.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="flex-1 flex flex-col items-center justify-center py-3 text-xs font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50"
          >
            <span className="text-xl mb-1">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}