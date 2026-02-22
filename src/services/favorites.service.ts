import api from './api.client';
import type { Product } from './product.service';

export interface Favorite extends Product {
    favoriteAt: string;
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
        const response = await api.get<FavoritesResponse>('sales/favorites');
        return response.data;
    },

    // Toggle favorite (add/remove)
    toggle: async (data: ToggleFavoriteRequest): Promise<ToggleFavoriteResponse> => {
        const response = await api.post<ToggleFavoriteResponse>('sales/favorites/toggle', data);
        return response.data;
    },
};
