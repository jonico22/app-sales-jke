import api from './api.client';

export const ShiftStatus = {
    OPEN: 'OPEN',
    CLOSED: 'CLOSED'
} as const;

export type ShiftStatus = (typeof ShiftStatus)[keyof typeof ShiftStatus];

export const MovementType = {
    INCOME: 'INCOME',
    EXPENSE: 'EXPENSE'
} as const;

export type MovementType = (typeof MovementType)[keyof typeof MovementType];

export const PaymentMethodOrder = {
    CASH: 'CASH',
    CARD: 'CARD',
    YAPE: 'YAPE',
    PLIN: 'PLIN',
    TRANSFER: 'TRANSFER',
    OTHER: 'OTHER'
} as const;

export type PaymentMethodOrder = (typeof PaymentMethodOrder)[keyof typeof PaymentMethodOrder];

export interface CashShift {
    id: string;
    societyId: string;
    branchId: string;
    userId: string;
    status: ShiftStatus;
    /** dd/MM/yyyy HH:mm:ss — use parseDate() helper before formatting */
    openedAt: string;
    closedAt: string | null;
    /** Saldo inicial de apertura (string from API) */
    initialAmount: string;
    finalReportedAmount: string | null;
    finalSystemAmount: string | null;
    difference: string | null;
    // Income breakdown by payment method
    incomeCash: string;
    incomeCard: string;
    incomeYape: string;
    incomePlin: string;
    incomeTransfer: string;
    // Expense breakdown
    expenseCash: string;
    // Observations & reported physical amounts
    observations: string | null;
    reportedCashAmount: string | null;
    reportedCardAmount: string | null;
    reportedYapeAmount: string | null;
    reportedPlinAmount: string | null;
    reportedTransferAmount: string | null;
    /** dd/MM/yyyy HH:mm:ss */
    createdAt: string;
    updatedAt: string;
    /** Nested branch info included in list response */
    branch: {
        name: string;
    };
    // Legacy aliases kept for backwards compat with components
    openingBalance: number;
    closingBalance: number | null;
    currentBalance: number;
}

export interface CashShiftSelectItem {
    id: string;
    userId: string;
    status: ShiftStatus;
    /** dd/MM/yyyy HH:mm */
    openedAt: string;
    closedAt: string | null;
    branch: {
        id: string;
        name: string;
        code: string;
    };
}

export interface CashShiftSelectResponse {
    success: boolean;
    message: string;
    data: CashShiftSelectItem[];
}

export interface CashShiftMovement {
    id: string;
    type: MovementType;
    amount: number;
    paymentMethod: PaymentMethodOrder;
    description: string;
    createdAt: string;
    orderPayment: {
        id: string;
        amount: number;
        paymentMethod: string;
    } | null;
}

export interface CashShiftDetail extends CashShift {
    branch: {
        name: string;
    };
    movements?: CashShiftMovement[];
}


