import api from './api.client';
import type { OrderPayment } from './order-payment.service';

export interface OrderItem {
    id: string; // Likely exists in response
    orderId: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    total?: number; // Added for display
    product?: {
        name: string;
        // ...other product fields
    };
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
    orderCode: string;
    orderDate: string; // Added
    totalAmount: string; // Changed from total: number
    status: OrderStatus;
    discount: string; // Added, string in JSON
    notes: string | null;
    paymentDate: string | null;
    comment: string | null;
    cancellationReason: string | null;
    subtotal: string;
    taxAmount: string;

    partnerId: string;
    branchId: string;
    societyId: string;
    currencyId: string;
    exchangeRate: string; // Changed to string based on JSON "1"

    isActive: boolean; // Not in JSON but likely implicit or missing? Keeping for now or making optional if issues arise. JSON doesn't show it.
    isDeleted: boolean; // Not in JSON

    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string | null;

    // Relations included in response
    items?: OrderItem[]; // Legacy/alternative property name
    orderItems?: OrderItem[]; // Actual property name from API
    OrderPayment?: OrderPayment[];
    // The response has _count.
    _count?: {
        orderItems: number;
    };

    partner?: {
        id: string;
        companyName: string | null;
        firstName: string | null;
        lastName: string | null;
        documentNumber: string | null;
        documentType?: string | null; // Added
        email: string | null;
    };

    currency?: {
        code: string;
        symbol: string;
    };
    totalProducts?: number; // Added from API response
}
// Keeping Create/Update interfaces mostly as is unless they also need massive changes, 
// but usually request/response differs. The user only showed Response.

export interface CreateOrderItemRequest {
    productId: string;
    quantity: number;
    unitPrice: number; // Changed from unitPrice
    total: number; // Added
}

export interface CreateOrderRequest {
    societyId?: string;
    partnerId: string; // Changed from partnerId
    branchId: string;
    currencyId: string;
    exchangeRate: number;
    orderItems: CreateOrderItemRequest[]; // Changed from orderItems
    subtotal: number;
    taxAmount: number;
    total: number;
    status?: OrderStatus;
    discount?: number;
    notes?: string;
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
    cancellationReason?: string;
    notes?: string;
    comment?: string;
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
        include?: string; // Allow including relations
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
