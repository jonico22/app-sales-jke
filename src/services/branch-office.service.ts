import api from './api.client';

export interface BranchOffice {
    id: string;
    code: string;
    name: string;
    description: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    societyId: string;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string | null;
}

export interface CreateBranchOfficeRequest {
    name: string;
    code: string;
    description?: string;
    address?: string;
    phone?: string;
    email?: string;
    societyId: string;
    isActive?: boolean;
}

export interface UpdateBranchOfficeRequest {
    name?: string;
    description?: string;
    address?: string;
    phone?: string;
    email?: string;
    isActive?: boolean;
}

export interface BranchOfficeResponse {
    success: boolean;
    message: string;
    data: BranchOffice;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface BranchOfficesResponse {
    success: boolean;
    message: string;
    data: {
        data: BranchOffice[];
        pagination: Pagination;
    };
}

export interface BranchOfficeSelectOption {
    id: string;
    name: string;
    code: string;
}

export interface BranchOfficesSelectResponse {
    success: boolean;
    message: string;
    data: BranchOfficeSelectOption[];
}

export interface DeleteBranchOfficeResponse {
    success: boolean;
    message: string;
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

export const branchOfficeService = {
    // Get all branch offices
    getAll: async (params?: {
        page?: number;
        limit?: number;
        search?: string;
        isActive?: boolean;
        societyId?: string;
        createdBy?: string;
        createdAtFrom?: string;
        createdAtTo?: string;
        updatedAtFrom?: string;
        updatedAtTo?: string;
    }): Promise<BranchOfficesResponse> => {
        const response = await api.get<BranchOfficesResponse>('/sales/branch-offices', { params });
        return response.data;
    },

    // Get branch offices for select dropdowns
    getForSelect: async (): Promise<BranchOfficesSelectResponse> => {
        const response = await api.get<BranchOfficesSelectResponse>('/sales/branch-offices/select');
        return response.data;
    },

    // Get branch office by ID
    getById: async (id: string): Promise<BranchOfficeResponse> => {
        const response = await api.get<BranchOfficeResponse>(`/sales/branch-offices/${id}`);
        return response.data;
    },

    // Create new branch office
    create: async (data: CreateBranchOfficeRequest): Promise<BranchOfficeResponse> => {
        const response = await api.post<BranchOfficeResponse>('/sales/branch-offices', data);
        return response.data;
    },

    // Update branch office
    update: async (id: string, data: UpdateBranchOfficeRequest): Promise<BranchOfficeResponse> => {
        const response = await api.put<BranchOfficeResponse>(`/sales/branch-offices/${id}`, data);
        return response.data;
    },

    // Delete branch office
    delete: async (id: string): Promise<DeleteBranchOfficeResponse> => {
        const response = await api.delete<DeleteBranchOfficeResponse>(`/sales/branch-offices/${id}`);
        return response.data;
    },

    // Get users who created branch offices
    getCreatedByUsers: async (): Promise<UpdatedByUsersResponse> => {
        const response = await api.get<UpdatedByUsersResponse>('/sales/branch-offices/created-by-users');
        return response.data;
    },
};
