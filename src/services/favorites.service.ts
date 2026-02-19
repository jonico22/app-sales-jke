import api from './api.client';
import type { Product } from './product.service';

export interface Favorite {
    id: string;
    userId: string;
    productId: string;
    product: Product;
    createdAt: string;
}

export interface FavoritesResponse {
    success: boolean;
    message: string;
    data: Favorite[];
}

export interface ToggleFavoriteRequest {
    productId: string;
}

export interface ToggleFavoriteResponse {
    success: boolean;
    message: string;
    data: {
        isFavorite: boolean;
    };
}

export const favoritesService = {
    // Get all favorites
    getAll: async (): Promise<FavoritesResponse> => {
        const response = await api.get<FavoritesResponse>('/favorites');
        return response.data;
    },

    // Toggle favorite (add/remove)
    toggle: async (data: ToggleFavoriteRequest): Promise<ToggleFavoriteResponse> => {
        const response = await api.post<ToggleFavoriteResponse>('/favorites/toggle', data);
        return response.data;
    },
};
