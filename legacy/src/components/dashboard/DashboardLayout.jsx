import React, { useState, useCallback, memo } from 'react';
import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';
import MobileMenu from './MobileMenu';
import PerformanceMonitor from './PerformanceMonitor';

/**
 * Layout padrão do dashboard - garante consistência do sidebar + header
 * Deve ser usado através do Layout.js para todas as páginas dashboard
 */
const DashboardLayout = memo(function DashboardLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem('sidebarCollapsed');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });
  
  const handleSetCollapsed = useCallback((value) => {
    setSidebarCollapsed(value);
  }, []);

  // Persist collapse state to localStorage
  React.useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  return (
    <div className="flex min-h-screen bg-[var(--color-background-primary)] transition-colors" role="application" aria-label="Dashboard principal">
      {/* Skip Link - keyboard navigation */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-[var(--spacing-md)] focus:left-[var(--spacing-md)] focus:z-50 focus:bg-blue-600 focus:text-white focus:px-[var(--spacing-md)] focus:py-[var(--spacing-sm)] focus:rounded-md"
      >
        Pular para conteúdo principal
      </a>

      {/* Mobile Menu - sempre no topo em mobile */}
      <MobileMenu />

      {/* Sidebar - hidden on mobile, visible on desktop, FIXED position */}
      <aside 
        className={`hidden md:block md:fixed md:left-0 md:top-0 md:h-screen md:z-30 transition-all duration-300 ${sidebarCollapsed ? 'md:w-16' : 'md:w-64'}`}
        role="complementary"
        aria-label="Navegação lateral"
      >
        <Sidebar collapsed={sidebarCollapsed} setCollapsed={handleSetCollapsed} />
      </aside>
      
      {/* Main Content - com margem para compensar sidebar fixo */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
        {/* Mobile padding para menu */}
          <div className="h-[var(--spacing-2xl)] md:h-0" aria-hidden="true" />
        
        {/* Header - sempre visível e consistente */}
        <DashboardHeader />
        
        <main 
           id="main-content"
           className="flex-1 p-[var(--spacing-md)] sm:p-[var(--spacing-lg)] md:p-[var(--spacing-xl)] bg-[var(--color-background-primary)] pb-24 md:pb-[var(--spacing-lg)] overflow-y-auto safe-area-inset focus:outline-none"
           role="main"
           aria-label="Conteúdo principal"
           tabIndex={-1}
         >
          {children}
        </main>
      </div>

      {/* Performance Monitor - only in dev/staging */}
      {process.env.NODE_ENV !== 'production' && <PerformanceMonitor />}
    </div>
  );
});

export default DashboardLayout;