import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useBranchStore } from '@/store/branch.store';
import { cashShiftService, type CashShift } from '@/services/cash-shift.service';

export function useCashShift() {
    const user = useAuthStore(state => state.user);
    const selectedBranch = useBranchStore(state => state.selectedBranch);
    
    const [currentShift, setCurrentShift] = useState<CashShift | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const checkShiftStatus = useCallback(async () => {
        if (!user?.id || !selectedBranch?.id) {
            setCurrentShift(null);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const response = await cashShiftService.getCurrent({
                userId: user.id,
                branchId: selectedBranch.id
            });

            if (response.success && response.data) {
                setCurrentShift(response.data);
            } else {
                setCurrentShift(null);
            }
        } catch (err) {
            console.error('[useCashShift] Error checking shift status:', err);
            setError('Error al consultar el estado de la caja');
            setCurrentShift(null);
        } finally {
            setIsLoading(false);
        }
    }, [user?.id, selectedBranch?.id]);

    useEffect(() => {
        checkShiftStatus();
    }, [checkShiftStatus]);

    return {
        currentShift,
        isShiftOpen: !!currentShift && currentShift.status === 'OPEN',
        isLoading,
        error,
        refresh: checkShiftStatus
    };
}
