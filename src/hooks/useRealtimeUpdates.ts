import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socket } from '@/services/socket';
import { DASHBOARD_STATS_QUERY_KEY } from './useDashboardStats';
import { CATEGORIES_QUERY_KEY } from './useCategories';
import { BRANDS_QUERY_KEY } from './useBrands';
import { COLORS_QUERY_KEY } from './useColors';

export function useRealtimeUpdates() {
    const queryClient = useQueryClient();

    useEffect(() => {
        const handleUpdateTable = (payload: any) => {
            console.log('🔄 [Socket] Actualización recibida:', payload);

            // By default, we always invalidate dashboard stats as they are highly aggregate
            queryClient.invalidateQueries({ queryKey: DASHBOARD_STATS_QUERY_KEY });

            // Invalidate specific queries based on payload entity/table
            const entity = payload?.table || payload?.entity || payload?.type;

            if (!entity) {
                // If no specific entity, invalidate core Master Data
                queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
                queryClient.invalidateQueries({ queryKey: BRANDS_QUERY_KEY });
                queryClient.invalidateQueries({ queryKey: COLORS_QUERY_KEY });
                return;
            }

            switch (entity) {
                case 'categories':
                    queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
                    break;
                case 'brands':
                    queryClient.invalidateQueries({ queryKey: BRANDS_QUERY_KEY });
                    break;
                case 'colors':
                    queryClient.invalidateQueries({ queryKey: COLORS_QUERY_KEY });
                    break;
                case 'products':
                    // If we have product list queries in TanStack Query, we should add them here
                    queryClient.invalidateQueries({ queryKey: ['products'] });
                    break;
                case 'orders':
                    queryClient.invalidateQueries({ queryKey: ['orders'] });
                    break;
                default:
                    // Fallback to broad invalidation for unknown entities
                    queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
            }
        };

        socket.on('UPDATE_TABLE', handleUpdateTable);

        return () => {
            socket.off('UPDATE_TABLE', handleUpdateTable);
        };
    }, [queryClient]);
}
