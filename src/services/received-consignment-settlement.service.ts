import api from './api.client';

export const ReceivedConsignmentSettlementStatus = {
    PENDING: 'PENDING',
    PAID: 'PAID',
} as const;

export type ReceivedConsignmentSettlementStatus =
    (typeof ReceivedConsignmentSettlementStatus)[keyof typeof ReceivedConsignmentSettlementStatus];

export interface ReceivedConsignmentSettlement {
    id: string;
    outgoingAgreementId: string;
    orderPaymentId?: string | null;
    settlementDate: string;
    totalReportedSalesAmount: number;
    consigneeCommissionAmount: number;
    totalReceivedAmount: number;
    status: ReceivedConsignmentSettlementStatus;
    receiptReference: string | null;
    settlementNotes: string | null;
    currencyId: string;
    createdBy: string;
    societyId?: string;
    createdAt?: string;
    updatedAt?: string;
    updatedBy?: string | null;
}

export interface CreateReceivedConsignmentSettlementRequest {
    outgoingAgreementId: string;
    orderPaymentId?: string;
    settlementDate: string;
    totalReportedSalesAmount: number;
    consigneeCommissionAmount: number;
    totalReceivedAmount: number;
    status: ReceivedConsignmentSettlementStatus;
    receiptReference?: string;
    settlementNotes?: string;
    currencyId: string;
    createdBy?: string;
}

export interface UpdateReceivedConsignmentSettlementRequest {
    outgoingAgreementId?: string;
    orderPaymentId?: string;
    settlementDate?: string;
    totalReportedSalesAmount?: number;
    consigneeCommissionAmount?: number;
    totalReceivedAmount?: number;
    status?: ReceivedConsignmentSettlementStatus;
    receiptReference?: string;
    settlementNotes?: string;
    currencyId?: string;
    createdBy?: string;
}

export interface GetReceivedConsignmentSettlementsParams {
    societyId?: string;
    societyCode?: string;
    outgoingAgreementId?: string;
    status?: ReceivedConsignmentSettlementStatus;
    settlementDateFrom?: string;
    settlementDateTo?: string;
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

export interface ReceivedConsignmentSettlementResponse {
    success: boolean;
    message: string;
    data: ReceivedConsignmentSettlement;
}

export interface ReceivedConsignmentSettlementsResponse {
    success: boolean;
    message: string;
    data: {
        data: ReceivedConsignmentSettlement[];
        pagination: Pagination;
    };
}

export interface DeleteReceivedConsignmentSettlementResponse {
    success: boolean;
    message: string;
}

export const receivedConsignmentSettlementService = {
    getAll: async (
        params?: GetReceivedConsignmentSettlementsParams
    ): Promise<ReceivedConsignmentSettlementsResponse> => {
        const response = await api.get<ReceivedConsignmentSettlementsResponse>(
            '/sales/received-consignment-settlements',
            { params }
        );
        return response.data;
    },

    getById: async (id: string): Promise<ReceivedConsignmentSettlementResponse> => {
        const response = await api.get<ReceivedConsignmentSettlementResponse>(
            `/sales/received-consignment-settlements/${id}`
        );
        return response.data;
    },

    create: async (
        data: CreateReceivedConsignmentSettlementRequest
    ): Promise<ReceivedConsignmentSettlementResponse> => {
        const response = await api.post<ReceivedConsignmentSettlementResponse>(
            '/sales/received-consignment-settlements',
            data
        );
        return response.data;
    },

    update: async (
        id: string,
        data: UpdateReceivedConsignmentSettlementRequest
    ): Promise<ReceivedConsignmentSettlementResponse> => {
        const response = await api.put<ReceivedConsignmentSettlementResponse>(
            `/sales/received-consignment-settlements/${id}`,
            data
        );
        return response.data;
    },

    delete: async (id: string): Promise<DeleteReceivedConsignmentSettlementResponse> => {
        const response = await api.delete<DeleteReceivedConsignmentSettlementResponse>(
            `/sales/received-consignment-settlements/${id}`
        );
        return response.data;
    },
};
