import api from './api.client';
import { type User } from './auth.service';

export interface UserMeResponse {
    success: boolean;
    message: string;
    data: User;
}

export const userService = {
    /**
     * Get current user data
     */
    getMe: async () => {
        const response = await api.get<UserMeResponse>('/users/me');
        return response.data;
    }
};
