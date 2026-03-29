import { useQuery } from '@tanstack/react-query';
import { notificationService, type NotificationType, type NotificationsResponse } from '@/services/notification.service';

export const NOTIFICATIONS_QUERY_KEY = ['notifications', 'list'];

export interface NotificationsParams {
    page?: number;
    limit?: number;
    read?: boolean;
    type?: NotificationType | 'all';
    search?: string;
    startDate?: string;
    endDate?: string;
}

export function useNotificationsQuery(params: NotificationsParams = {}) {
    return useQuery<NotificationsResponse>({
        queryKey: [...NOTIFICATIONS_QUERY_KEY, params],
        queryFn: () => notificationService.getAll(params),
        staleTime: 60000, // 1 minute
        refetchOnWindowFocus: true,
    });
}
