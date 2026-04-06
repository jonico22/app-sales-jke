import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { branchOfficeProductService } from '@/services/branch-office-product.service';
import { branchMovementService, type BulkBranchMovementRequest, type TransferAllRequest } from '@/services/branch-movement.service';
import { productKeys } from './useProductQueries';
import { searchKeys } from '@/features/search/hooks/useSearchQueries';
import type { QueryClient } from '@tanstack/react-query';

export const transferKeys = {
  all: ['transfers'] as const,
  branchProducts: (branchId: string, filters: Record<string, unknown>) => [...transferKeys.all, 'products', branchId, filters] as const,
};

export function useBranchProductsQuery(branchId: string, filters: Record<string, unknown>) {
  return useQuery({
    queryKey: transferKeys.branchProducts(branchId, filters),
    queryFn: () => branchOfficeProductService.getForSelect({
      branchOfficeId: branchId,
      ...filters
    }).then(res => res.data),
    enabled: !!branchId,
  });
}

export function useCreateBulkTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkBranchMovementRequest) => branchMovementService.createBulk(data),
    onSuccess: () => {
      toast.success('Traslado en bloque iniciado correctamente');
      invalidateInventoryCaches(queryClient);
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Error al procesar el traslado');
    },
  });
}

export function useCreateTotalTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TransferAllRequest) => branchMovementService.transferAll(data),
    onSuccess: () => {
      toast.success('Traslado total iniciado correctamente');
      invalidateInventoryCaches(queryClient);
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Error al procesar el traslado');
    },
  });
}

function invalidateInventoryCaches(queryClient: QueryClient) {
  // Invalidate all inventory list queries
  queryClient.invalidateQueries({ queryKey: productKeys.lists() });
  
  // Invalidate search and POS infinite results
  queryClient.invalidateQueries({ queryKey: searchKeys.all });
  
  // Invalidate specifically the branch products lists used in transfers
  queryClient.invalidateQueries({ queryKey: [...transferKeys.all, 'products'] });
}
