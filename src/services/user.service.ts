import api from './api.client';
import { type User } from './auth.service';

export interface UserMeResponse {
    success: boolean;
    message: string;
    data: User;
}

export interface BusinessUser {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
    role: {
        id: string;
        code: string;
        name: string;
    };
    person: {
        firstName: string;
        lastName: string;
        phone: string | null;
    } | null;
    lastLogin: string | null;
}

export interface BusinessUsersResponse {
    message: string;
    data: BusinessUser[];
}

export interface CreateBusinessUserDto {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    roleCode: string;
}

export interface UpdateBusinessUserDto {
    firstName?: string;
    lastName?: string;
    phone?: string;
    roleCode?: string;
}

export const userService = {
    /**
     * Get current user data
     */
    getMe: async () => {
        const response = await api.get<UserMeResponse>('/users/me');
        return response.data;
    },

    /**
     * Get business users
     */
    getBusinessUsers: async () => {
        const response = await api.get<BusinessUsersResponse>('/users/business');
        return response.data;
    },

    /**
     * Create a new business user
     */
    createBusinessUser: async (data: CreateBusinessUserDto) => {
        const response = await api.post<{ message: string, data: { id: string, email: string } }>('/users/business', data);
        return response.data;
    },

    /**
     * Update an existing business user
     */
    updateBusinessUser: async (id: string, data: UpdateBusinessUserDto) => {
        const response = await api.put<{ message: string, data: BusinessUser }>(`/users/business/${id}`, data);
        return response.data;
    },

    /**
     * Toggle a user's active status
     */
    toggleUserStatus: async (id: string) => {
        const response = await api.patch<{ message: string, data: { isActive: boolean } }>(`/users/business/${id}/toggle-status`);
        return response.data;
    },

    /**
     * Delete a business user
     */
    deleteBusinessUser: async (id: string) => {
        const response = await api.delete<{ message: string }>(`/users/business/${id}`);
        return response.data;
    }
};
