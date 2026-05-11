import { render, screen } from '@/tests/test-utils';
import ProtectedRoute from './ProtectedRoute';
import { vi, describe, it, expect, beforeEach } from 'vitest';

const mockLocation = { pathname: '/' };

vi.mock('@/hooks/useSocketConnection', () => ({
  useSocketConnection: vi.fn(),
}));

vi.mock('@/hooks/useRealtimeUpdates', () => ({
  useRealtimeUpdates: vi.fn(),
}));

vi.mock('@/store/auth.store', () => ({
  useAuthStore: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    Outlet: () => <div>protected content</div>,
    Navigate: ({ to }: { to: string }) => <div>navigate:{to}</div>,
    useLocation: () => mockLocation,
  };
});

import { useAuthStore } from '@/store/auth.store';

describe('ProtectedRoute', () => {
  beforeEach(() => {
    mockLocation.pathname = '/';
  });

  it('redirects unauthenticated users to login', () => {
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isAuthenticated: false,
      user: null,
      subscription: null,
    });

    render(<ProtectedRoute />);

    expect(screen.getByText('navigate:/auth/login')).toBeInTheDocument();
  });

  it('redirects users with unverified email to login', () => {
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isAuthenticated: true,
      user: { emailVerified: false, mustChangePassword: false },
      subscription: null,
    });

    render(<ProtectedRoute />);

    expect(screen.getByText('navigate:/auth/login')).toBeInTheDocument();
  });

  it('redirects users who must change password to security', () => {
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isAuthenticated: true,
      user: { emailVerified: true, mustChangePassword: true },
      subscription: null,
    });

    render(<ProtectedRoute />);

    expect(screen.getByText('navigate:/security')).toBeInTheDocument();
  });

  it('redirects pending subscriptions to onboarding payment', () => {
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isAuthenticated: true,
      user: { emailVerified: true, mustChangePassword: false },
      subscription: { status: 'PENDING' },
    });

    render(<ProtectedRoute />);

    expect(screen.getByText('navigate:/onboarding/payment')).toBeInTheDocument();
  });

  it('redirects expired subscriptions to billing', () => {
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isAuthenticated: true,
      user: { emailVerified: true, mustChangePassword: false },
      subscription: { status: 'EXPIRED' },
    });

    render(<ProtectedRoute />);

    expect(screen.getByText('navigate:/settings/billing')).toBeInTheDocument();
  });

  it('renders the outlet when access is allowed', () => {
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isAuthenticated: true,
      user: { emailVerified: true, mustChangePassword: false },
      subscription: { status: 'ACTIVE' },
    });

    render(<ProtectedRoute />);

    expect(screen.getByText('protected content')).toBeInTheDocument();
  });
});
