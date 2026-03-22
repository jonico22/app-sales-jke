import api from './api.client';

export type KardexMovementType = 
    | 'SALE_EXIT' 
    | 'TRANSFER_IN' 
    | 'TRANSFER_OUT' 
    | 'ADJUSTMENT_ADD' 
    | 'ADJUSTMENT_SUB' 
    | 'PURCHASE_ENTRY' 
    | 'RETURN_ENTRY' 
    | 'SOCIETY_TRANSFER_IN' 
    | 'SOCIETY_TRANSFER_OUT';

export interface KardexTransaction {
    id: string;
    date: string;
    productId: string;
    branchOfficeId: string;
    type: KardexMovementType;
    quantity: number;
    previousStock: number;
    newStock: number;
    unitCost: string;
    totalCost: string;
    referenceId: string | null;
    referenceType: string | null;
    documentNumber: string | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
    createdBy: string | null;
    
    // Relations
    product?: {
        id: string;
        name: string;
        code: string;
    };
    branchOffice?: {
        id: string;
        name: string;
    };
    user?: {
        firstName: string;
        lastName: string;
    };
}

export interface GetKardexParams {
    branchId?: string;
    productId?: string;
    type?: KardexMovementType | string;
    startDate?: string;
    endDate?: string;
    search?: string;
    page?: number;
    limit?: number;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface CreateAdjustmentRequest {
    productId: string;
    branchOfficeId: string;
    type: 'ADJUSTMENT_ADD' | 'ADJUSTMENT_SUB';
    quantity: number;
    unitCost: number;
    notes?: string;
}

export interface KardexResponse {
    success: boolean;
    message: string;
    data: {
        data: KardexTransaction[];
        pagination: Pagination;
    };
}

export interface SingleKardexResponse {
    success: boolean;
    message: string;
    data: KardexTransaction;
}

export const kardexService = {
    /**
     * Get detailed history of stock moves (Kardex) with filtering and pagination
     */
    getHistory: async (params?: GetKardexParams): Promise<KardexResponse> => {
        const response = await api.get<KardexResponse>('/sales/inventory/kardex', { params });
        return response.data;
    },

    /**
     * Create a manual stock adjustment (ADD or SUB)
     */
    createAdjustment: async (data: CreateAdjustmentRequest): Promise<SingleKardexResponse> => {
        const response = await api.post<SingleKardexResponse>('/sales/inventory/adjustment', data);
        return response.data;
    }
};
