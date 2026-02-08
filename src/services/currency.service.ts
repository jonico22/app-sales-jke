
import api from './api.client';
import type { Pagination } from './order.service';

export interface Currency {
    id: string;
    code: string;
    symbol: string;
    name: string;
    exchangeRate: number;
    isDefault: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCurrencyRequest {
    code: string;
    symbol: string;
    name: string;
    exchangeRate: number;
    isDefault?: boolean;
    isActive?: boolean;
}

export interface UpdateCurrencyRequest {
    code?: string;
    symbol?: string;
    name?: string;
    exchangeRate?: number;
    isDefault?: boolean;
    isActive?: boolean;
}

export interface CurrencyResponse {
    success: boolean;
    message: string;
    data: Currency;
}

export interface CurrenciesResponse {
    success: boolean;
    message: string;
    data: {
        data: Currency[];
        pagination: Pagination;
    };
}

export interface DeleteCurrencyResponse {
    success: boolean;
    message: string;
}

export interface CurrencySelectOption {
    id: string;
    name: string;
    code: string;
    symbol: string;
    exchangeRate: number;
}

export interface CurrenciesSelectResponse {
    success: boolean;
    message: string;
    data: CurrencySelectOption[];
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

export const currencyService = {
    // Get all currencies
    getAll: async (params?: {
        page?: number;
        limit?: number;
        search?: string;
        isActive?: boolean;
    }): Promise<CurrenciesResponse> => {
        const response = await api.get<CurrenciesResponse>('/sales/currencies', { params });
        return response.data;
    },

    // Get currencies for select dropdowns (lightweight)
    getForSelect: async (): Promise<CurrenciesSelectResponse> => {
        const response = await api.get<CurrenciesSelectResponse>('/sales/currencies/select');
        return response.data;
    },

    // Get currency by ID
    getById: async (id: string): Promise<CurrencyResponse> => {
        const response = await api.get<CurrencyResponse>(`/sales/currencies/${id}`);
        return response.data;
    },

    // Create new currency
    create: async (data: CreateCurrencyRequest): Promise<CurrencyResponse> => {
        const response = await api.post<CurrencyResponse>('/sales/currencies', data);
        return response.data;
    },

    // Update currency
    update: async (id: string, data: UpdateCurrencyRequest): Promise<CurrencyResponse> => {
        const response = await api.put<CurrencyResponse>(`/sales/currencies/${id}`, data);
        return response.data;
    },

    // Delete currency
    delete: async (id: string): Promise<DeleteCurrencyResponse> => {
        const response = await api.delete<DeleteCurrencyResponse>(`/sales/currencies/${id}`);
        return response.data;
    },

    // Get users who created currencies
    getCreatedByUsers: async (): Promise<UpdatedByUsersResponse> => {
        const response = await api.get<UpdatedByUsersResponse>('/sales/currencies/created-by-users');
        return response.data;
    },
};
