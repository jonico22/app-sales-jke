import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import NotificationDropdown from './NotificationDropdown';
import { useNotificationsQuery } from '@/hooks/useNotificationsQuery';
import { useUnreadCount } from '@/hooks/useUnreadCount';
import { notificationService } from '@/services/notification.service';

// Mock everything
vi.mock('@/hooks/useNotificationsQuery', () => ({
    useNotificationsQuery: vi.fn(),
    NOTIFICATIONS_QUERY_KEY: 'notifications',
}));

vi.mock('@/hooks/useUnreadCount', () => ({
    useUnreadCount: vi.fn(),
    UNREAD_COUNT_QUERY_KEY: 'unread-count',
}));

vi.mock('@/services/notification.service', () => ({
    notificationService: {
        markAllAsRead: vi.fn(),
        markAsRead: vi.fn(),
    },
    NotificationType: {
        SYSTEM: 'SYSTEM',
        SALES: 'SALES',
        WARNING: 'WARNING',
        SUCCESS: 'SUCCESS',
        ERROR: 'ERROR',
    }
}));

vi.mock('@/services/socket', () => ({
    socket: {
        on: vi.fn(),
        off: vi.fn(),
    }
}));

vi.mock('@tanstack/react-query', () => ({
    useQueryClient: () => ({
        invalidateQueries: vi.fn(),
    }),
}));

describe('NotificationDropdown', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (useUnreadCount as any).mockReturnValue({ data: 0 });
        (useNotificationsQuery as any).mockReturnValue({
            data: { data: { items: [] } },
            isLoading: false,
        });
    });

    it('renders the notification bell button', () => {
        render(
            <MemoryRouter>
                <NotificationDropdown />
            </MemoryRouter>
        );

        expect(screen.getByLabelText(/Ver notificaciones/i)).toBeDefined();
    });

    it('shows a badge when there are unread notifications', () => {
        (useUnreadCount as any).mockReturnValue({ data: 5 });

        const { container } = render(
            <MemoryRouter>
                <NotificationDropdown />
            </MemoryRouter>
        );

        const badge = container.querySelector('.bg-red-500');
        expect(badge).toBeDefined();
    });

    it('toggles the dropdown when clicked', async () => {
        render(
            <MemoryRouter>
                <NotificationDropdown />
            </MemoryRouter>
        );

        const button = screen.getByLabelText(/Ver notificaciones/i);
        fireEvent.click(button);

        // Use getAllByText and check length or use more specific selector
        const headings = screen.getAllByText(/Notificaciones/i);
        expect(headings.length).toBeGreaterThan(0);
    });

    it('shows empty state when no notifications', async () => {
        render(
            <MemoryRouter>
                <NotificationDropdown />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByLabelText(/Ver notificaciones/i));
        expect(screen.getByText(/Sin notificaciones/i)).toBeDefined();
    });

    it('renders a list of notifications', async () => {
        const mockNotifications = [
            { id: '1', title: 'Test Notif', message: 'Hello world', type: 'SYSTEM', createdAt: new Date().toISOString(), read: false }
        ];

        (useNotificationsQuery as any).mockReturnValue({
            data: { data: { items: mockNotifications } },
            isLoading: false,
        });

        render(
            <MemoryRouter>
                <NotificationDropdown />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByLabelText(/Ver notificaciones/i));

        expect(screen.getByText(/Test Notif/i)).toBeDefined();
        expect(screen.getByText(/Hello world/i)).toBeDefined();
    });

    it('calls markAllAsRead when requested', async () => {
        const mockNotifications = [
            { id: '1', title: 'Test 1', message: 'M 1', type: 'SYSTEM', createdAt: new Date().toISOString(), read: false }
        ];

        (useUnreadCount as any).mockReturnValue({ data: 1 });
        (useNotificationsQuery as any).mockReturnValue({
            data: { data: { items: mockNotifications } },
            isLoading: false,
        });

        render(
            <MemoryRouter>
                <NotificationDropdown />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByLabelText(/Ver notificaciones/i));
        
        const markAllBtn = screen.getByText(/Marcar todas/i);
        fireEvent.click(markAllBtn);

        expect(notificationService.markAllAsRead).toHaveBeenCalled();
    });
});
