import api from './api.client';

export interface ProductCategory {
    id: string;
    name: string;
    code: string;
}

export interface Brand {
    id: string;
    brand: string;
}

export interface Color {
    id: string;
    color: string;
    colorCode: string;
}

export interface Product {
    id: string;
    code?: string;
    name: string;
    description: string | null;
    price: string;
    priceCost: string;
    stock: number;
    minStock: number;
    barcode: string | null;
    brand: string | null;
    color: string | null;
    colorCode: string | null;
    societyId: string;
    categoryId: string;
    imageId: string | null;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string | null;
    category: ProductCategory | null;
    image: string | null;
    salesCount?: number;
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
    barcode?: string;
    brand?: string;
    color?: string;
    colorCode?: string;
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
    barcode?: string;
    brand?: string;
    color?: string;
    colorCode?: string;
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

export interface UserSelectOption {
    id: string;
    name: string;
}

export interface UpdatedByUsersResponse {
    success: boolean;
    message: string;
    data: UserSelectOption[];
}

export interface BulkUploadResponse {
    success: boolean;
    message: string;
    data: {
        status: string;
        message: string;
        details: {
            success: boolean;
            processed: number;
            errors: string[];
        };
    };
}

export const productService = {
    // Get all products
    getAll: async (params?: {
        page?: number;
        limit?: number;
        search?: string;
        isActive?: boolean;
        categoryId?: string;
        createdBy?: string;
        createdAtFrom?: string;
        createdAtTo?: string;
        updatedAtFrom?: string;
        updatedAtTo?: string;
        priceFrom?: number;
        priceTo?: number;
        priceCostFrom?: number;
        priceCostTo?: number;
        stockFrom?: number;
        stockTo?: number;
        lowStock?: boolean;
    }): Promise<ProductsResponse> => {
        const response = await api.get<ProductsResponse>('/sales/products', { params });
        return response.data;
    },

    // Get product by ID
    getById: async (id: string): Promise<ProductResponse> => {
        const response = await api.get<ProductResponse>(`/sales/products/${id}`);
        return response.data;
    },

    getForSelect: async (params?: {
        categoryCode?: string;
        categoryId?: string;
        branchId?: string;
    }): Promise<ProductsResponse> => {
        const response = await api.get<ProductsResponse>('/sales/products/select', { params });
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

    // Get users who created products
    getCreatedByUsers: async (): Promise<UpdatedByUsersResponse> => {
        const response = await api.get<UpdatedByUsersResponse>('/sales/products/created-by-users');
        return response.data;
    },

    // Bulk upload products from CSV file
    bulkUpload: async (file: File): Promise<BulkUploadResponse> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post<BulkUploadResponse>('/sales/products/bulk-upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Advanced Search Helpers
    getBestSellers: async (): Promise<{ success: boolean; message: string; data: Product[] }> => {
        const response = await api.get<{ success: boolean; message: string; data: Product[] }>('/sales/products/best-sellers');
        return response.data;
    },

    // Updated to include optional message field in response
    getBrands: async (): Promise<{ success: boolean; message?: string; data: Brand[] }> => {
        const response = await api.get<{ success: boolean; data: Brand[] }>('/sales/products/brands');
        return response.data;
    },

    // Updated to include optional message field in response
    getColors: async (): Promise<{ success: boolean; message?: string; data: Color[] }> => {
        const response = await api.get<{ success: boolean; data: Color[] }>('/sales/products/colors');
        return response.data;
    },
};
