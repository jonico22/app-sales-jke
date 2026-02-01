import api from './api.client';

export interface Category {
    id: string;
    name: string;
    code: string;
    description: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCategoryRequest {
    code: string;
    name: string;
    description?: string;
    isActive?: boolean;
}

export interface UpdateCategoryRequest {
    code?: string;
    name?: string;
    description?: string;
    isActive?: boolean;
}

export interface CategoryResponse {
    success: boolean;
    message: string;
    data: Category;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface CategoriesResponse {
    success: boolean;
    message: string;
    data: {
        data: Category[];
        pagination: Pagination;
    };
}

export interface DeleteCategoryResponse {
    success: boolean;
    message: string;
}

export const categoryService = {
    // Get all categories
    getAll: async (params?: { page?: number; limit?: number; search?: string; isActive?: boolean }): Promise<CategoriesResponse> => {
        const response = await api.get<CategoriesResponse>('/sales/categories', { params });
        return response.data;
    },

    // Get category by ID
    getById: async (id: string): Promise<CategoryResponse> => {
        const response = await api.get<CategoryResponse>(`/sales/categories/${id}`);
        return response.data;
    },

    // Create new category
    create: async (data: CreateCategoryRequest): Promise<CategoryResponse> => {
        const response = await api.post<CategoryResponse>('/sales/categories', data);
        return response.data;
    },

    // Update category
    update: async (id: string, data: UpdateCategoryRequest): Promise<CategoryResponse> => {
        const response = await api.put<CategoryResponse>(`/sales/categories/${id}`, data);
        return response.data;
    },

    // Delete category
    delete: async (id: string): Promise<DeleteCategoryResponse> => {
        const response = await api.delete<DeleteCategoryResponse>(`/sales/categories/${id}`);
        return response.data;
    },
};
