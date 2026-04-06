import { renderHook, waitFor, act } from '@testing-library/react';
import { useCashShift } from './useCashShift';
import { useAuthStore } from '@/store/auth.store';
import { useBranchStore } from '@/store/branch.store';
import { cashShiftService } from '@/services/cash-shift.service';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('@/store/auth.store', () => ({
  useAuthStore: vi.fn(),
}));

vi.mock('@/store/branch.store', () => ({
  useBranchStore: vi.fn(),
}));

vi.mock('@/services/cash-shift.service', () => ({
  cashShiftService: {
    getCurrent: vi.fn(),
  },
}));

describe('useCashShift hook', () => {
    const mockUser = { id: 'user-1' };
    const mockBranch = { id: 'branch-1' };
    const mockShift = { id: 'shift-1', status: 'OPEN', userId: 'user-1', branchId: 'branch-1' };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize as loading and then set shift when data is found', async () => {
        (useAuthStore as any).mockReturnValue(mockUser);
        (useBranchStore as any).mockReturnValue(mockBranch);
        (cashShiftService.getCurrent as any).mockResolvedValue({ success: true, data: mockShift });

        const { result } = renderHook(() => useCashShift());

        expect(result.current.isLoading).toBe(true);
        
        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.currentShift).toEqual(mockShift);
        expect(result.current.isShiftOpen).toBe(true);
    });

    it('should set shift to null if user or branch is missing', async () => {
        (useAuthStore as any).mockReturnValue(null);
        (useBranchStore as any).mockReturnValue(mockBranch);

        const { result } = renderHook(() => useCashShift());

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.currentShift).toBe(null);
        expect(result.current.isShiftOpen).toBe(false);
    });

    it('should handle service errors', async () => {
        (useAuthStore as any).mockReturnValue(mockUser);
        (useBranchStore as any).mockReturnValue(mockBranch);
        (cashShiftService.getCurrent as any).mockRejectedValue(new Error('API Error'));

        const { result } = renderHook(() => useCashShift());

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.error).toBe('Error al consultar el estado de la caja');
        expect(result.current.currentShift).toBe(null);
    });

    it('should allow manual refresh', async () => {
        (useAuthStore as any).mockReturnValue(mockUser);
        (useBranchStore as any).mockReturnValue(mockBranch);
        (cashShiftService.getCurrent as any).mockResolvedValue({ success: true, data: null });

        const { result } = renderHook(() => useCashShift());
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        (cashShiftService.getCurrent as any).mockResolvedValue({ success: true, data: mockShift });

        await act(async () => {
            await result.current.refresh();
        });

        expect(result.current.currentShift).toEqual(mockShift);
    });
});
