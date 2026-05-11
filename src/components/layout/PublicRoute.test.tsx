import { render, screen } from '@/tests/test-utils';
import PublicRoute from './PublicRoute';
import { vi, describe, it, expect } from 'vitest';

vi.mock('@/store/auth.store', () => ({
  useAuthStore: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    Outlet: () => <div>public content</div>,
    Navigate: ({ to }: { to: string }) => <div>navigate:{to}</div>,
  };
});

import { useAuthStore } from '@/store/auth.store';

describe('PublicRoute', () => {
  it('redirects authenticated users to home', () => {
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (state: { isAuthenticated: boolean }) => boolean) =>
      selector({ isAuthenticated: true })
    );

    render(<PublicRoute />);

    expect(screen.getByText('navigate:/')).toBeInTheDocument();
  });

  it('renders outlet for guest users', () => {
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (state: { isAuthenticated: boolean }) => boolean) =>
      selector({ isAuthenticated: false })
    );

    render(<PublicRoute />);

    expect(screen.getByText('public content')).toBeInTheDocument();
  });
});
