import { useQuery, useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { branchMovementService, type GetAllBranchMovementsParams, type UpdateBranchMovementStatusRequest } from '@/services/branch-movement.service';
import { productKeys } from './useProductQueries';
import { searchKeys } from '@/features/search/hooks/useSearchQueries';
import type { AxiosError } from 'axios';

export const movementKeys = {
  all: ['inventory-movements'] as const,
  lists: () => [...movementKeys.all, 'list'] as const,
  list: (params: GetAllBranchMovementsParams) => [...movementKeys.lists(), params] as const,
  details: () => [...movementKeys.all, 'detail'] as const,
  detail: (id: string) => [...movementKeys.details(), id] as const,
};

export function useMovementsQuery(params: GetAllBranchMovementsParams) {
  return useQuery({
    queryKey: movementKeys.list(params),
    queryFn: () => branchMovementService.getAll(params).then(res => res.data),
    placeholderData: (previousData) => previousData,
  });
}

export function useUpdateMovementStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBranchMovementStatusRequest }) => 
      branchMovementService.updateStatus(id, data),
    onSuccess: () => {
      invalidateMovementRelatedCaches(queryClient);
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al actualizar el estado del movimiento');
    },
  });
}

export function useDeleteMovement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => branchMovementService.delete(id),
    onSuccess: () => {
      toast.success('Movimiento eliminado exitosamente');
      invalidateMovementRelatedCaches(queryClient);
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al eliminar el movimiento');
    },
  });
}

/**
 * Utility to invalidate caches after movement updates
 */
function invalidateMovementRelatedCaches(queryClient: QueryClient) {
  // Invalidate movement lists
  queryClient.invalidateQueries({ queryKey: movementKeys.lists() });
  
  // Invalidate product inventory lists (since stock changes)
  queryClient.invalidateQueries({ queryKey: productKeys.lists() });
  
  // Invalidate search/POS results
  queryClient.invalidateQueries({ queryKey: searchKeys.all });
}
