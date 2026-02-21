import { useQuery } from '@tanstack/react-query';
import { categoryService, type CategorySelectOption } from '@/services/category.service';

export const CATEGORIES_QUERY_KEY = ['categories'];

export function useCategories() {
    return useQuery<CategorySelectOption[], Error>({
        queryKey: CATEGORIES_QUERY_KEY,
        queryFn: async () => {
            const res = await categoryService.getForSelect();
            if (!res.success) throw new Error(res.message ?? 'Failed to fetch categories');
            return res.data;
        },
        staleTime: 1000 * 60 * 60, // 1 hour
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
    });
}
