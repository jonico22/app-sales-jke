import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, AlertTriangle, CheckCircle2, Info, XCircle, BellOff, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { notificationService, type Notification, NotificationType } from '@/services/notification.service';
import { socket } from '@/services/socket';
import { toast } from 'sonner';

export default function NotificationDropdown() {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const [notifsData, countData] = await Promise.all([
                notificationService.getAll({ limit: 10, read: false }),
                notificationService.getUnreadCount()
            ]);
            setNotifications(notifsData.data.items);
            setUnreadCount(countData.data.count);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            toast.error('Error al cargar notificaciones');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();

        // Listen for real-time notifications
        socket.on('ui_notification', (newNotification: Notification) => {
            console.log("Nueva notificación recibida:", newNotification);

            // Trigger animation
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 1000);

            // Show toast
            toast(newNotification.title, {
                description: newNotification.message,
                action: {
                    label: 'Ver',
                    onClick: () => {
                        if (newNotification.link) {
                            navigate(newNotification.link);
                        }
                        setIsOpen(true);
                    }
                }
            });

            // Update state
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);
        });

        return () => {
            socket.off('ui_notification');
        };
    }, [navigate]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleToggle = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            // Refresh when opening
            fetchNotifications();
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
            toast.success('Todas las notificaciones marcadas como leídas');
        } catch (error) {
            console.error('Error marking all as read:', error);
            toast.error('Error al marcar como leídas');
        }
    };

    const handleNotificationClick = async (notification: Notification) => {
        console.log("[NotificationDropdown] Clicked notification:", notification);

        // Resolve target link
        let targetLink = notification.link;
        if (!targetLink && notification.metadata?.orderId) {
            targetLink = `/orders/history?id=${notification.metadata.orderId}`;
        }

        // Navigate if link exists
        if (targetLink) {
            console.log("[NotificationDropdown] Navigating to:", targetLink);
            navigate(targetLink);
            setIsOpen(false);
        } else {
            console.warn("[NotificationDropdown] No link found for notification");
            // Still close dropdown? Maybe not if user wanted to do something.
            // But usually clicking means interaction done.
            // Let's keep it open if no action taken, or close it?
            // "no me lleva la pagina ni me cierra el dropdown" implies expected behavior is closing.
            setIsOpen(false);
        }

        // Mark as read if not already
        if (!notification.isRead) {
            try {
                await notificationService.markAsRead(notification.id);
                setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            } catch (error) {
                console.error('Error marking as read:', error);
            }
        }
    };

    const getIcon = (type: NotificationType) => {
        switch (type) {
            case NotificationType.WARNING:
                return <AlertTriangle className="h-5 w-5 text-orange-500" />;
            case NotificationType.SUCCESS:
                return <CheckCircle2 className="h-5 w-5 text-green-500" />;
            case NotificationType.ERROR:
                return <XCircle className="h-5 w-5 text-red-500" />;
            case NotificationType.INFO:
            default:
                return <Info className="h-5 w-5 text-blue-500" />;
        }
    };

    const getBgColor = (type: NotificationType) => {
        switch (type) {
            case NotificationType.WARNING: return 'bg-orange-50 group-hover:bg-orange-100';
            case NotificationType.SUCCESS: return 'bg-green-50 group-hover:bg-green-100';
            case NotificationType.ERROR: return 'bg-red-50 group-hover:bg-red-100';
            case NotificationType.INFO:
            default: return 'bg-blue-50 group-hover:bg-blue-100';
        }
    };

    return (
        <div className="relative" ref={containerRef}>
            <button
                className="relative text-slate-500 hover:text-slate-700 transition-colors pt-1"
                onClick={handleToggle}
            >
                <Bell className={`h-6 w-6 transition-transform ${isAnimating ? 'animate-bounce text-sky-500' : ''}`} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white translate-x-1/4 -translate-y-1/4 animate-pulse"></span>
                )}
            </button>

            {/* Notification Dropdown */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-3 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-100 z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-800 text-sm">Notificaciones</h3>
                            {unreadCount > 0 && (
                                <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-[10px] font-bold text-[#0ea5e9] hover:text-sky-700 uppercase tracking-wide"
                            >
                                Marcar todas como leídas
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="max-h-[350px] overflow-y-auto">
                        {loading ? (
                            <div className="py-8 flex flex-col items-center justify-center text-slate-400">
                                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                                <p className="text-xs">Cargando notificaciones...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="py-12 px-6 flex flex-col items-center justify-center text-center">
                                <div className="bg-slate-50 p-4 rounded-full mb-3">
                                    <BellOff className="h-8 w-8 text-slate-300" />
                                </div>
                                <p className="text-sm font-semibold text-slate-700 mb-1">¡Todo está tranquilo!</p>
                                <p className="text-xs text-slate-400">No tienes nuevas notificaciones por el momento. Disfruta tu día.</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`px-4 py-3 border-b border-slate-100/60 hover:bg-slate-50 transition-colors cursor-pointer group flex gap-3 ${!notification.isRead ? 'bg-slate-50/50' : ''}`}
                                >
                                    <div className={`${getBgColor(notification.type)} p-2 rounded-full h-fit flex-shrink-0 transition-colors`}>
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-0.5">
                                            <p className={`text-sm ${!notification.isRead ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'} truncate pr-2`}>
                                                {notification.title}
                                            </p>
                                            {!notification.isRead && (
                                                <span className="h-2 w-2 rounded-full bg-[#0ea5e9] flex-shrink-0 mt-1.5 shadow-sm shadow-sky-200"></span>
                                            )}
                                        </div>
                                        <p className={`text-xs ${!notification.isRead ? 'text-slate-600' : 'text-slate-500'} mb-1.5 line-clamp-2`}>
                                            {notification.message}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-medium capitalize">
                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: es })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="px-4 py-3 bg-slate-50/50 text-center border-t border-slate-100">
                            <button className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors">
                                Ver historial completo
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
