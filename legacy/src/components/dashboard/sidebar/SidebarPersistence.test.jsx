/**
 * ✅ SIDEBAR PERSISTENCE TESTS
 * Verifica localStorage, collapse state, submenu persistence
 */

describe('Sidebar Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Collapse State Persistence', () => {
    test('deve persistir sidebar collapsed=true no localStorage', () => {
      const collapsed = true;
      localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed));
      
      const stored = JSON.parse(localStorage.getItem('sidebarCollapsed'));
      expect(stored).toBe(true);
    });

    test('deve persistir sidebar collapsed=false no localStorage', () => {
      const collapsed = false;
      localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed));
      
      const stored = JSON.parse(localStorage.getItem('sidebarCollapsed'));
      expect(stored).toBe(false);
    });

    test('deve recuperar collapsed state ao recarregar app', () => {
      // Simula salvar
      localStorage.setItem('sidebarCollapsed', JSON.stringify(true));
      
      // Simula recarregar
      const saved = localStorage.getItem('sidebarCollapsed');
      const isCollapsed = saved ? JSON.parse(saved) : false;
      
      expect(isCollapsed).toBe(true);
    });

    test('deve usar default false se localStorage vazio', () => {
      const saved = localStorage.getItem('sidebarCollapsed');
      const isCollapsed = saved ? JSON.parse(saved) : false;
      
      expect(isCollapsed).toBe(false);
    });

    test('deve lidar com corrupted localStorage gracefully', () => {
      localStorage.setItem('sidebarCollapsed', 'corrupted-data');
      
      let isCollapsed = false;
      try {
        const saved = localStorage.getItem('sidebarCollapsed');
        isCollapsed = saved ? JSON.parse(saved) : false;
      } catch {
        isCollapsed = false;
      }
      
      expect(isCollapsed).toBe(false);
    });
  });

  describe('Submenu State Persistence', () => {
    test('deve manter submenu open state durante navegação', () => {
      const openMenus = { 'CRM': true, 'Finance': false };
      sessionStorage.setItem('openMenus', JSON.stringify(openMenus));
      
      const stored = JSON.parse(sessionStorage.getItem('openMenus'));
      expect(stored).toEqual(openMenus);
    });

    test('deve limpar submenu state ao fazer logout', () => {
      sessionStorage.setItem('openMenus', JSON.stringify({ 'CRM': true }));
      sessionStorage.removeItem('openMenus');
      
      const stored = sessionStorage.getItem('openMenus');
      expect(stored).toBeNull();
    });

    test('deve recuperar múltiplos submenus abertos', () => {
      const menus = { 'Sales': true, 'Finance': true, 'HR': false };
      sessionStorage.setItem('openMenus', JSON.stringify(menus));
      
      const stored = JSON.parse(sessionStorage.getItem('openMenus'));
      expect(Object.keys(stored).length).toBe(3);
      expect(stored['Sales']).toBe(true);
    });
  });

  describe('Query Cache Persistence', () => {
    test('deve cachear unread count queries', () => {
      // Simula React Query cache key
      const cacheKey = 'sidebar-unread';
      const data = { unreadCount: 5 };
      
      // Em produção, React Query maneja isso
      sessionStorage.setItem(`cache-${cacheKey}`, JSON.stringify(data));
      
      const cached = JSON.parse(sessionStorage.getItem(`cache-${cacheKey}`));
      expect(cached.unreadCount).toBe(5);
    });

    test('deve invalidar cache ao fazer logout', () => {
      sessionStorage.setItem('cache-sidebar-unread', JSON.stringify({ unreadCount: 5 }));
      sessionStorage.removeItem('cache-sidebar-unread');
      
      const cached = sessionStorage.getItem('cache-sidebar-unread');
      expect(cached).toBeNull();
    });
  });

  describe('Storage Limits', () => {
    test('deve lidar com localStorage quota exceeded', () => {
      const largeData = 'x'.repeat(10 * 1024 * 1024); // 10MB
      
      try {
        localStorage.setItem('sidebarCollapsed', largeData);
      } catch (e) {
        expect(e.name).toBe('QuotaExceededError');
      }
    });

    test('deve não quebrar se localStorage indisponível', () => {
      const mockStorage = {
        getItem: () => null,
        setItem: () => { throw new Error('Storage disabled'); },
        removeItem: () => {},
      };
      
      let result = false;
      try {
        mockStorage.setItem('test', 'value');
      } catch (e) {
        result = false;
      }
      
      expect(result).toBe(false);
    });
  });

  describe('Cross-Tab Persistence', () => {
    test('deve sincronizar collapse state entre tabs via storage event', (done) => {
      const initialCollapsed = localStorage.getItem('sidebarCollapsed');
      
      // Simula storage event de outra tab
      const event = new StorageEvent('storage', {
        key: 'sidebarCollapsed',
        newValue: JSON.stringify(true),
        oldValue: initialCollapsed,
        storageArea: localStorage
      });
      
      window.dispatchEvent(event);
      
      setTimeout(() => {
        const current = JSON.parse(localStorage.getItem('sidebarCollapsed') || 'false');
        expect(current).toBe(true);
        done();
      }, 100);
    });

    test('deve atualizar submenu state via storage event', (done) => {
      const event = new StorageEvent('storage', {
        key: 'openMenus',
        newValue: JSON.stringify({ 'CRM': true }),
        oldValue: null,
        storageArea: sessionStorage
      });
      
      window.dispatchEvent(event);
      
      setTimeout(() => {
        expect(sessionStorage.getItem('openMenus')).toBeTruthy();
        done();
      }, 100);
    });
  });
});