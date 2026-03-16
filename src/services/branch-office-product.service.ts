import api from './api.client';
import type { Product, Pagination } from './product.service';

export interface BranchOfficeProductsResponse {
    success: boolean;
    message: string;
    data: {
        data: Product[];
        pagination: Pagination;
    };
}

export const branchOfficeProductService = {
    /**
     * Get products for a specific branch office with filtering and pagination
     */
    getForSelect: async (params: {
        branchOfficeId: string;
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<BranchOfficeProductsResponse> => {
        const response = await api.get<BranchOfficeProductsResponse>('/sales/branch-office-products/select', { params });
        return response.data;
    },
};
