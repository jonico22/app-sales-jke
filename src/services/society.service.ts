import api from './api.client';
import { useSocietyStore } from '@/store/society.store';

export interface MainCurrency {
    id: string;
    name: string;
    code: string;
    symbol: string;
}

export interface Tax {
    id: string;
    name: string;
    value: number;
    code: string;
}

export interface Society {
    id: string;
    name: string;
    code: string;
    isActive: boolean;
    legalEntityId: string | null;
    stockNotificationFrequency: string;
    salesNotificationFrequency: string;
    backupFrequency: string;
    dataRetentionDays: number | null;
    uiConfig: any | null;
    mainCurrency: MainCurrency;
    taxes: Tax[];
    logo: string | null;
    legalEntity: any | null;
    subscriptionId: string;
}

export interface UpdateSocietyRequest {
    name?: string;
    description?: string;
    isActive?: boolean;
}

export interface GetCodeResponse {
    success: boolean;
    message: string;
    data: Society;
}

export interface SocietyResponse {
    success: boolean;
    message: string;
    data: Society;
}



export const societyService = {
    getCurrent: async (): Promise<GetCodeResponse> => {
        const response = await api.get<GetCodeResponse>(`/sales/societies/current`);
        if (response.data.success) {
            useSocietyStore.getState().setSociety(response.data.data);
        }
        return response.data;
    },

    put: async (id: string, data: UpdateSocietyRequest): Promise<SocietyResponse> => {
        const response = await api.put<SocietyResponse>(`/sales/societies/${id}`, data);
        return response.data;
    }
};
