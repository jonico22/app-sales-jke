import api from './api.client';

export interface Product {
    id: string;
    code: string;
    name: string;
    description: string | null;
    price: number;
    priceCost: number;
    stock: number;
    minStock: number;
    categoryId: string;
    imageId: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateProductRequest {
    name: string;
    description?: string;
    price: number;
    priceCost: number;
    stock?: number;
    minStock?: number;
    categoryId: string;
    imageId?: string;
    isActive?: boolean;
    code: string;
}

export interface UpdateProductRequest {
    name?: string;
    description?: string;
    price?: number;
    priceCost?: number;
    stock?: number;
    minStock?: number;
    categoryId?: string;
    imageId?: string;
    isActive?: boolean;
}

export interface ProductResponse {
    success: boolean;
    message: string;
    data: Product;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface ProductsResponse {
    success: boolean;
    message: string;
    data: {
        data: Product[];
        pagination: Pagination;
    };
}

export interface DeleteProductResponse {
    success: boolean;
    message: string;
}

export const productService = {
    // Get all products
    getAll: async (params?: { page?: number; limit?: number; search?: string; isActive?: boolean; categoryId?: string }): Promise<ProductsResponse> => {
        const response = await api.get<ProductsResponse>('/sales/products', { params });
        return response.data;
    },

    // Get product by ID
    getById: async (id: string): Promise<ProductResponse> => {
        const response = await api.get<ProductResponse>(`/sales/products/${id}`);
        return response.data;
    },

    // Create new product
    create: async (data: CreateProductRequest): Promise<ProductResponse> => {
        const response = await api.post<ProductResponse>('/sales/products', data);
        return response.data;
    },

    // Update product
    update: async (id: string, data: UpdateProductRequest): Promise<ProductResponse> => {
        const response = await api.put<ProductResponse>(`/sales/products/${id}`, data);
        return response.data;
    },

    // Delete product
    delete: async (id: string): Promise<DeleteProductResponse> => {
        const response = await api.delete<DeleteProductResponse>(`/sales/products/${id}`);
        return response.data;
    },
};
