import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  cashShiftService, 
  type CashShiftsResponse, 
  type CashShiftDetailResponse,
  type CashShiftResponse,
  type GetAllCashShiftsParams,
  type CloseCashShiftRequest,
  type AddManualMovementRequest,
  type CashShiftUsersResponse,
  type OpenCashShiftRequest
} from '@/services/cash-shift.service';
import { toast } from 'sonner';

export const cashShiftKeys = {
  all: ['cash-shifts'] as const,
  lists: () => [...cashShiftKeys.all, 'list'] as const,
  list: (filters: any) => [...cashShiftKeys.lists(), filters] as const,
  details: () => [...cashShiftKeys.all, 'detail'] as const,
  detail: (id: string) => [...cashShiftKeys.details(), id] as const,
  users: () => [...cashShiftKeys.all, 'users'] as const,
  current: (branchId: string, userId: string) => [...cashShiftKeys.all, 'current', branchId, userId] as const,
};

export function useCashShiftsQuery(params: GetAllCashShiftsParams) {
  return useQuery<CashShiftsResponse>({
    queryKey: cashShiftKeys.list(params),
    queryFn: () => cashShiftService.getAll(params),
  });
}

export function useCashShiftDetailQuery(id: string | null) {
  return useQuery<CashShiftDetailResponse>({
    queryKey: cashShiftKeys.detail(id || ''),
    queryFn: () => cashShiftService.getById(id!),
    enabled: !!id,
  });
}

export function useCashShiftUsersQuery() {
  return useQuery<CashShiftUsersResponse>({
    queryKey: cashShiftKeys.users(),
    queryFn: () => cashShiftService.getCreatedByUsers(),
  });
}

export function useCurrentCashShiftQuery(branchId: string, userId: string) {
  return useQuery<CashShiftResponse>({
    queryKey: cashShiftKeys.current(branchId, userId),
    queryFn: () => cashShiftService.getCurrent({ branchId, userId }),
    enabled: !!branchId && !!userId,
  });
}

export function useOpenCashShiftMutation() {
  const queryClient = useQueryClient();

  return useMutation<CashShiftResponse, Error, OpenCashShiftRequest>({
    mutationFn: (data) => cashShiftService.open(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: cashShiftKeys.all });
      toast.success(response.message || 'Turno de caja abierto exitosamente');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Error al abrir la caja';
      toast.error(errorMessage);
    },
  });
}

export function useCloseCashShiftMutation() {
  const queryClient = useQueryClient();

  return useMutation<CashShiftResponse, Error, { id: string; data: CloseCashShiftRequest }>({
    mutationFn: ({ id, data }) => cashShiftService.close(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: cashShiftKeys.all });
      toast.success(response.message || 'Caja cerrada exitosamente');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Error al cerrar la caja';
      toast.error(errorMessage);
    },
  });
}

export function useAddMovementMutation() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; message: string }, Error, AddManualMovementRequest>({
    mutationFn: (data) => cashShiftService.addMovement(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: cashShiftKeys.all });
      toast.success(response.message || 'Movimiento agregado exitosamente');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Error al agregar movimiento';
      toast.error(errorMessage);
    },
  });
}
