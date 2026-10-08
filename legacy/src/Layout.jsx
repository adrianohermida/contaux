import React from 'react';
import { ThemeProvider } from './components/hooks/useTheme';
import { AuthProvider } from './components/auth/AuthContext';
import { CacheProvider } from './components/context/CacheContext';
import AccessibilityProvider from './components/a11y/AccessibilityProvider';
import Header from './components/Header';
import Footer from './components/Footer';
import DashboardLayout from './components/dashboard/DashboardLayout';
import ProtectedInternalRoute from './components/auth/ProtectedInternalRoute';
import BottomNav from './components/BottomNav';
import RouteTransition from './components/RouteTransition';

import SecurityDashboard from './components/security/SecurityDashboard';
import OfflineIndicator from './components/pwa/OfflineIndicator';
import PWAInstallPrompt from './components/pwa/PWAInstallPrompt';
import { SyncStatus } from './components/pwa/SyncManager';

// ✅ Constante FORA do componente - criada uma única vez
const DASHBOARD_PAGES = [
  'Dashboard', 'VirtualCounter', 'Clients', 'Contact', 'ContactDetails', 'Tickets', 'LegalProcesses', 
  'Invoicing', 'Payments', 'Quotes', 'Sales', 'CashFlow', 
  'Services', 'Entries', 'ImportCSV', 'BankReconciliation', 
  'ManualPosting', 'ChartOfAccounts', 'TaxInvoices', 
  'AccountingCalendar', 'Automations', 'Reports', 'Communication', 
  'ClientPortal', 'SettingsPage', 'AuditLogs', 
  'DocumentManagement', 'SecurityCenter', 
  'CashFlowForecast', 'Transactions', 'BlogManager', 'RLSDebugger',
  'ReportsAnalytics', 'ReportsAdvanced', 'ReportsOperations'
];

// Security/Admin pages
const SECURITY_DASHBOARD_PAGES = ['SecurityCenter', 'SettingsPage'];

export default function Layout({ children, currentPageName }) {
  const setupTheme = () => {
    try {
      const saved = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = saved ? saved === 'dark' : prefersDark;
      const root = document.documentElement;
      if (isDark) {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
      } else {
        root.classList.remove('dark');
        root.removeAttribute('data-theme');
      }
    } catch (e) {
      // Ignore errors
    }
  };

  const setupMobileEnhancements = () => {
    const style = document.createElement('style');
    style.textContent = `
      /* Safe area support */
      html { 
        overscroll-behavior: none;
        -webkit-user-select: none;
      }
      body { 
        -webkit-user-select: none;
        -webkit-touch-callout: none;
      }
      input, textarea, select {
        -webkit-user-select: text;
        user-select: text;
      }
      button, [role="button"], a, [tabindex] {
        user-select: none;
        -webkit-user-select: none;
        -webkit-tap-highlight-color: transparent;
      }
      * { box-sizing: border-box; }
      @supports (padding: env(safe-area-inset-top)) {
        body { padding-top: env(safe-area-inset-top); }
      }
      @supports (padding: env(safe-area-inset-bottom)) {
        main { padding-bottom: env(safe-area-inset-bottom); }
      }
    `;
    document.head.appendChild(style);
  };

  React.useEffect(() => {
    setupTheme();
    setupMobileEnhancements();
    
    // Listen for system theme changes
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = () => {
      if (!localStorage.getItem('theme')) {
        setupTheme();
      }
    };
    darkModeQuery.addEventListener('change', handleThemeChange);
    
    // Register Service Worker for PWA offline support
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').catch(() => {
        // Service worker registration failed - offline features limited
      });
    }
    
    const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
    link.rel = 'icon';
    link.href = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ff672740bf3d542ac6481/d48cce015_favicon.png';
    if (!document.querySelector("link[rel~='icon']")) {
      document.head.appendChild(link);
    }

    return () => {
      darkModeQuery.removeEventListener('change', handleThemeChange);
    };
  }, []);

  if (DASHBOARD_PAGES.includes(currentPageName)) {
    return (
      <AuthProvider>
        <CacheProvider>
          <ThemeProvider>
            <AccessibilityProvider>
            <DashboardLayout>
              <ProtectedInternalRoute>
                <RouteTransition>
                  {children}
                </RouteTransition>
              </ProtectedInternalRoute>
              {/* Security Dashboard for admin pages */}
              {SECURITY_DASHBOARD_PAGES.includes(currentPageName) && (
                <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
                  <SecurityDashboard />
                </div>
              )}
            </DashboardLayout>
            <BottomNav />
            </AccessibilityProvider>
          </ThemeProvider>
        </CacheProvider>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <CacheProvider>
        <ThemeProvider>
          <AccessibilityProvider>
          <OfflineIndicator />
          <PWAInstallPrompt />
          <SyncStatus />
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              <RouteTransition>
                {children}
              </RouteTransition>
            </main>
            <Footer />
          </div>
          </AccessibilityProvider>
        </ThemeProvider>
      </CacheProvider>
    </AuthProvider>
  );
}