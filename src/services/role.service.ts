import api from './api.client';

export interface Role {
    id: string;
    code: string;
    name: string;
    description: string | null;
}

export interface RolesResponse {
    message: string;
    data: Role[];
}

export const roleService = {
    /**
     * Get available roles for the business
     */
    getRoles: async () => {
        const response = await api.get<RolesResponse>('/roles');
        return response.data;
    }
};
