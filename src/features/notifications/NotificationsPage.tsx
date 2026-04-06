import { useNavigate } from 'react-router-dom';
import { useNotificationsQuery } from '@/hooks/useNotificationsQuery';
import { useUnreadCount } from '@/hooks/useUnreadCount';
import { type Notification, NotificationType } from '@/services/notification.service';
import { downloadFileFromUrl } from '@/utils/download.utils';

// Hooks
import { useNotificationsFilters } from './hooks/useNotificationsFilters';
import { useNotificationMutations } from './hooks/useNotificationMutations';

// Components
import { NotificationHeader } from './components/NotificationHeader';
import { NotificationFilters } from './components/NotificationFilters';
import { NotificationList } from './components/NotificationList';
import { NotificationPagination } from './components/NotificationPagination';

export default function NotificationsPage() {
    const navigate = useNavigate();
    
    const {
        page,
        setPage,
        search,
        setSearch,
        typeFilter,
        setTypeFilter,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        clearFilters,
        queryParams
    } = useNotificationsFilters();

    const { 
        markAllAsRead, 
        markAsRead, 
        deleteNotification 
    } = useNotificationMutations();

    const { data: response, isLoading: loading, isRefetching } = useNotificationsQuery(queryParams);
    const { data: unreadCount = 0 } = useUnreadCount();

    const notifications = response?.data?.items || [];
    const total = response?.data?.total || 0;
    const totalPages = response?.data?.totalPages || 1;

    const handleNotificationAction = async (notification: Notification) => {
        const isAlreadyRead = notification.read ?? notification.isRead;

        if (!isAlreadyRead) {
            markAsRead(notification.id);
        }

        if (notification.type === NotificationType.SYSTEM) {
            if (notification.link) {
                downloadFileFromUrl(notification.link);
            }
        } else if (notification.link) {
            if (notification.link.startsWith('http')) {
                window.open(notification.link, '_blank');
            } else {
                navigate(notification.link);
            }
        }
    };

    const hasFilters = !!(search || typeFilter !== 'all' || startDate || endDate);

    return (
        <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto pb-10 px-4 sm:px-0">
            <NotificationHeader 
                unreadCount={unreadCount}
                hasFilters={hasFilters}
                onMarkAllAsRead={() => markAllAsRead()}
                onClearFilters={clearFilters}
            />

            <NotificationFilters 
                search={search}
                onSearchChange={setSearch}
                typeFilter={typeFilter}
                onTypeFilterChange={setTypeFilter}
                startDate={startDate}
                onStartDateChange={setStartDate}
                endDate={endDate}
                onEndDateChange={setEndDate}
            />

            <NotificationList 
                notifications={notifications}
                loading={loading}
                isRefetching={isRefetching}
                onAction={handleNotificationAction}
                onDelete={(e, id) => {
                    e.stopPropagation();
                    deleteNotification(id);
                }}
            />

            <NotificationPagination 
                page={page}
                totalPages={totalPages}
                totalItems={total}
                currentItemsCount={notifications.length}
                onPageChange={setPage}
            />
        </div>
    );
}
