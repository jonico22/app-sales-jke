import { useQuery } from '@tanstack/react-query';
import { branchOfficeService } from '@/services/branch-office.service';

export const BRANCHES_QUERY_KEY = ['branches', 'select'];

export function useBranches() {
    return useQuery({
        queryKey: BRANCHES_QUERY_KEY,
        queryFn: async () => {
            const response = await branchOfficeService.getForSelect();
            return response.data || [];
        },
        staleTime: 1000 * 60 * 60 * 24, // 24 hours
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
    });
}
