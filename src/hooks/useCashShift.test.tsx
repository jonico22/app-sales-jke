import { renderHook, waitFor, act } from '@testing-library/react';
import { useCashShift } from './useCashShift';
import { useAuthStore } from '@/store/auth.store';
import { useBranchStore } from '@/store/branch.store';
import { useCurrentCashShiftQuery } from '@/features/sales/hooks/useCashShiftQueries';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('@/store/auth.store', () => ({
  useAuthStore: vi.fn(),
}));

vi.mock('@/store/branch.store', () => ({
  useBranchStore: vi.fn(),
}));

vi.mock('@/features/sales/hooks/useCashShiftQueries', () => ({
  useCurrentCashShiftQuery: vi.fn(),
}));

describe('useCashShift hook', () => {
    const mockUser = { id: 'user-1' };
    const mockBranch = { id: 'branch-1' };
    const mockShift = { id: 'shift-1', status: 'OPEN', userId: 'user-1', branchId: 'branch-1' };
    const mockRefetch = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        mockRefetch.mockReset();
    });

    it('should return the current shift when query data is found', async () => {
        (useAuthStore as any).mockReturnValue(mockUser);
        (useBranchStore as any).mockReturnValue(mockBranch);
        (useCurrentCashShiftQuery as any).mockReturnValue({
            data: { success: true, data: mockShift },
            isLoading: false,
            error: null,
            refetch: mockRefetch,
        });

        const { result } = renderHook(() => useCashShift());

        expect(result.current.currentShift).toEqual(mockShift);
        expect(result.current.isShiftOpen).toBe(true);
        expect(result.current.isLoading).toBe(false);
    });

    it('should set shift to null if user or branch is missing', async () => {
        (useAuthStore as any).mockReturnValue(null);
        (useBranchStore as any).mockReturnValue(mockBranch);
        (useCurrentCashShiftQuery as any).mockReturnValue({
            data: undefined,
            isLoading: false,
            error: null,
            refetch: mockRefetch,
        });

        const { result } = renderHook(() => useCashShift());

        expect(result.current.currentShift).toBe(null);
        expect(result.current.isShiftOpen).toBe(false);
        expect(result.current.isLoading).toBe(false);
    });

    it('should handle service errors', async () => {
        (useAuthStore as any).mockReturnValue(mockUser);
        (useBranchStore as any).mockReturnValue(mockBranch);
        (useCurrentCashShiftQuery as any).mockReturnValue({
            data: undefined,
            isLoading: false,
            error: new Error('API Error'),
            refetch: mockRefetch,
        });

        const { result } = renderHook(() => useCashShift());

        expect(result.current.error).toBe('Error al consultar el estado de la caja');
        expect(result.current.currentShift).toBe(null);
    });

    it('should allow manual refresh', async () => {
        (useAuthStore as any).mockReturnValue(mockUser);
        (useBranchStore as any).mockReturnValue(mockBranch);
        mockRefetch.mockResolvedValue({ data: { success: true, data: mockShift } });
        (useCurrentCashShiftQuery as any).mockReturnValue({
            data: { success: true, data: null },
            isLoading: false,
            error: null,
            refetch: mockRefetch,
        });

        const { result } = renderHook(() => useCashShift());

        await act(async () => {
            await result.current.refresh();
        });

        expect(mockRefetch).toHaveBeenCalledTimes(1);
    });

    it('should expose loading state while query is loading', async () => {
        (useAuthStore as any).mockReturnValue(mockUser);
        (useBranchStore as any).mockReturnValue(mockBranch);
        (useCurrentCashShiftQuery as any).mockReturnValue({
            data: undefined,
            isLoading: true,
            error: null,
            refetch: mockRefetch,
        });

        const { result } = renderHook(() => useCashShift());

        await waitFor(() => expect(result.current.isLoading).toBe(true));
    });
});
