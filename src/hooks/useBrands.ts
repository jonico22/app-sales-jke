import { useQuery } from '@tanstack/react-query';
import { productService, type Brand } from '@/services/product.service';

export const BRANDS_QUERY_KEY = ['brands'];

export function useBrands() {
    return useQuery<Brand[], Error>({
        queryKey: BRANDS_QUERY_KEY,
        queryFn: async () => {
            const res = await productService.getBrands();
            if (!res.success) throw new Error(res.message ?? 'Failed to fetch brands');
            return res.data;
        },
        staleTime: 1000 * 60 * 60, // 1 hour
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
    });
}
