import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { kardexService, type GetKardexParams, type CreateAdjustmentRequest } from '@/services/kardex.service';
import { branchOfficeProductService } from '@/services/branch-office-product.service';
import { productKeys } from './useProductQueries';
import { searchKeys } from '@/features/search/hooks/useSearchQueries';

export const kardexKeys = {
  all: ['kardex'] as const,
  lists: () => [...kardexKeys.all, 'list'] as const,
  list: (params: GetKardexParams) => [...kardexKeys.lists(), params] as const,
};

export function useKardexQuery(params: GetKardexParams) {
  return useQuery({
    queryKey: kardexKeys.list(params),
    queryFn: () => kardexService.getHistory(params).then(res => res.data),
    placeholderData: (previousData) => previousData,
  });
}

export function useManualAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAdjustmentRequest) => kardexService.createAdjustment(data),
    onSuccess: () => {
      toast.success('Ajuste de stock realizado correctamente');
      
      // Invalidate kardex lists
      queryClient.invalidateQueries({ queryKey: kardexKeys.all });
      
      // Invalidate product lists and details since stock changed
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      
      // Invalidate search/POS results
      queryClient.invalidateQueries({ queryKey: searchKeys.all });
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Error al realizar el ajuste de stock');
    },
  });
}

export function useBranchOfficeProductSearch(branchId: string, search: string) {
  return useQuery({
    queryKey: ['branch-office-products', 'search', branchId, search],
    queryFn: () => branchOfficeProductService.getForSelect({
      branchOfficeId: branchId,
      search,
      limit: 5
    }).then(res => res.data),
    enabled: !!branchId && search.length >= 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
