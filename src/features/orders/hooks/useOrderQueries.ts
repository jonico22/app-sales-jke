import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  orderService, 
  type OrdersResponse, 
  type OrderResponse,
  type CreateOrderRequest,
  type UpdateOrderRequest,
  type DeleteOrderResponse,
  type UpdatedByUsersResponse,
  type OrderStatus
} from '@/services/order.service';
import { orderItemService, type OrderItemsResponse } from '@/services/order-item.service';
import { orderPaymentService, type CreateOrderPaymentRequest, type OrderPaymentResponse } from '@/services/order-payment.service';
import { searchKeys } from '@/features/search/hooks/useSearchQueries';
import { PRODUCTS_SELECT_QUERY_KEY } from '@/hooks/useProductsSelect';
import { toast } from 'sonner';

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters: any) => [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  items: (id: string) => [...orderKeys.detail(id), 'items'] as const,
  users: () => [...orderKeys.all, 'users'] as const,
};

export function useOrdersQuery(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: OrderStatus;
  dateFrom?: string;
  dateTo?: string;
  createdBy?: string;
  createdAtFrom?: string;
  createdAtTo?: string;
  updatedAtFrom?: string;
  updatedAtTo?: string;
  include?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  return useQuery<OrdersResponse>({
    queryKey: orderKeys.list(params),
    queryFn: () => orderService.getAll(params),
  });
}

export function useOrderDetailsQuery(id: string | null) {
  return useQuery<OrderResponse>({
    queryKey: orderKeys.detail(id || ''),
    queryFn: () => orderService.getById(id!),
    enabled: !!id,
  });
}

export function useOrderItemsQuery(orderId: string | null) {
  return useQuery<OrderItemsResponse>({
    queryKey: orderKeys.items(orderId || ''),
    queryFn: () => orderItemService.getAll({ orderId: orderId! }),
    enabled: !!orderId,
  });
}

export function useOrderCreatedByUsersQuery() {
  return useQuery<UpdatedByUsersResponse>({
    queryKey: orderKeys.users(),
    queryFn: () => orderService.getCreatedByUsers(),
  });
}

export function useCreateOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation<OrderResponse, Error, CreateOrderRequest>({
    mutationFn: (data) => orderService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: searchKeys.all });
      queryClient.invalidateQueries({ queryKey: PRODUCTS_SELECT_QUERY_KEY });
      toast.success(response.message || 'Pedido creado exitosamente');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Error al crear el pedido';
      toast.error(errorMessage);
    },
  });
}

export function useUpdateOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation<OrderResponse, Error, { id: string; data: UpdateOrderRequest }>({
    mutationFn: ({ id, data }) => orderService.update(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      // Also invalidate search/products if the order status changed (likely affects stock)
      queryClient.invalidateQueries({ queryKey: searchKeys.all });
      queryClient.invalidateQueries({ queryKey: PRODUCTS_SELECT_QUERY_KEY });
      toast.success(response.message || 'Pedido actualizado exitosamente');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Error al actualizar el pedido';
      toast.error(errorMessage);
    },
  });
}

export function useDeleteOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation<DeleteOrderResponse, Error, string>({
    mutationFn: (id) => orderService.delete(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: searchKeys.all });
      queryClient.invalidateQueries({ queryKey: PRODUCTS_SELECT_QUERY_KEY });
      toast.success(response.message || 'Pedido eliminado exitosamente');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Error al eliminar el pedido';
      toast.error(errorMessage);
    },
  });
}

export function useCreatePaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation<OrderPaymentResponse, Error, CreateOrderPaymentRequest>({
    mutationFn: (data) => orderPaymentService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: searchKeys.all });
      queryClient.invalidateQueries({ queryKey: PRODUCTS_SELECT_QUERY_KEY });
      toast.success(response.message || 'Pago registrado exitosamente');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Error al registrar el pago';
      toast.error(errorMessage);
    },
  });
}
