import { renderHook, waitFor } from '@testing-library/react';
import { usePermissions } from './usePermissions';
import { authService } from '@/services/auth.service';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';

// Mock dependencies
vi.mock('@/services/auth.service', () => ({
  authService: {
    getPermissions: vi.fn(),
  },
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

describe('usePermissions hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should fetch permissions successfully', async () => {
        const mockData = { success: true, data: ['READ_PRODUCTS', 'WRITE_PRODUCTS'] };
        (authService.getPermissions as any).mockResolvedValue(mockData);

        const { result } = renderHook(() => usePermissions(), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual(mockData.data);
        expect(authService.getPermissions).toHaveBeenCalled();
    });

    it('should throw error when success is false', async () => {
        const mockError = { success: false, message: 'Unauthorized' };
        (authService.getPermissions as any).mockResolvedValue(mockError);

        const { result } = renderHook(() => usePermissions(), { wrapper });

        await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 3000 });
        expect(result.current.error?.message).toBe('Unauthorized');
    });

    it('should handle service rejection', async () => {
        (authService.getPermissions as any).mockRejectedValue(new Error('Network error'));

        const { result } = renderHook(() => usePermissions(), { wrapper });

        // usePermissions has retry: 1, so it takes longer to fail
        await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 3000 });
        expect(result.current.error?.message).toBe('Network error');
    });
});
