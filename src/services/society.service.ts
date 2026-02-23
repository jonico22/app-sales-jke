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

export interface LegalEntity {
    id: string;
    businessName: string;
    documentNumber: string;
    fiscalAddress: string | null;
    phoneNumber: string | null;
    email: string | null;
}

export interface Society {
    id: string;
    name: string;
    code: string;
    isActive: boolean;
    legalEntityId: string | null;
    stockNotificationFrequency: string;
    salesNotificationFrequency: string;
    stockNotificationEnabled: boolean;
    salesNotificationEnabled: boolean;
    notificationFrequency: string;
    backupFrequency: string;
    dataRetentionDays: number | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    uiConfig: any | null;
    mainCurrency: MainCurrency;
    taxes: Tax[];
    logo: {
        id: string;
        path: string;
    } | null;
    legalEntity: LegalEntity | null;
    subscriptionId: string;
    storageLimit: string;
}

export interface UpdateSocietyRequest {
    name?: string;
    logo?: string | null;
    logoId?: string | null;
    legalEntity?: {
        businessName?: string | null;
        documentNumber?: string | null;
        fiscalAddress?: string | null;
        phoneNumber?: string | null;
        email?: string | null;
    };
    mainCurrencyId?: string;
    taxValue?: number;
    stockNotificationEnabled?: boolean;
    salesNotificationEnabled?: boolean;
    stockNotificationFrequency?: string;
    salesNotificationFrequency?: string;
    notificationFrequency?: string;
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
