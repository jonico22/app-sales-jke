import { useQuery } from '@tanstack/react-query';
import { currencyService } from '@/services/currency.service';

export const CURRENCIES_QUERY_KEY = ['currencies', 'select'];

export function useCurrencies() {
    return useQuery({
        queryKey: CURRENCIES_QUERY_KEY,
        queryFn: async () => {
            const response = await currencyService.getForSelect();
            return response.data || [];
        },
        staleTime: 1000 * 60 * 60 * 24, // 24 hours
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
    });
}
