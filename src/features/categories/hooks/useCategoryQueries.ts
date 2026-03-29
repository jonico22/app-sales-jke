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

export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (filters: any) => [...categoryKeys.lists(), filters] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
  users: () => [...categoryKeys.all, 'users'] as const,
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
    queryKey: categoryKeys.list(params),
    queryFn: () => categoryService.getAll(params),
  });
}

export function useCreatedByUsersQuery() {
  return useQuery<UpdatedByUsersResponse>({
    queryKey: categoryKeys.users(),
    queryFn: () => categoryService.getCreatedByUsers(),
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
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Error al crear la categoría';
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
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Error al actualizar la categoría';
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
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Error al eliminar la categoría';
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
