import { fireEvent, render, screen } from '@/tests/test-utils';
import DashboardLayout from './DashboardLayout';
import { vi, describe, it, expect, beforeEach } from 'vitest';

const mediaQueryMock = vi.fn();

vi.mock('@/hooks/useSessionValidator', () => ({
  useSessionValidator: vi.fn(() => ({
    isSessionExpired: false,
    handleRedirect: vi.fn(),
  })),
}));

vi.mock('@/hooks/useMediaQuery', () => ({
  useMediaQuery: vi.fn((query: string) => mediaQueryMock(query)),
}));

vi.mock('@/store/auth.store', () => ({
  useAuthStore: vi.fn(),
}));

vi.mock('./DashboardSidebar', () => ({
  default: ({ isOpen, isCollapsed, toggleCollapse }: { isOpen: boolean; isCollapsed: boolean; toggleCollapse: () => void }) => (
    <div>
      <span>sidebar:{String(isOpen)}:{String(isCollapsed)}</span>
      <button onClick={toggleCollapse}>toggle-collapse</button>
    </div>
  ),
}));

vi.mock('./DashboardHeader', () => ({
  default: ({ onMenuClick, hideMenu }: { onMenuClick: () => void; hideMenu: boolean }) => (
    <div>
      <span>header-hide:{String(hideMenu)}</span>
      <button onClick={onMenuClick}>toggle-menu</button>
    </div>
  ),
}));

vi.mock('./MobileNavFooter', () => ({
  MobileNavFooter: ({ onMenuClick }: { onMenuClick: () => void }) => (
    <button onClick={onMenuClick}>open-mobile-nav</button>
  ),
}));

vi.mock('@/components/shared/SessionExpiredModal', () => ({
  SessionExpiredModal: ({ isOpen, onLogin }: { isOpen: boolean; onLogin: () => void }) => (
    <button onClick={onLogin}>session-modal:{String(isOpen)}</button>
  ),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    Outlet: () => <div>dashboard outlet</div>,
  };
});

import { useAuthStore } from '@/store/auth.store';
import { useSessionValidator } from '@/hooks/useSessionValidator';

describe('DashboardLayout', () => {
  beforeEach(() => {
    mediaQueryMock.mockImplementation((query: string) => {
      if (query.includes('767')) return false;
      if (query.includes('768')) return false;
      if (query.includes('1024')) return true;
      return false;
    });
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (state: { user: { mustChangePassword?: boolean } | null }) => unknown) =>
      selector({ user: { mustChangePassword: false } })
    );
  });

  it('renders layout shell and toggles sidebar', () => {
    render(<DashboardLayout />);

    expect(screen.getByText('dashboard outlet')).toBeInTheDocument();
    expect(screen.getByText('sidebar:false:false')).toBeInTheDocument();

    fireEvent.click(screen.getByText('toggle-menu'));
    expect(screen.getByText('sidebar:true:false')).toBeInTheDocument();

    fireEvent.click(screen.getByText('toggle-collapse'));
    expect(screen.getByText('sidebar:true:true')).toBeInTheDocument();
  });

  it('hides navigation when password change is required', () => {
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (state: { user: { mustChangePassword?: boolean } | null }) => unknown) =>
      selector({ user: { mustChangePassword: true } })
    );

    render(<DashboardLayout />);

    expect(screen.queryByText(/sidebar:/)).not.toBeInTheDocument();
    expect(screen.getByText('header-hide:true')).toBeInTheDocument();
    expect(screen.queryByText('open-mobile-nav')).not.toBeInTheDocument();
  });

  it('wires session expiration modal redirect handler', () => {
    const handleRedirect = vi.fn();
    (useSessionValidator as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isSessionExpired: true,
      handleRedirect,
    });

    render(<DashboardLayout />);
    fireEvent.click(screen.getByText('session-modal:true'));

    expect(handleRedirect).toHaveBeenCalled();
  });
});
