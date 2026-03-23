import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/product.service';
import { useBranchStore } from '@/store/branch.store';

export const PRODUCTS_SELECT_QUERY_KEY = ['products', 'select'];

export interface ProductsSelectParams {
    categoryCode?: string;
    categoryId?: string;
    branchId?: string;
}

export function useProductsSelect(params?: ProductsSelectParams) {
    const selectedBranch = useBranchStore(state => state.selectedBranch);
    const effectiveBranchId = params?.branchId || selectedBranch?.id;

    return useQuery({
        queryKey: [
            ...PRODUCTS_SELECT_QUERY_KEY,
            { ...params, branchId: effectiveBranchId }
        ],
        queryFn: async () => {
            const response = await productService.getForSelect({
                ...params,
                branchId: effectiveBranchId
            });
            
            if (response.success && response.data) {
                // Return just the array of products
                return (response.data as any).data || response.data;
            }
            
            return [];
        },
        staleTime: 60000 * 5, // 5 minutes cache by default for selection items
        refetchOnWindowFocus: false,
    });
}
