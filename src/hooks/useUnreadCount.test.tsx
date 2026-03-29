import { renderHook, waitFor } from '@testing-library/react';
import { useUnreadCount } from './useUnreadCount';
import { notificationService } from '@/services/notification.service';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';

// Mock dependencies
vi.mock('@/services/notification.service', () => ({
  notificationService: {
    getUnreadCount: vi.fn(),
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

describe('useUnreadCount hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should parse count when response is a number', async () => {
        (notificationService.getUnreadCount as any).mockResolvedValue(5);
        const { result } = renderHook(() => useUnreadCount(), { wrapper });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toBe(5);
    });

    it('should parse count from response.data', async () => {
        (notificationService.getUnreadCount as any).mockResolvedValue({ data: 10 });
        const { result } = renderHook(() => useUnreadCount(), { wrapper });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toBe(10);
    });

    it('should parse count from response.data.count', async () => {
        (notificationService.getUnreadCount as any).mockResolvedValue({ data: { count: 15 } });
        const { result } = renderHook(() => useUnreadCount(), { wrapper });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toBe(15);
    });

    it('should parse count from response.count', async () => {
        (notificationService.getUnreadCount as any).mockResolvedValue({ count: 20 });
        const { result } = renderHook(() => useUnreadCount(), { wrapper });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toBe(20);
    });

    it('should return 0 when no count is found', async () => {
        (notificationService.getUnreadCount as any).mockResolvedValue({});
        const { result } = renderHook(() => useUnreadCount(), { wrapper });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toBe(0);
    });
});
