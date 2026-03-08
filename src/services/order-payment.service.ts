import api from './api.client';
import type { Pagination } from './order.service';
import { formatDateToLima, formatDateToUTC } from '../utils/date.utils';

export { formatDateToLima, formatDateToUTC };

export const OrderPaymentMethod = {
    CASH: 'CASH',
    CARD: 'CARD',
    TRANSFER: 'TRANSFER',
    YAPE: 'YAPE',
    PLIN: 'PLIN',
    OTHER: 'OTHER'
} as const;

export type OrderPaymentMethod = (typeof OrderPaymentMethod)[keyof typeof OrderPaymentMethod];

export const OrderPaymentStatus = {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    REJECTED: 'REJECTED',
    REFUNDED: 'REFUNDED'
} as const;

export type OrderPaymentStatus = (typeof OrderPaymentStatus)[keyof typeof OrderPaymentStatus];

export interface OrderPayment {
    id: string;
    orderId: string;
    societyId: string;
    amount: number;
    currencyId: string;
    exchangeRate: number;
    paymentMethod: OrderPaymentMethod;
    paymentDate: string; // Renamed from date
    referenceCode: string | null; // Renamed from reference
    status: OrderPaymentStatus;
    notes: string | null;
    imageId: string | null;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string | null;
}

export interface CreateOrderPaymentRequest {
    orderId?: string; // Optional per backend validation
    societyId: string;

    // Financials
    amount: number;
    currencyId: string;
    exchangeRate?: number; // Defaults to 1.0 on backend

    paymentDate?: string;
    paymentMethod: OrderPaymentMethod;

    // Status & Evidence
    status?: OrderPaymentStatus;
    imageId?: string;
    referenceCode?: string;
    notes?: string;
}

export interface UpdateOrderPaymentRequest {
    amount?: number;
    currencyId?: string;
    exchangeRate?: number;
    paymentMethod?: OrderPaymentMethod;
    paymentDate?: string;
    referenceCode?: string;
    status?: OrderPaymentStatus;
    notes?: string;
    imageId?: string;
    isActive?: boolean;
}

export interface OrderPaymentResponse {
    success: boolean;
    message: string;
    data: OrderPayment;
}

export interface OrderPaymentsResponse {
    success: boolean;
    message: string;
    data: {
        data: OrderPayment[];
        pagination: Pagination;
    };
}

export interface DeleteOrderPaymentResponse {
    success: boolean;
    message: string;
}

export const orderPaymentService = {
    // Get all order payments
    getAll: async (params?: {
        page?: number;
        limit?: number;
        search?: string;
        orderId?: string;
        societyId?: string;
        isActive?: boolean;
        paymentMethod?: OrderPaymentMethod;
        status?: OrderPaymentStatus;
        dateFrom?: string;
        dateTo?: string;
    }): Promise<OrderPaymentsResponse> => {
        const response = await api.get<OrderPaymentsResponse>('/sales/order-payments', { params });
        return response.data;
    },

    // Get order payment by ID
    getById: async (id: string): Promise<OrderPaymentResponse> => {
        const response = await api.get<OrderPaymentResponse>(`/sales/order-payments/${id}`);
        return response.data;
    },

    // Create new order payment
    create: async (data: CreateOrderPaymentRequest): Promise<OrderPaymentResponse> => {
        const response = await api.post<OrderPaymentResponse>('/sales/order-payments', data);
        return response.data;
    },

    // Update order payment
    update: async (id: string, data: UpdateOrderPaymentRequest): Promise<OrderPaymentResponse> => {
        const response = await api.put<OrderPaymentResponse>(`/sales/order-payments/${id}`, data);
        return response.data;
    },

    // Delete order payment
    delete: async (id: string): Promise<DeleteOrderPaymentResponse> => {
        const response = await api.delete<DeleteOrderPaymentResponse>(`/sales/order-payments/${id}`);
        return response.data;
    },
};
