import api from './api.client';

export const OutgoingConsignmentAgreementStatus = {
    ACTIVE: 'ACTIVE',
    EXPIRED: 'EXPIRED',
    TERMINATED: 'TERMINATED',
    PENDING: 'PENDING',
} as const;

export type OutgoingConsignmentAgreementStatus =
    (typeof OutgoingConsignmentAgreementStatus)[keyof typeof OutgoingConsignmentAgreementStatus];

export interface OutgoingConsignmentAgreement {
    id: string;
    societyId: string;
    branchId: string;
    partnerId: string;
    startDate: string;
    endDate: string;
    commissionRate: number;
    currencyId: string;
    totalValue: number;
    creditLimit: number;
    agreementCode: string;
    status: OutgoingConsignmentAgreementStatus;
    notes: string | null;
    createdBy: string;
    updatedBy?: string | null;
    createdAt?: string;
    updatedAt?: string;
    isActive?: boolean;
    isDeleted?: boolean;
}

export interface CreateOutgoingConsignmentAgreementRequest {
    societyId: string;
    branchId: string;
    partnerId: string;
    startDate: string;
    endDate: string;
    commissionRate: number;
    currencyId: string;
    totalValue: number;
    creditLimit: number;
    agreementCode: string;
    status: OutgoingConsignmentAgreementStatus;
    notes?: string;
    createdBy: string;
}

export interface UpdateOutgoingConsignmentAgreementRequest {
    societyId?: string;
    branchId?: string;
    partnerId?: string;
    startDate?: string;
    endDate?: string;
    commissionRate?: number;
    currencyId?: string;
    totalValue?: number;
    creditLimit?: number;
    agreementCode?: string;
    status?: OutgoingConsignmentAgreementStatus;
    notes?: string;
    createdBy?: string;
}

export interface GetOutgoingConsignmentAgreementsParams {
    societyId?: string;
    societyCode?: string;
    branchId?: string;
    partnerId?: string;
    status?: OutgoingConsignmentAgreementStatus;
    search?: string;
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

export interface OutgoingConsignmentAgreementResponse {
    success: boolean;
    message: string;
    data: OutgoingConsignmentAgreement;
}

export interface OutgoingConsignmentAgreementsResponse {
    success: boolean;
    message: string;
    data: {
        data: OutgoingConsignmentAgreement[];
        pagination: Pagination;
    };
}

export interface DeleteOutgoingConsignmentAgreementResponse {
    success: boolean;
    message: string;
}

export const outgoingConsignmentAgreementService = {
    getAll: async (
        params?: GetOutgoingConsignmentAgreementsParams
    ): Promise<OutgoingConsignmentAgreementsResponse> => {
        const response = await api.get<OutgoingConsignmentAgreementsResponse>(
            '/sales/outgoing-consignment-agreements',
            { params }
        );
        return response.data;
    },

    getById: async (id: string): Promise<OutgoingConsignmentAgreementResponse> => {
        const response = await api.get<OutgoingConsignmentAgreementResponse>(
            `/sales/outgoing-consignment-agreements/${id}`
        );
        return response.data;
    },

    create: async (
        data: CreateOutgoingConsignmentAgreementRequest
    ): Promise<OutgoingConsignmentAgreementResponse> => {
        const response = await api.post<OutgoingConsignmentAgreementResponse>(
            '/sales/outgoing-consignment-agreements',
            data
        );
        return response.data;
    },

    update: async (
        id: string,
        data: UpdateOutgoingConsignmentAgreementRequest
    ): Promise<OutgoingConsignmentAgreementResponse> => {
        const response = await api.put<OutgoingConsignmentAgreementResponse>(
            `/sales/outgoing-consignment-agreements/${id}`,
            data
        );
        return response.data;
    },

    delete: async (id: string): Promise<DeleteOutgoingConsignmentAgreementResponse> => {
        const response = await api.delete<DeleteOutgoingConsignmentAgreementResponse>(
            `/sales/outgoing-consignment-agreements/${id}`
        );
        return response.data;
    },
};
