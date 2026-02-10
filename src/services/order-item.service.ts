import api from './api.client';
import type { Pagination } from './order.service';

export interface OrderItem {
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    total: number;
    createdAt: string;
    updatedAt: string;

    // Relations
    product?: {
        id: string;
        name: string;
        code: string;
        price: number;
    };
}

export interface OrderItemsResponse {
    success: boolean;
    message: string;
    data: {
        data: OrderItem[];
        pagination: Pagination;
    };
}

export const orderItemService = {
    getAll: async (params?: {
        page?: number;
        limit?: number;
        orderId?: string;
    }): Promise<OrderItemsResponse> => {
        const response = await api.get<OrderItemsResponse>('/sales/order-items', { params });
        return response.data;
    }
};
