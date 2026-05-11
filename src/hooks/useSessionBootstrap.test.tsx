import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSessionBootstrap } from './useSessionBootstrap';
import { authService } from '@/services/auth.service';
import { societyService } from '@/services/society.service';
import { useAuthStore } from '@/store/auth.store';

vi.mock('@/services/auth.service', () => ({
  authService: {
    getMe: vi.fn(),
  },
}));

vi.mock('@/services/society.service', () => ({
  societyService: {
    getCurrent: vi.fn(),
  },
}));

vi.mock('@/store/auth.store', () => ({
  useAuthStore: vi.fn(),
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={createTestQueryClient()}>{children}</QueryClientProvider>
);

describe('useSessionBootstrap', () => {
  const hydrateSessionMock = vi.fn();
  const markAuthResolvedMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuthStore as any).mockImplementation((selector: any) =>
      selector({
        isAuthenticated: false,
        isAuthResolved: false,
        hydrateSession: hydrateSessionMock,
        markAuthResolved: markAuthResolvedMock,
      })
    );
  });

  it('hydrates the session and preloads society when backend session exists', async () => {
    const sessionData = {
      user: { id: '1', name: 'Test User' },
      role: { id: 'role-1', name: 'Admin' },
      token: 'server-token',
      expiresAt: '2099-01-01',
      subscription: { status: 'ACTIVE', planId: 'plan-1', endDate: '2099-01-01' },
    };
    (authService.getMe as any).mockResolvedValue({ data: sessionData });
    (societyService.getCurrent as any).mockResolvedValue({ success: true });

    const { result } = renderHook(() => useSessionBootstrap(), { wrapper });

    await waitFor(() => expect(hydrateSessionMock).toHaveBeenCalledWith(sessionData));
    expect(societyService.getCurrent).toHaveBeenCalledWith('server-token');
    expect(result.current.isBootstrapping).toBe(false);
    expect(markAuthResolvedMock).toHaveBeenCalled();
  });

  it('does not bootstrap again when auth was already resolved', () => {
    (useAuthStore as any).mockImplementation((selector: any) =>
      selector({
        isAuthenticated: false,
        isAuthResolved: true,
        hydrateSession: hydrateSessionMock,
        markAuthResolved: markAuthResolvedMock,
      })
    );

    const { result } = renderHook(() => useSessionBootstrap(), { wrapper });

    expect(result.current.isBootstrapping).toBe(false);
    expect(authService.getMe).not.toHaveBeenCalled();
  });
});
