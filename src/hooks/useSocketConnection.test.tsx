import { renderHook } from '@testing-library/react';
import { useSocketConnection } from './useSocketConnection';
import { useSocietyStore } from '@/store/society.store';
import { connectSocket, disconnectSocket } from '@/services/socket';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('@/store/society.store', () => ({
  useSocietyStore: vi.fn(),
}));

vi.mock('@/services/socket', () => ({
  connectSocket: vi.fn(),
  disconnectSocket: vi.fn(),
  socket: {
      connected: false
  }
}));

describe('useSocketConnection hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should connect when society has subscriptionId', () => {
        (useSocietyStore as any).mockImplementation((selector: any) => selector({
            society: { subscriptionId: 'sub-123' }
        }));

        renderHook(() => useSocketConnection());

        expect(connectSocket).toHaveBeenCalledWith('sub-123');
    });

    it('should disconnect when society has no subscriptionId', () => {
        (useSocietyStore as any).mockImplementation((selector: any) => selector({
            society: null
        }));

        renderHook(() => useSocketConnection());

        expect(disconnectSocket).toHaveBeenCalled();
    });

    it('should disconnect on unmount', () => {
        (useSocietyStore as any).mockImplementation((selector: any) => selector({
            society: { subscriptionId: 'sub-123' }
        }));

        const { unmount } = renderHook(() => useSocketConnection());
        expect(connectSocket).toHaveBeenCalledWith('sub-123');
        
        unmount();
        expect(disconnectSocket).toHaveBeenCalled();
    });
});
