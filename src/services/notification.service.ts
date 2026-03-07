import api from './api.client';

export const NotificationType = {
    INFO: 'INFO',
    SUCCESS: 'SUCCESS',
    WARNING: 'WARNING',
    ERROR: 'ERROR',
    SYSTEM: 'SYSTEM'
} as const;

export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

export const NotificationPriority = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    URGENT: 'URGENT'
} as const;

export type NotificationPriority = typeof NotificationPriority[keyof typeof NotificationPriority];

export interface Notification {
    id: string;
    type: NotificationType;
    priority: NotificationPriority;
    title: string;
    message: string;
    data?: any;
    link?: string;
    metadata?: any;
    isRead: boolean;
    userId: string;
    createdAt: string;
    updatedAt: string;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface NotificationsResponse {
    success: boolean;
    message: string;
    data: {
        items: Notification[];
        total: number;
        page: number;
        totalPages: number;
    };
}

export interface NotificationResponse {
    success: boolean;
    message: string;
    data: Notification;
}

export interface UnreadCountResponse {
    success: boolean;
    message: string;
    data: number | {
        count: number;
    };
}

export const notificationService = {
    // Get all notifications with pagination and filters
    getAll: async (params?: {
        page?: number;
        limit?: number;
        read?: boolean;
        type?: NotificationType | 'all';
        search?: string;
        startDate?: string;
        endDate?: string;
    }) => {
        const response = await api.get<NotificationsResponse>('/notifications', { params });
        return response.data;
    },

    // Get unread notifications count
    getUnreadCount: async () => {
        const response = await api.get<UnreadCountResponse>('/notifications/unread-count');
        return response.data;
    },

    // Mark a notification as read
    markAsRead: async (id: string) => {
        const response = await api.patch<NotificationResponse>(`/notifications/${id}/read`);
        return response.data;
    },

    // Mark all notifications as read
    markAllAsRead: async () => {
        const response = await api.patch<{ success: boolean; message: string }>('/notifications/mark-all-read');
        return response.data;
    },

    // Delete a notification
    delete: async (id: string) => {
        const response = await api.delete<{ success: boolean; message: string }>(`/notifications/${id}`);
        return response.data;
    }
};
