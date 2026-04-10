import { renderHook, waitFor } from '@testing-library/react';
import { useAuthQuery } from './useAuthQuery';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';

// Mock dependencies
vi.mock('@/services/auth.service', () => ({
  authService: {
    getMe: vi.fn(),
  },
}));

vi.mock('@/store/auth.store', () => ({
  useAuthStore: vi.fn(),
}));

// Wrapper for query client
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={createTestQueryClient()}>
    {children}
  </QueryClientProvider>
);

describe('useAuthQuery hook', () => {
  const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not fetch when not authenticated', () => {
    (useAuthStore as any).mockImplementation((selector: any) =>
      selector({ isAuthenticated: false, token: null })
    );
    
    const { result } = renderHook(() => useAuthQuery(), { wrapper });
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.fetchStatus).toBe('idle');
    expect(authService.getMe).not.toHaveBeenCalled();
  });

  it('should fetch user data when authenticated', async () => {
    (useAuthStore as any).mockImplementation((selector: any) =>
      selector({ isAuthenticated: true, token: 'mock-token' })
    );
    (authService.getMe as any).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuthQuery(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockUser);
    expect(authService.getMe).toHaveBeenCalled();
  });

  it('should handle fetch errors', async () => {
    (useAuthStore as any).mockImplementation((selector: any) =>
      selector({ isAuthenticated: true, token: 'mock-token' })
    );
    (authService.getMe as any).mockRejectedValue(new Error('Auth failed'));

    const { result } = renderHook(() => useAuthQuery(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(authService.getMe).toHaveBeenCalled();
  });
});
