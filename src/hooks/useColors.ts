import { useQuery } from '@tanstack/react-query';
import { productService, type Color } from '@/services/product.service';

export const COLORS_QUERY_KEY = ['colors'];

export function useColors() {
    return useQuery<Color[], Error>({
        queryKey: COLORS_QUERY_KEY,
        queryFn: async () => {
            const res = await productService.getColors();
            if (!res.success) throw new Error(res.message);
            return res.data;
        },
        staleTime: 1000 * 60 * 60, // 1 hour
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
    });
}
