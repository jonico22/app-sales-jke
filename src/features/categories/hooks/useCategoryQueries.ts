import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  categoryService, 
  type CreateCategoryRequest, 
  type UpdateCategoryRequest,
  type CategoriesResponse,
  type CategoryResponse,
  type DeleteCategoryResponse,
  type BulkUploadResponse,
  type UpdatedByUsersResponse
} from '@/services/category.service';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';

export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...categoryKeys.lists(), filters] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
  users: () => [...categoryKeys.all, 'users'] as const,
  select: () => [...categoryKeys.all, 'select'] as const,
};

export function useCategoriesQuery(params: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  createdBy?: string;
  createdAtFrom?: string | null;
  createdAtTo?: string | null;
  updatedAtFrom?: string | null;
  updatedAtTo?: string | null;
}) {
  return useQuery<CategoriesResponse>({
    queryKey: categoryKeys.list(params as unknown as Record<string, unknown>),
    queryFn: () => categoryService.getAll(params),
  });
}

export function useCreatedByUsersQuery() {
  return useQuery<UpdatedByUsersResponse>({
    queryKey: categoryKeys.users(),
    queryFn: () => categoryService.getCreatedByUsers(),
  });
}

export function useCategoriesSelectQuery() {
  return useQuery({
    queryKey: categoryKeys.select(),
    queryFn: () => categoryService.getForSelect().then(res => res.data || []),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation<CategoryResponse, Error, CreateCategoryRequest>({
    mutationFn: (data) => categoryService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      toast.success(response.message || 'Categoría creada exitosamente');
    },
    onError: (error: unknown) => {
      let errorMessage = 'Error al crear la categoría';
      if (isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      toast.error(errorMessage);
    },
  });
}

export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation<CategoryResponse, Error, { id: string; data: UpdateCategoryRequest }>({
    mutationFn: ({ id, data }) => categoryService.update(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success(response.message || 'Categoría actualizada exitosamente');
    },
    onError: (error: unknown) => {
      let errorMessage = 'Error al actualizar la categoría';
      if (isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      toast.error(errorMessage);
    },
  });
}

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation<DeleteCategoryResponse, Error, string>({
    mutationFn: (id) => categoryService.delete(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success(response.message || 'Categoría eliminada exitosamente');
    },
    onError: (error: unknown) => {
      let errorMessage = 'Error al eliminar la categoría';
      if (isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      toast.error(errorMessage);
    },
  });
}

export function useBulkUploadMutation() {
  const queryClient = useQueryClient();

  return useMutation<BulkUploadResponse, Error, File>({
    mutationFn: (file) => categoryService.bulkUpload(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}
