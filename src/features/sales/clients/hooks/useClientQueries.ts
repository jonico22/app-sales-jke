import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  clientService, 
  type ClientsResponse, 
  type ClientResponse,
  type CreateClientRequest,
  type UpdateClientRequest,
  type DeleteClientResponse,
  type UpdatedByUsersResponse
} from '@/services/client.service';
import { toast } from 'sonner';

export const clientKeys = {
  all: ['clients'] as const,
  lists: () => [...clientKeys.all, 'list'] as const,
  list: (filters: any) => [...clientKeys.lists(), filters] as const,
  details: () => [...clientKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientKeys.details(), id] as const,
  users: () => [...clientKeys.all, 'users'] as const,
};

export function useClientsQuery(params: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  createdBy?: string;
  createdAtFrom?: string;
  createdAtTo?: string;
  updatedAtFrom?: string;
  updatedAtTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  return useQuery<ClientsResponse>({
    queryKey: clientKeys.list(params),
    queryFn: () => clientService.getAll(params),
  });
}

export function useClientDetailQuery(id: string | null) {
  return useQuery<ClientResponse>({
    queryKey: clientKeys.detail(id || ''),
    queryFn: () => clientService.getById(id!),
    enabled: !!id,
  });
}

export function useClientCreatedByUsersQuery() {
  return useQuery<UpdatedByUsersResponse>({
    queryKey: clientKeys.users(),
    queryFn: () => clientService.getCreatedByUsers(),
  });
}

export function useCreateClientMutation() {
  const queryClient = useQueryClient();

  return useMutation<ClientResponse, Error, CreateClientRequest>({
    mutationFn: (data) => clientService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
      toast.success(response.message || 'Cliente creado exitosamente');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Error al crear el cliente';
      toast.error(errorMessage);
    },
  });
}

export function useUpdateClientMutation() {
  const queryClient = useQueryClient();

  return useMutation<ClientResponse, Error, { id: string; data: UpdateClientRequest }>({
    mutationFn: ({ id, data }) => clientService.update(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
      toast.success(response.message || 'Cliente actualizado exitosamente');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Error al actualizar el cliente';
      toast.error(errorMessage);
    },
  });
}

export function useDeleteClientMutation() {
  const queryClient = useQueryClient();

  return useMutation<DeleteClientResponse, Error, string>({
    mutationFn: (id) => clientService.delete(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
      toast.success(response.message || 'Cliente eliminado exitosamente');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Error al eliminar el cliente';
      toast.error(errorMessage);
    },
  });
}
