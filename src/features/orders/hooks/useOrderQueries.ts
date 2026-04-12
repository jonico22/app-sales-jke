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
import { invalidateProductRelatedCaches } from '@/features/inventory/hooks/useProductQueries';
import { invalidateDashboardQueries } from '@/hooks/dashboardQueryKeys';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  items: (id: string) => [...orderKeys.detail(id), 'items'] as const,
  users: () => [...orderKeys.all, 'users'] as const,
};

interface MutationToastOptions {
  suppressSuccessToast?: boolean;
}

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

  return useMutation<OrderResponse, AxiosError<{ message?: string }>, CreateOrderRequest>({
    mutationFn: (data) => orderService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      invalidateProductRelatedCaches(queryClient);
      invalidateDashboardQueries(queryClient);
      toast.success(response.message || 'Pedido creado exitosamente');
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Error al crear el pedido';
      toast.error(errorMessage);
    },
  });
}

export function useUpdateOrderMutation(options?: MutationToastOptions) {
  const queryClient = useQueryClient();

  return useMutation<OrderResponse, AxiosError<{ message?: string }>, { id: string; data: UpdateOrderRequest }>({
    mutationFn: ({ id, data }) => orderService.update(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      invalidateProductRelatedCaches(queryClient);
      invalidateDashboardQueries(queryClient);
      if (!options?.suppressSuccessToast) {
        toast.success(response.message || 'Pedido actualizado exitosamente');
      }
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Error al actualizar el pedido';
      toast.error(errorMessage);
    },
  });
}

export function useDeleteOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation<DeleteOrderResponse, AxiosError<{ message?: string }>, string>({
    mutationFn: (id) => orderService.delete(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      invalidateProductRelatedCaches(queryClient);
      invalidateDashboardQueries(queryClient);
      toast.success(response.message || 'Pedido eliminado exitosamente');
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Error al eliminar el pedido';
      toast.error(errorMessage);
    },
  });
}

export function useCreatePaymentMutation(options?: MutationToastOptions) {
  const queryClient = useQueryClient();

  return useMutation<OrderPaymentResponse, AxiosError<{ message?: string }>, CreateOrderPaymentRequest>({
    mutationFn: (data) => orderPaymentService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      invalidateProductRelatedCaches(queryClient);
      invalidateDashboardQueries(queryClient);
      if (!options?.suppressSuccessToast) {
        toast.success(response.message || 'Pago registrado exitosamente');
      }
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Error al registrar el pago';
      toast.error(errorMessage);
    },
  });
}
