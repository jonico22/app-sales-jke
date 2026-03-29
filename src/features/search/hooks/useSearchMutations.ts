import { useMutation, useQueryClient } from '@tanstack/react-query';
import { favoritesService, type ToggleFavoriteResponse, type FavoritesResponse } from '@/services/favorites.service';
import { orderService, type CreateOrderRequest, type OrderResponse } from '@/services/order.service';
import { searchKeys } from './useSearchQueries';
import { toast } from 'sonner';

export function useToggleFavoriteMutation() {
  const queryClient = useQueryClient();

  return useMutation<ToggleFavoriteResponse, Error, string>({
    mutationFn: (productId) => favoritesService.toggle({ productId }),
    onMutate: async (productId: string) => {
      // Cancel queries to avoid interference with optimistic update
      await queryClient.cancelQueries({ queryKey: searchKeys.favorites() });

      // Save previous state for rollback
      const previousFavorites = queryClient.getQueryData<FavoritesResponse>(searchKeys.favorites());

      // Snapshot the new state (Optimistic)
      queryClient.setQueryData(searchKeys.favorites(), (old: FavoritesResponse | undefined) => {
        if (!old || !old.data) return old;
        const exists = old.data.some((f) => (f.id || (f as any).productId) === productId);
        if (exists) {
            return { ...old, data: old.data.filter((f: any) => (f.id || f.productId) !== productId) };
        } else {
            // We don't have the full product data here, but we can at least toggle it
            // Realistically, the API will return the new full state
            return old; 
        }
      });

      return { previousFavorites };
    },
    onError: (_err, _productId, context: any) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(searchKeys.favorites(), context.previousFavorites);
      }
      toast.error('Error al actualizar favoritos');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: searchKeys.favorites() });
    },
  });
}

export function useCreateSearchOrderMutation() {
  return useMutation<OrderResponse, Error, CreateOrderRequest>({
    mutationFn: (data) => orderService.create(data),
    onError: (error: Error | any) => {
      const msg = error.response?.data?.message || 'Error al crear el pedido';
      toast.error(msg);
    },
  });
}
