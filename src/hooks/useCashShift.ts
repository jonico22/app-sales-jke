import { useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useBranchStore } from '@/store/branch.store';
import { useCurrentCashShiftQuery } from '@/features/sales/hooks/useCashShiftQueries';

export function useCashShift() {
    const user = useAuthStore(state => state.user);
    const selectedBranch = useBranchStore(state => state.selectedBranch);
    const userId = user?.id || '';
    const branchId = selectedBranch?.id || '';
    const isEnabled = !!userId && !!branchId;

    const shiftQuery = useCurrentCashShiftQuery(branchId, userId);
    const currentShift = shiftQuery.data?.success ? shiftQuery.data.data : null;

    const checkShiftStatus = useCallback(async () => {
        if (!isEnabled) {
            return null;
        }

        const result = await shiftQuery.refetch();
        return result.data?.success ? result.data.data : null;
    }, [isEnabled, shiftQuery]);

    return {
        currentShift,
        isShiftOpen: !!currentShift && currentShift.status === 'OPEN',
        isLoading: isEnabled ? shiftQuery.isLoading : false,
        error: shiftQuery.error ? 'Error al consultar el estado de la caja' : null,
        refresh: checkShiftStatus
    };
}
