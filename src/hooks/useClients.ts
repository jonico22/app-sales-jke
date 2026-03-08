import { useQuery } from '@tanstack/react-query';
import { clientService } from '@/services/client.service';

export const CLIENTS_QUERY_KEY = ['clients', 'select'];

export function useClients() {
    return useQuery({
        queryKey: CLIENTS_QUERY_KEY,
        queryFn: async () => {
            const response = await clientService.getForSelect();
            return response.data || [];
        },
        staleTime: 1000 * 60 * 60, // 1 hour
        gcTime: 1000 * 60 * 60 * 24, // 24 hours (cache time)
    });
}
