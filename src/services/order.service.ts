import api from './api.client';

export interface OrderItem {
    id: string; // Likely exists in response
    orderId: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    // Potentially other fields like productName if joined, but keeping minimal for now
}

export const OrderStatus = {
    PENDING: 'PENDING',
    PENDING_PAYMENT: 'PENDING_PAYMENT',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED'
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export interface Order {
    id: string;
    code: string;
    partnerId: string; // Renamed from clientId
    branchId: string;
    societyId: string;
    currencyId: string;
    exchangeRate: number;
    total: number;
    status: OrderStatus;
    date: string;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string | null;
    items: OrderItem[];
}

export interface CreateOrderItemRequest {
    productId: string;
    quantity: number;
    unitPrice: number;
}

export interface CreateOrderRequest {
    societyId: string;
    partnerId: string;
    branchId: string;
    currencyId: string;
    exchangeRate: number;
    orderItems: CreateOrderItemRequest[];
    status?: OrderStatus;
}

export interface UpdateOrderRequest {
    partnerId?: string;
    branchId?: string;
    currencyId?: string;
    exchangeRate?: number;
    status?: OrderStatus;
    date?: string;
    orderItems?: CreateOrderItemRequest[];
    isActive?: boolean;
}

export interface OrderResponse {
    success: boolean;
    message: string;
    data: Order;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface OrdersResponse {
    success: boolean;
    message: string;
    data: {
        data: Order[];
        pagination: Pagination;
    };
}

export interface DeleteOrderResponse {
    success: boolean;
    message: string;
}

export interface OrderSelectOption {
    id: string;
    code: string;
}

export interface OrdersSelectResponse {
    success: boolean;
    message: string;
    data: OrderSelectOption[];
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

export const orderService = {
    // Get all orders
    getAll: async (params?: {
        page?: number;
        limit?: number;
        search?: string;
        isActive?: boolean;
        partnerId?: string;
        branchId?: string;
        status?: OrderStatus;
        dateFrom?: string;
        dateTo?: string;
        createdBy?: string;
        createdAtFrom?: string;
        createdAtTo?: string;
        updatedAtFrom?: string;
        updatedAtTo?: string;
    }): Promise<OrdersResponse> => {
        const response = await api.get<OrdersResponse>('/sales/orders', { params });
        return response.data;
    },

    // Get orders for select dropdowns
    getForSelect: async (): Promise<OrdersSelectResponse> => {
        const response = await api.get<OrdersSelectResponse>('/sales/orders/select');
        return response.data;
    },

    // Get order by ID
    getById: async (id: string): Promise<OrderResponse> => {
        const response = await api.get<OrderResponse>(`/sales/orders/${id}`);
        return response.data;
    },

    // Create new order
    create: async (data: CreateOrderRequest): Promise<OrderResponse> => {
        const response = await api.post<OrderResponse>('/sales/orders', data);
        return response.data;
    },

    // Update order
    update: async (id: string, data: UpdateOrderRequest): Promise<OrderResponse> => {
        const response = await api.put<OrderResponse>(`/sales/orders/${id}`, data);
        return response.data;
    },

    // Delete order
    delete: async (id: string): Promise<DeleteOrderResponse> => {
        const response = await api.delete<DeleteOrderResponse>(`/sales/orders/${id}`);
        return response.data;
    },

    // Get users who created orders
    getCreatedByUsers: async (): Promise<UpdatedByUsersResponse> => {
        const response = await api.get<UpdatedByUsersResponse>('/sales/orders/created-by-users');
        return response.data;
    },
};
