import api from './api.client';

export interface Client {
    id: string;
    name: string;
    documentNumber: string;
    documentType: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string | null;
}

export interface CreateClientRequest {
    name: string;
    documentNumber: string;
    documentType?: string;
    email?: string;
    phone?: string;
    address?: string;
    isActive?: boolean;
}

export interface UpdateClientRequest {
    name?: string;
    documentNumber?: string;
    documentType?: string;
    email?: string;
    phone?: string;
    address?: string;
    isActive?: boolean;
}

export interface ClientResponse {
    success: boolean;
    message: string;
    data: Client;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface ClientsResponse {
    success: boolean;
    message: string;
    data: {
        data: Client[];
        pagination: Pagination;
    };
}

export interface DeleteClientResponse {
    success: boolean;
    message: string;
}

export interface ClientSelectOption {
    id: string;
    name: string;
    documentNumber: string;
}

export interface ClientsSelectResponse {
    success: boolean;
    message: string;
    data: ClientSelectOption[];
}

export interface UserSelectOption {
    id: string;
    name: string;
}

export interface UpdatedByUsersResponse {
    success: boolean;
    message: string;
    data: UserSelectOption[];
}

export const clientService = {
    // Get all clients
    getAll: async (params?: {
        page?: number;
        limit?: number;
        search?: string;
        isActive?: boolean;
        createdBy?: string;
        createdAtFrom?: string;
        createdAtTo?: string;
        updatedAtFrom?: string;
        updatedAtTo?: string;
    }): Promise<ClientsResponse> => {
        const response = await api.get<ClientsResponse>('/sales/clients', { params });
        return response.data;
    },

    // Get categories for select dropdowns (lightweight)
    getForSelect: async (): Promise<ClientsSelectResponse> => {
        const response = await api.get<ClientsSelectResponse>('/sales/clients/select');
        return response.data;
    },

    // Get client by ID
    getById: async (id: string): Promise<ClientResponse> => {
        const response = await api.get<ClientResponse>(`/sales/clients/${id}`);
        return response.data;
    },

    // Create new client
    create: async (data: CreateClientRequest): Promise<ClientResponse> => {
        const response = await api.post<ClientResponse>('/sales/clients', data);
        return response.data;
    },

    // Update client
    update: async (id: string, data: UpdateClientRequest): Promise<ClientResponse> => {
        const response = await api.put<ClientResponse>(`/sales/clients/${id}`, data);
        return response.data;
    },

    // Delete client
    delete: async (id: string): Promise<DeleteClientResponse> => {
        const response = await api.delete<DeleteClientResponse>(`/sales/clients/${id}`);
        return response.data;
    },

    // Get users who created clients
    getCreatedByUsers: async (): Promise<UpdatedByUsersResponse> => {
        const response = await api.get<UpdatedByUsersResponse>('/sales/clients/created-by-users');
        return response.data;
    },
};
