import { useMutation, useQueryClient } from '@tanstack/react-query';
import { favoritesService, type ToggleFavoriteResponse, type FavoritesResponse, type Favorite } from '@/services/favorites.service';
import { orderService, type CreateOrderRequest, type OrderResponse } from '@/services/order.service';
import { searchKeys } from './useSearchQueries';
import { orderKeys } from '@/features/orders/hooks/useOrderQueries';
import { PRODUCTS_SELECT_QUERY_KEY } from '@/hooks/useProductsSelect';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';

interface ToggleFavoriteContext {
  previousFavorites?: FavoritesResponse;
}

export function useToggleFavoriteMutation() {
  const queryClient = useQueryClient();

  return useMutation<ToggleFavoriteResponse, Error, string, ToggleFavoriteContext>({
    mutationFn: (productId) => favoritesService.toggle({ productId }),
    onMutate: async (productId: string) => {
      // Cancel queries to avoid interference with optimistic update
      await queryClient.cancelQueries({ queryKey: searchKeys.favorites() });

      // Save previous state for rollback
      const previousFavorites = queryClient.getQueryData<FavoritesResponse>(searchKeys.favorites());

      // Snapshot the new state (Optimistic)
      queryClient.setQueryData(searchKeys.favorites(), (old: FavoritesResponse | undefined) => {
        if (!old || !old.data) return old;
        const exists = old.data.some((f: Favorite) => (f.id || (f as unknown as { productId?: string }).productId) === productId);
        if (exists) {
            return { ...old, data: old.data.filter((f: Favorite) => (f.id || (f as unknown as { productId?: string }).productId) !== productId) };
        } else {
            // We don't have the full product data here, but we can at least toggle it
            // Realistically, the API will return the new full state
            return old; 
        }
      });

      return { previousFavorites };
    },
    onError: (_err, _productId, context) => {
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
  const queryClient = useQueryClient();

  return useMutation<OrderResponse, AxiosError<{ message?: string }>, CreateOrderRequest>({
    mutationFn: (data) => orderService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: searchKeys.all });
      queryClient.invalidateQueries({ queryKey: PRODUCTS_SELECT_QUERY_KEY });
      toast.success(response.message || 'Pedido creado exitosamente');
    },
    onError: (error) => {
      const msg = error.response?.data?.message || 'Error al crear el pedido';
      toast.error(msg);
    },
  });
}
