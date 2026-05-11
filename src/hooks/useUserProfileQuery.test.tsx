import { renderHook, waitFor } from '@testing-library/react';
import { useUserProfileQuery } from './useUserProfileQuery';
import { userService } from '@/services/user.service';
import { useAuthStore } from '@/store/auth.store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';

// Mock dependencies
vi.mock('@/services/user.service', () => ({
  userService: {
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

describe('useUserProfileQuery hook', () => {
    const mockUser = { id: 'user-1', name: 'Profile User', email: 'profile@example.com' };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should not fetch when not authenticated', () => {
        (useAuthStore as any).mockImplementation((selector: any) =>
            selector({ isAuthenticated: false, token: null })
        );
        
        const { result } = renderHook(() => useUserProfileQuery(), { wrapper });
        
        expect(result.current.fetchStatus).toBe('idle');
        expect(userService.getMe).not.toHaveBeenCalled();
    });

    it('should fetch user profile when authenticated', async () => {
        (useAuthStore as any).mockImplementation((selector: any) =>
            selector({ isAuthenticated: true, token: 'mock-token' })
        );
        (userService.getMe as any).mockResolvedValue(mockUser);

        const { result } = renderHook(() => useUserProfileQuery(), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual(mockUser);
        expect(userService.getMe).toHaveBeenCalled();
    });
});
