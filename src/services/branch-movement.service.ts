import api from './api.client';

export const MovementStatus = {
    PENDING: 'PENDING',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED'
} as const;

export type MovementStatus = (typeof MovementStatus)[keyof typeof MovementStatus];

export interface BranchMovement {
    id: string;
    originBranchId: string;
    destinationBranchId: string;
    productId: string;
    quantityMoved: number;
    status: MovementStatus;
    notes: string | null;
    referenceCode: string | null;
    batchId: string | null;
    movementDate: string;
    receivedAt: string | null;
    cancellationReason: string | null;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string | null;

    // Potential relations included in response
    originBranch?: {
        name: string;
        code: string;
    };
    destinationBranch?: {
        name: string;
        code: string;
    };
    product?: {
        name: string;
        code: string;
    };
}

export interface GetAllBranchMovementsParams {
    originBranchId?: string;
    destinationBranchId?: string;
    productId?: string;
    status?: MovementStatus;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface CreateBranchMovementRequest {
    originBranchId: string;
    destinationBranchId: string;
    productId: string;
    quantityMoved: number;
    notes?: string;
    referenceCode?: string;
}

export interface UpdateBranchMovementStatusRequest {
    status: MovementStatus;
    cancellationReason?: string;
}

export interface BulkBranchMovementItem {
    productId: string;
    quantityMoved: number;
    notes?: string;
}

export interface BulkBranchMovementRequest {
    originBranchId: string;
    destinationBranchId: string;
    items: BulkBranchMovementItem[];
    referenceCode?: string;
}

export interface TransferAllRequest {
    originBranchId: string;
    destinationBranchId: string;
    notes?: string;
    referenceCode?: string;
}

export interface BranchMovementResponse {
    success: boolean;
    message: string;
    data: BranchMovement;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface BranchMovementsResponse {
    success: boolean;
    message: string;
    data: {
        data: BranchMovement[];
        pagination: Pagination;
    };
}

export const branchMovementService = {
    /**
     * Get all branch movements (Internal Transfers) with filtering and pagination
     */
    getAll: async (params?: GetAllBranchMovementsParams): Promise<BranchMovementsResponse> => {
        const response = await api.get<BranchMovementsResponse>('/sales/branch-movements', { params });
        return response.data;
    },

    /**
     * Create a new branch movement (Step 1: Reservation)
     */
    create: async (data: CreateBranchMovementRequest): Promise<BranchMovementResponse> => {
        const response = await api.post<BranchMovementResponse>('/sales/branch-movements', data);
        return response.data;
    },

    /**
     * Get a specific branch movement by ID
     */
    getById: async (id: string): Promise<BranchMovementResponse> => {
        const response = await api.get<BranchMovementResponse>(`/sales/branch-movements/${id}`);
        return response.data;
    },

    /**
     * Update branch movement status (Confirm Reception / Cancel)
     */
    updateStatus: async (id: string, data: UpdateBranchMovementStatusRequest): Promise<BranchMovementResponse> => {
        const response = await api.put<BranchMovementResponse>(`/sales/branch-movements/${id}`, data);
        return response.data;
    },

    /**
     * Create bulk branch movements (Atomic transfer)
     */
    createBulk: async (data: BulkBranchMovementRequest): Promise<BranchMovementsResponse> => {
        const response = await api.post<BranchMovementsResponse>('/sales/branch-movements/bulk', data);
        return response.data;
    },

    /**
     * Transfer all available stock from one branch to another
     */
    transferAll: async (data: TransferAllRequest): Promise<BranchMovementsResponse> => {
        const response = await api.post<BranchMovementsResponse>('/sales/branch-movements/transfer-all', data);
        return response.data;
    },

    /**
     * Delete a branch movement record
     */
    delete: async (id: string): Promise<{ success: boolean; message: string }> => {
        const response = await api.delete<{ success: boolean; message: string }>(`/sales/branch-movements/${id}`);
        return response.data;
    }
};
