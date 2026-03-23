import { useQuery } from '@tanstack/react-query';
import { notificationService } from '@/services/notification.service';

export const UNREAD_COUNT_QUERY_KEY = ['notifications', 'unread-count'];

export function useUnreadCount() {
    return useQuery({
        queryKey: UNREAD_COUNT_QUERY_KEY,
        queryFn: async () => {
            const countData: any = await notificationService.getUnreadCount();
            
            let count = 0;
            // Evaluamos agresivamente dónde puede venir el número (based on existing logic)
            if (typeof countData === 'number') count = countData;
            else if (typeof countData?.data === 'number') count = countData.data;
            else if (typeof countData?.data?.count === 'number') count = countData.data.count;
            else if (typeof countData?.count === 'number') count = countData.count;
            else if (countData?.data?.count) count = Number(countData.data.count);

            return count || 0;
        },
        staleTime: 30000, // 30 seconds
        refetchOnWindowFocus: true,
    });
}
