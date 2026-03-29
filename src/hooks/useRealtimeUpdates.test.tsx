import { renderHook } from '@testing-library/react';
import { useRealtimeUpdates } from './useRealtimeUpdates';
import { useQueryClient } from '@tanstack/react-query';
import { socket } from '@/services/socket';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: vi.fn(),
}));

vi.mock('@/services/socket', () => ({
  socket: {
    on: vi.fn(),
    off: vi.fn(),
  },
}));

describe('useRealtimeUpdates hook', () => {
    const mockInvalidateQueries = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useQueryClient as any).mockReturnValue({
            invalidateQueries: mockInvalidateQueries,
        });
    });

    it('should register and unregister socket listener', () => {
        const { unmount } = renderHook(() => useRealtimeUpdates());

        expect(socket.on).toHaveBeenCalledWith('ui_update_table', expect.any(Function));
        
        unmount();
        expect(socket.off).toHaveBeenCalledWith('ui_update_table', expect.any(Function));
    });

    it('should invalidate dashboard stats on any update', () => {
        renderHook(() => useRealtimeUpdates());
        
        const handleUpdateTable = (socket.on as any).mock.calls[0][1];
        
        handleUpdateTable({ table: 'categories' });

        expect(mockInvalidateQueries).toHaveBeenCalledWith(expect.objectContaining({
            queryKey: ['dashboard-stats']
        }));
    });

    it('should invalidate specific entity queries based on payload', () => {
        renderHook(() => useRealtimeUpdates());
        const handleUpdateTable = (socket.on as any).mock.calls[0][1];
        
        // Test categories
        handleUpdateTable({ table: 'categories' });
        expect(mockInvalidateQueries).toHaveBeenCalledWith(expect.objectContaining({
            queryKey: ['categories']
        }));

        // Test brands
        handleUpdateTable({ table: 'brands' });
        expect(mockInvalidateQueries).toHaveBeenCalledWith(expect.objectContaining({
            queryKey: ['brands']
        }));

        // Test VENTA (orders)
        handleUpdateTable({ entity: 'VENTA' });
        expect(mockInvalidateQueries).toHaveBeenCalledWith(expect.objectContaining({
            queryKey: ['orders']
        }));
    });

    it('should use fallback invalidation if no entity is provided', () => {
        renderHook(() => useRealtimeUpdates());
        const handleUpdateTable = (socket.on as any).mock.calls[0][1];
        
        handleUpdateTable({});

        expect(mockInvalidateQueries).toHaveBeenCalledWith(expect.objectContaining({
            queryKey: ['categories']
        }));
    });
});
