import { useQuery, useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';
import { branchOfficeService, type CreateBranchOfficeRequest, type UpdateBranchOfficeRequest } from '@/services/branch-office.service';
import { BRANCHES_QUERY_KEY } from '@/hooks/useBranches';
import { PRODUCTS_SELECT_QUERY_KEY } from '@/hooks/useProductsSelect';
import { searchKeys } from '@/features/search/hooks/useSearchQueries';

export const branchOfficeKeys = {
  all: ['branch-offices'] as const,
  lists: () => [...branchOfficeKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...branchOfficeKeys.lists(), filters] as const,
  details: () => [...branchOfficeKeys.all, 'detail'] as const,
  detail: (id: string) => [...branchOfficeKeys.details(), id] as const,
  select: () => [...branchOfficeKeys.all, 'select'] as const,
};

export function useBranchOffices(filters: Record<string, unknown>) {
  return useQuery({
    queryKey: branchOfficeKeys.list(filters),
    queryFn: () => branchOfficeService.getAll(filters).then(res => res.data),
    placeholderData: (previousData) => previousData,
  });
}

export function useBranchOffice(id: string | null) {
  return useQuery({
    queryKey: branchOfficeKeys.detail(id || ''),
    queryFn: () => branchOfficeService.getById(id!).then(res => res.data),
    enabled: !!id,
  });
}

export function useBranchOfficesSelect() {
  return useQuery({
    queryKey: branchOfficeKeys.select(),
    queryFn: () => branchOfficeService.getForSelect().then(res => res.data),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useCreateBranchOffice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBranchOfficeRequest) => branchOfficeService.create(data),
    onSuccess: () => {
      toast.success('Sucursal creada exitosamente');
      invalidateBranchRelatedCaches(queryClient);
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Error al crear la sucursal');
    },
  });
}

export function useUpdateBranchOffice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBranchOfficeRequest }) => branchOfficeService.update(id, data),
    onSuccess: (_, { id }) => {
      toast.success('Sucursal actualizada exitosamente');
      queryClient.invalidateQueries({ queryKey: branchOfficeKeys.detail(id) });
      invalidateBranchRelatedCaches(queryClient);
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Error al actualizar la sucursal');
    },
  });
}

export function useDeleteBranchOffice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => branchOfficeService.delete(id),
    onSuccess: () => {
      toast.success('Sucursal eliminada exitosamente');
      invalidateBranchRelatedCaches(queryClient);
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al eliminar la sucursal');
    },
  });
}

/**
 * Utility to invalidate all caches that depend on branch office data
 */
function invalidateBranchRelatedCaches(queryClient: QueryClient) {
  // Invalidate branch office lists
  queryClient.invalidateQueries({ queryKey: branchOfficeKeys.lists() });
  
  // Invalidate branch selection cache (used in selectors across the app)
  queryClient.invalidateQueries({ queryKey: BRANCHES_QUERY_KEY });
  
  // Invalidate product lists (Search/POS)
  queryClient.invalidateQueries({ queryKey: searchKeys.all });
  
  // Invalidate product selection cache
  queryClient.invalidateQueries({ queryKey: PRODUCTS_SELECT_QUERY_KEY });
}
