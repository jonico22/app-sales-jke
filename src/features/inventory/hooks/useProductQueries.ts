import { useQuery, useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { productService, type CreateProductRequest, type UpdateProductRequest } from '@/services/product.service';
import { PRODUCTS_SELECT_QUERY_KEY } from '@/hooks/useProductsSelect';
import { searchKeys } from '@/features/search/hooks/useSearchQueries';

export const productKeys = {
  all: ['products-inventory'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

export function useProducts(filters: Record<string, unknown>) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => productService.getAll(filters).then(res => res.data),
    placeholderData: (previousData) => previousData,
  });
}

export function useProduct(id: string | null) {
  return useQuery({
    queryKey: productKeys.detail(id || ''),
    queryFn: () => productService.getById(id!).then(res => res.data),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductRequest) => productService.create(data),
    onSuccess: () => {
      toast.success('Producto creado exitosamente');
      invalidateProductRelatedCaches(queryClient);
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Error al crear el producto');
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductRequest }) => productService.update(id, data),
    onSuccess: (_, { id }) => {
      toast.success('Producto actualizado exitosamente');
      queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
      invalidateProductRelatedCaches(queryClient);
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Error al actualizar el producto');
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productService.delete(id),
    onSuccess: () => {
      toast.success('Producto eliminado exitosamente');
      invalidateProductRelatedCaches(queryClient);
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Error al eliminar el producto');
    },
  });
}

export function useBulkUploadProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => productService.bulkUpload(file),
    onSuccess: () => {
      invalidateProductRelatedCaches(queryClient);
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Error al procesar la carga masiva');
    },
  });
}

/**
 * Utility to invalidate all caches that depend on product data
 */
function invalidateProductRelatedCaches(queryClient: QueryClient) {
  // Invalidate product inventory lists
  queryClient.invalidateQueries({ queryKey: productKeys.lists() });
  
  // Invalidate product selection cache (used in selectors across the app)
  queryClient.invalidateQueries({ queryKey: PRODUCTS_SELECT_QUERY_KEY });
  
  // Invalidate product search/POS infinite results
  queryClient.invalidateQueries({ queryKey: searchKeys.all });
}
