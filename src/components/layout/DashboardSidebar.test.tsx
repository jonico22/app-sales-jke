import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import DashboardSidebar from './DashboardSidebar';
import { useAuthStore } from '@/store/auth.store';
import { usePermissions } from '@/hooks/usePermissions';

// Mock the stores and hooks
vi.mock('@/store/auth.store', () => ({
  useAuthStore: vi.fn(),
}));

vi.mock('@/hooks/usePermissions', () => ({
  usePermissions: vi.fn(),
}));

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    clear: vi.fn(),
  }),
}));

describe('DashboardSidebar', () => {
  const mockUser = { name: 'Jose Developer', email: 'jose@jke.com' };
  const mockRole = { name: 'Administrador' };
  const mockSubscription = { status: 'ACTIVE' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const setupMockStore = (overrides = {}) => {
    (useAuthStore as any).mockImplementation((selector: any) => selector({
      user: mockUser,
      role: mockRole,
      subscription: mockSubscription,
      logout: vi.fn(),
      ...overrides
    }));
  };

  it('renders logo and primary navigation titles', () => {
    setupMockStore();
    (usePermissions as any).mockReturnValue({
      data: { modules: { DASHBOARD: true, VENTAS: true, USUARIOS: true } },
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <DashboardSidebar 
          isOpen={true} 
          onClose={vi.fn()} 
          isCollapsed={false} 
          toggleCollapse={vi.fn()} 
        />
      </MemoryRouter>
    );

    expect(screen.getByText(/JKE SOLUTIONS/i)).toBeDefined();
    expect(screen.getByText('Dashboard')).toBeDefined();
    expect(screen.getByText('Ventas')).toBeDefined();
    expect(screen.getByText('Usuarios')).toBeDefined();
  });

  it('filters navigation items based on permissions', () => {
    setupMockStore();
    (usePermissions as any).mockReturnValue({
      data: { modules: { DASHBOARD: true, REPORTES: true } },
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <DashboardSidebar 
          isOpen={true} 
          onClose={vi.fn()} 
          isCollapsed={false} 
          toggleCollapse={vi.fn()} 
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Dashboard')).toBeDefined();
    expect(screen.getByText('Reportes')).toBeDefined();
    
    // Ventas and Usuarios should not be rendered
    expect(screen.queryByText('Ventas')).toBeNull();
    expect(screen.queryByText('Usuarios')).toBeNull();
  });

  it('shows analytics entry inside reportes when the reports module is active', () => {
    setupMockStore();
    (usePermissions as any).mockReturnValue({
      data: { modules: { REPORTES: true } },
      isLoading: false,
    });

    render(
      <MemoryRouter initialEntries={['/reports/analytics']}>
        <DashboardSidebar
          isOpen={true}
          onClose={vi.fn()}
          isCollapsed={false}
          toggleCollapse={vi.fn()}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Reportes')).toBeDefined();
    expect(screen.getByText('Analytics')).toBeDefined();
  });

  it('restricts navigation when subscription is EXPIRED', () => {
    setupMockStore({ subscription: { status: 'EXPIRED' } });
    (usePermissions as any).mockReturnValue({
      data: { modules: { DASHBOARD: true, VENTAS: true } },
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <DashboardSidebar 
          isOpen={true} 
          onClose={vi.fn()} 
          isCollapsed={false} 
          toggleCollapse={vi.fn()} 
        />
      </MemoryRouter>
    );

    expect(screen.queryByText('Dashboard')).toBeNull();
    expect(screen.queryByText('Ventas')).toBeNull();
    expect(screen.getByText('Configuración')).toBeDefined();
  });

  it('shows skeleton items while loading permissions', () => {
    setupMockStore();
    (usePermissions as any).mockReturnValue({
      data: null,
      isLoading: true,
    });

    const { container } = render(
      <MemoryRouter>
        <DashboardSidebar 
          isOpen={true} 
          onClose={vi.fn()} 
          isCollapsed={false} 
          toggleCollapse={vi.fn()} 
        />
      </MemoryRouter>
    );

    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
