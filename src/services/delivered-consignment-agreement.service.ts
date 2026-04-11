import api from './api.client';

export interface DeliveredConsignmentAgreement {
    id: string;
    consignmentAgreementId: string;
    productId: string;
    branchId: string;
    deliveredStock: number;
    remainingStock: number;
    costPrice: number;
    suggestedSalePrice: number;
    taxAmount: number;
    totalCost: number;
    totalValue: number;
    deliveryDate: string;
    status: string;
    notes: string | null;
    societyId?: string;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string | null;
    updatedBy?: string | null;
    isActive?: boolean;
    isDeleted?: boolean;
}

export interface CreateDeliveredConsignmentAgreementRequest {
    consignmentAgreementId: string;
    productId: string;
    branchId: string;
    deliveredStock: number;
    remainingStock?: number;
    costPrice: number;
    suggestedSalePrice: number;
    taxAmount?: number;
    totalCost?: number;
    totalValue?: number;
    deliveryDate: string;
    status: string;
    notes?: string;
}

export interface UpdateDeliveredConsignmentAgreementRequest {
    consignmentAgreementId?: string;
    productId?: string;
    branchId?: string;
    deliveredStock?: number;
    remainingStock?: number;
    costPrice?: number;
    suggestedSalePrice?: number;
    taxAmount?: number;
    totalCost?: number;
    totalValue?: number;
    deliveryDate?: string;
    status?: string;
    notes?: string;
}

export interface GetDeliveredConsignmentAgreementsParams {
    societyId?: string;
    societyCode?: string;
    consignmentAgreementId?: string;
    productId?: string;
    branchId?: string;
    status?: string;
    deliveryDateFrom?: string;
    deliveryDateTo?: string;
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

export interface DeliveredConsignmentAgreementResponse {
    success: boolean;
    message: string;
    data: DeliveredConsignmentAgreement;
}

export interface DeliveredConsignmentAgreementsResponse {
    success: boolean;
    message: string;
    data: {
        data: DeliveredConsignmentAgreement[];
        pagination: Pagination;
    };
}

export interface DeleteDeliveredConsignmentAgreementResponse {
    success: boolean;
    message: string;
}

export const deliveredConsignmentAgreementService = {
    getAll: async (
        params?: GetDeliveredConsignmentAgreementsParams
    ): Promise<DeliveredConsignmentAgreementsResponse> => {
        const response = await api.get<DeliveredConsignmentAgreementsResponse>(
            '/sales/delivered-consignment-agreements',
            { params }
        );
        return response.data;
    },

    getById: async (id: string): Promise<DeliveredConsignmentAgreementResponse> => {
        const response = await api.get<DeliveredConsignmentAgreementResponse>(
            `/sales/delivered-consignment-agreements/${id}`
        );
        return response.data;
    },

    create: async (
        data: CreateDeliveredConsignmentAgreementRequest
    ): Promise<DeliveredConsignmentAgreementResponse> => {
        const response = await api.post<DeliveredConsignmentAgreementResponse>(
            '/sales/delivered-consignment-agreements',
            data
        );
        return response.data;
    },

    update: async (
        id: string,
        data: UpdateDeliveredConsignmentAgreementRequest
    ): Promise<DeliveredConsignmentAgreementResponse> => {
        const response = await api.put<DeliveredConsignmentAgreementResponse>(
            `/sales/delivered-consignment-agreements/${id}`,
            data
        );
        return response.data;
    },

    delete: async (id: string): Promise<DeleteDeliveredConsignmentAgreementResponse> => {
        const response = await api.delete<DeleteDeliveredConsignmentAgreementResponse>(
            `/sales/delivered-consignment-agreements/${id}`
        );
        return response.data;
    },
};
