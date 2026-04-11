import api from './api.client';

export interface ExternalConsignmentSale {
    id: string;
    deliveredConsignmentId: string;
    soldQuantity: number;
    reportedSaleDate: string;
    reportedSalePrice: number;
    unitSalePrice: number;
    totalCommissionAmount: number;
    netTotal: number;
    remarks: string | null;
    documentReference: string | null;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string | null;
    updatedBy?: string | null;
}

export interface CreateExternalConsignmentSaleRequest {
    deliveredConsignmentId: string;
    soldQuantity: number;
    reportedSaleDate: string;
    reportedSalePrice: number;
    unitSalePrice: number;
    totalCommissionAmount: number;
    netTotal?: number;
    remarks?: string;
    documentReference?: string;
}

export interface UpdateExternalConsignmentSaleRequest {
    deliveredConsignmentId?: string;
    soldQuantity?: number;
    reportedSaleDate?: string;
    reportedSalePrice?: number;
    unitSalePrice?: number;
    totalCommissionAmount?: number;
    netTotal?: number;
    remarks?: string;
    documentReference?: string;
}

export interface GetExternalConsignmentSalesParams {
    deliveredConsignmentId?: string;
    reportedSaleDateFrom?: string;
    reportedSaleDateTo?: string;
    minSalePrice?: number;
    maxSalePrice?: number;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface ExternalConsignmentSaleResponse {
    success: boolean;
    message: string;
    data: ExternalConsignmentSale;
}

export interface ExternalConsignmentSalesResponse {
    success: boolean;
    message: string;
    data: {
        data: ExternalConsignmentSale[];
        pagination: Pagination;
    };
}

export interface DeleteExternalConsignmentSaleResponse {
    success: boolean;
    message: string;
}

export const externalConsignmentSaleService = {
    getAll: async (
        params?: GetExternalConsignmentSalesParams
    ): Promise<ExternalConsignmentSalesResponse> => {
        const response = await api.get<ExternalConsignmentSalesResponse>(
            '/sales/external-consignment-sales',
            { params }
        );
        return response.data;
    },

    getById: async (id: string): Promise<ExternalConsignmentSaleResponse> => {
        const response = await api.get<ExternalConsignmentSaleResponse>(
            `/sales/external-consignment-sales/${id}`
        );
        return response.data;
    },

    create: async (
        data: CreateExternalConsignmentSaleRequest
    ): Promise<ExternalConsignmentSaleResponse> => {
        const response = await api.post<ExternalConsignmentSaleResponse>(
            '/sales/external-consignment-sales',
            data
        );
        return response.data;
    },

    update: async (
        id: string,
        data: UpdateExternalConsignmentSaleRequest
    ): Promise<ExternalConsignmentSaleResponse> => {
        const response = await api.put<ExternalConsignmentSaleResponse>(
            `/sales/external-consignment-sales/${id}`,
            data
        );
        return response.data;
    },

    delete: async (id: string): Promise<DeleteExternalConsignmentSaleResponse> => {
        const response = await api.delete<DeleteExternalConsignmentSaleResponse>(
            `/sales/external-consignment-sales/${id}`
        );
        return response.data;
    },
};
