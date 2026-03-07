import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';

export const PERMISSIONS_QUERY_KEY = ['permissions'];

export function usePermissions() {
    return useQuery({
        queryKey: PERMISSIONS_QUERY_KEY,
        queryFn: async () => {
            const res = await authService.getPermissions();
            if (!res.success) throw new Error(res.message ?? 'Failed to fetch permissions');
            return res.data;
        },
        staleTime: 1000 * 60 * 60, // 1 hour
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
        retry: 1, // Only retry once since it relates to auth
    });
}