export interface GetAllCashShiftsParams {
    societyId?: string;
    societyCode?: string;
    branchId?: string;
    userId?: string;
    status?: ShiftStatus;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface CashShiftResponse {
    success: boolean;
    message: string;
    data: CashShift;
}

export interface CashShiftDetailResponse {
    success: boolean;
    message: string;
    data: CashShiftDetail;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface CashShiftsResponse {
    success: boolean;
    message: string;
    data: {
        data: CashShift[];
        pagination: Pagination;
    };
}

export interface CreateCashShiftRequest {
    branchId: string;
    openingBalance: number;
    notes?: string;
}

export interface OpenCashShiftRequest {
    societyId: string;
    branchId: string;
    userId: string;
    initialAmount: number;
}

export interface UpdateCashShiftRequest {
    notes?: string;
    status?: ShiftStatus;
    closingBalance?: number;
}

export interface CloseCashShiftRequest {
    finalReportedAmount: number;
    reportedCashAmount: number;
    reportedCardAmount: number;
    reportedYapeAmount: number;
    reportedPlinAmount: number;
    reportedTransferAmount: number;
    observations?: string;
}

export interface AddManualMovementRequest {
    shiftId: string;
    type: MovementType;
    amount: number;
    description: string;
    currencyId: string;
    paymentMethod: PaymentMethodOrder;
    userId: string;
}

export interface UserSelectOption {
    id: string;
    name: string;
}

export interface CashShiftUsersResponse {
    success: boolean;
    message: string;
    data: UserSelectOption[];
}

export const cashShiftService = {
    /**
     * Get all cash shifts with filtering and pagination
     */
    getAll: async (params?: GetAllCashShiftsParams): Promise<CashShiftsResponse> => {
        const response = await api.get<CashShiftsResponse>('/sales/cash-shifts', { params });
        return response.data;
    },

    /**
     * Get a cash shift by ID (Detail with movements)
     */
    getById: async (id: string): Promise<CashShiftDetailResponse> => {
        const response = await api.get<CashShiftDetailResponse>(`/sales/cash-shifts/${id}`);
        return response.data;
    },

    /**
     * Create a new cash shift (Legacy/Alternative)
     */
    create: async (data: CreateCashShiftRequest): Promise<CashShiftResponse> => {
        const response = await api.post<CashShiftResponse>('/sales/cash-shifts', data);
        return response.data;
    },

    /**
     * Open a new cash shift (Abrir Caja)
     * Solo se permite una caja abierta por usuario/sucursal (409 si ya existe una abierta).
     */
    open: async (data: OpenCashShiftRequest): Promise<CashShiftResponse> => {
        const response = await api.post<CashShiftResponse>('/sales/cash-shifts/open', data);
        return response.data;
    },

    /**
     * Update a cash shift (General)
     */
    update: async (id: string, data: UpdateCashShiftRequest): Promise<CashShiftResponse> => {
        const response = await api.put<CashShiftResponse>(`/sales/cash-shifts/${id}`, data);
        return response.data;
    },

    /**
     * Get the current open cash shift for the user/branch
     * Verifica si el usuario tiene una caja abierta en la sucursal seleccionada.
     */
    getCurrent: async (params: { branchId: string; userId: string }): Promise<CashShiftResponse> => {
        const response = await api.get<CashShiftResponse>('/sales/cash-shifts/current', { params });
        return response.data;
    },

    /**
     * Close a cash shift (Cerrar Caja)
     * Realiza el cierre, calcula acumulados y diferencia.
     */
    close: async (id: string, data: CloseCashShiftRequest): Promise<CashShiftResponse> => {
        const response = await api.post<CashShiftResponse>(`/sales/cash-shifts/close/${id}`, data);
        return response.data;
    },

    /**
     * Add a manual movement (Income/Expense) to an open shift
     */
    addMovement: async (data: AddManualMovementRequest): Promise<{ success: boolean; message: string; data: CashShiftMovement }> => {
        const response = await api.post<{ success: boolean; message: string; data: CashShiftMovement }>('/sales/cash-shifts/movements', data);
        return response.data;
    },

    /**
     * Get unique users who have created cash shifts
     */
    getCreatedByUsers: async (): Promise<CashShiftUsersResponse> => {
        const response = await api.get<CashShiftUsersResponse>('/sales/cash-shifts/created-by');
        return response.data;
    },

    /**
     * Delete a cash shift (if supported/necessary)
     */
    delete: async (id: string): Promise<{ success: boolean; message: string }> => {
        const response = await api.delete<{ success: boolean; message: string }>(`/sales/cash-shifts/${id}`);
        return response.data;
    },

    /**
     * Get cash shifts for selection (dropdown)
     */
    getForSelect: async (params?: { branchId?: string; status?: ShiftStatus }): Promise<CashShiftSelectResponse> => {
        const response = await api.get<CashShiftSelectResponse>('/sales/cash-shifts/select', { params });
        return response.data;
    }
};
