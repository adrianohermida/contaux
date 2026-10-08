import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import Sidebar from '../Sidebar';

// Mock modules
jest.mock('./sidebar/sidebarConfig', () => ({
  SIDEBAR_MENU_ITEMS: [
    { icon: () => null, label: 'Dashboard', page: 'Dashboard' },
    { icon: () => null, label: 'Clientes', page: 'Contact' },
  ]
}));

jest.mock('./sidebar/useSidebarMenu', () => ({
  useSidebarMenu: () => ({
    unreadCount: 0,
    openMenus: {},
    toggleSubmenu: jest.fn(),
  })
}));

const queryClient = new QueryClient();

describe('Sidebar', () => {
  const renderSidebar = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Sidebar collapsed={false} setCollapsed={jest.fn()} {...props} />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  it('renders sidebar with menu items', () => {
    renderSidebar();
    expect(screen.getByText('Contaux')).toBeInTheDocument();
  });

  it('handles collapse toggle', () => {
    const mockSetCollapsed = jest.fn();
    renderSidebar({ setCollapsed: mockSetCollapsed });
    
    const toggleBtn = screen.getByRole('button', { name: /toggle sidebar/i });
    fireEvent.click(toggleBtn);
    expect(mockSetCollapsed).toHaveBeenCalled();
  });

  it('persists collapsed state to localStorage', () => {
    renderSidebar({ collapsed: true });
    expect(localStorage.getItem('sidebarCollapsed')).toBe('true');
  });
});