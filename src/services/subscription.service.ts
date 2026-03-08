import api from './api.client';

export interface PlanData {
    id: string;
    code: string;
    name: string;
    description: string;
    shortdescription: string;
    features: string[] | null;
    price: number;
    maxUsers: number;
    maxProducts: number;
    storage: number;
    isActive: true;
    serviceId: string;
    frequencyId: string;
    currencyId: string;
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
    isEnabled: boolean;
    createdBy: string | null;
    updatedBy: string | null;
}

export interface SubscriptionRequestData {
    id: string;
    code: string;
    firstName: string;
    lastName: string;
    businessName: string;
    email: string;
    phone: string;
    documentNumber: string | null;
    isBusiness: boolean;
    status: string;
    createdAt: string;
    updatedAt: string;
    tariffId: string;
    createdBy: string | null;
    updatedBy: string | null;
    rejectionid: string | null;
    tariff: any; // Se puede tipar más adelante si es necesario
}

export interface SubscriptionDetails {
    id: string;
    userId: string;
    planId: string;
    status: 'ACTIVE' | 'INACTIVE' | 'CANCELED' | 'EXPIRED' | string;
    startDate: string;
    endDate: string;
    autoRenew: boolean;
    lastRenewalDate: string | null;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
    societyId: string;
    createdBy: string | null;
    updatedBy: string | null;
    requestId: string;
    plan: PlanData;
    request?: SubscriptionRequestData;
    isPublicReview: boolean;
    hasPendingPayment: boolean;
    isNearingExpiration: boolean;
}

export interface AutoRenewResponse {
    id: string;
    autoRenew: boolean;
    status: string;
}

export interface RenewResponse {
    message: string;
    paymentId: string;
    status: string;
}

export interface ReactivateResponse {
    id: string;
    status: string;
    isActive: boolean;
    autoRenew: boolean;
    endDate: string;
}

export interface SubscriptionMovement {
    id: string;
    subscriptionId: string;
    previousPlanId: string | null;
    newPlanId: string;
    movementDate: string;
    previousEndDate: string | null;
    newEndDate: string;
    movementType: string;
    newPlan: {
        id: string;
        name: string;
        code: string;
    };
}

export interface SubscriptionBilling {
    id: string;
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    status: string;
    description: string;
    subscriptionMovement?: {
        movementType: string;
        newPlan?: {
            name: string;
        }
    }
}

export const subscriptionService = {
    getSubscriptionDetails: async (subscriptionId: string): Promise<SubscriptionDetails> => {
        const response = await api.get<SubscriptionDetails>(`/subscriptions/${subscriptionId}`);
        return response.data;
    },
    updateAutoRenew: async (subscriptionId: string, autoRenew: boolean): Promise<AutoRenewResponse> => {
        const response = await api.patch<AutoRenewResponse>(`/subscriptions/${subscriptionId}/auto-renew`, { autoRenew });
        return response.data;
    },
    renewSubscription: async (subscriptionId: string, data: { paymentMethod: string; referenceCode: string; file: File }): Promise<RenewResponse> => {
        const formData = new FormData();
        formData.append("paymentMethod", data.paymentMethod);
        formData.append("referenceCode", data.referenceCode);
        formData.append("file", data.file);

        const response = await api.post<RenewResponse>(`/subscriptions/${subscriptionId}/renew`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },
    reactivateSubscription: async (subscriptionId: string): Promise<ReactivateResponse> => {
        const response = await api.post<ReactivateResponse>(`/subscriptions/${subscriptionId}/reactivate`);
        return response.data;
    },
    cancelSubscription: async (subscriptionId: string, notes?: string): Promise<any> => {
        const response = await api.post(`/subscriptions/${subscriptionId}/cancel`, { notes });
        return response.data;
    },
    getSubscriptionHistory: async (subscriptionId: string): Promise<SubscriptionMovement[]> => {
        const response = await api.get<SubscriptionMovement[]>(`/subscriptions/${subscriptionId}/history`);
        return response.data;
    },
    getSubscriptionBilling: async (subscriptionId: string): Promise<SubscriptionBilling[]> => {
        const response = await api.get<SubscriptionBilling[]>(`/subscriptions/${subscriptionId}/billing`);
        return response.data;
    }
};
