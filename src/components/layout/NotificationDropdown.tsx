import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, AlertTriangle, CheckCircle2, Info, XCircle, BellOff, Loader2, Download, ShoppingBag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { notificationService, type Notification, NotificationType } from '@/services/notification.service';
import { socket } from '@/services/socket';
import { toast } from 'sonner';
import { downloadFileFromUrl } from '@/utils/download.utils';
import { useNotificationsQuery, NOTIFICATIONS_QUERY_KEY } from '@/hooks/useNotificationsQuery';
import { useUnreadCount, UNREAD_COUNT_QUERY_KEY } from '@/hooks/useUnreadCount';
import { useQueryClient } from '@tanstack/react-query';

export default function NotificationDropdown() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data: unreadCount = 0 } = useUnreadCount();

    const [isOpen, setIsOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const { data: response, isLoading: loading } = useNotificationsQuery({ 
        limit: 10, 
        read: false 
    });
    
    const notifications = response?.data?.items || [];

    // Initial effect for socket listeners
    useEffect(() => {
        // Listen for real-time notifications
        socket.on('ui_notification', (newNotification: Notification) => {
            console.log("Nueva notificación recibida:", newNotification);

            // Invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });

            // Trigger animation
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 1000);

            // Show toast only for SYSTEM or SALES notifications
            if (newNotification.type === NotificationType.SYSTEM || newNotification.type === NotificationType.SALES) {
                toast(newNotification.title, {
                    description: newNotification.message,
                    action: {
                        label: 'Ver',
                        onClick: () => {
                            if (newNotification.link) {
                                if (newNotification.type === 'SYSTEM') {
                                    downloadFileFromUrl(newNotification.link);
                                } else {
                                    navigate(newNotification.link);
                                }
                            }
                            setIsOpen(true);
                        }
                    }
                });
            }
        });

        return () => {
            socket.off('ui_notification');
        };
    }, [navigate, queryClient]);

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
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            
            // Re-fetch or update cache
            queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
            
            toast.success('Todas las notificaciones marcadas como leídas');
        } catch (error) {
            console.error('Error marking all as read:', error);
            toast.error('Error al marcar como leídas');
        }
    };

    const handleNotificationClick = async (notification: Notification) => {
        // Handle action based on type
        if (notification.type === NotificationType.SYSTEM) {
            const url = notification.link || notification.metadata?.downloadUrl;
            if (url) downloadFileFromUrl(url);
            else toast.error('El enlace de descarga no está disponible');
            setIsOpen(false);
        } else {
            let targetLink = notification.link;
            if (!targetLink && notification.metadata?.orderId) {
                targetLink = `/orders/history?id=${notification.metadata.orderId}`;
            }

            if (targetLink) {
                navigate(targetLink);
                setIsOpen(false);
            } else {
                setIsOpen(false);
            }
        }

        // Mark as read if not already
        const isRead = notification.read ?? notification.isRead;
        if (!isRead) {
            try {
                await notificationService.markAsRead(notification.id);
                // Invalidate to refresh counts and lists
                queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
                queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
            } catch (error) {
                console.error('Error marking as read:', error);
            }
        }
    };

    const getIcon = (type: NotificationType) => {
        switch (type) {
            case NotificationType.WARNING: return <AlertTriangle className="h-5 w-5 text-orange-500" />;
            case NotificationType.SUCCESS: return <CheckCircle2 className="h-5 w-5 text-green-500" />;
            case NotificationType.ERROR: return <XCircle className="h-5 w-5 text-red-500" />;
            case NotificationType.SYSTEM: return <Download className="h-5 w-5 text-slate-600" />;
            case NotificationType.SALES: return <ShoppingBag className="h-5 w-5 text-indigo-500" />;
            default: return <Info className="h-5 w-5 text-blue-500" />;
        }
    };

    const getBgColor = (type: NotificationType) => {
        switch (type) {
            case NotificationType.WARNING: return 'bg-orange-50 group-hover:bg-orange-100';
            case NotificationType.SUCCESS: return 'bg-green-50 group-hover:bg-green-100';
            case NotificationType.ERROR: return 'bg-red-50 group-hover:bg-red-100';
            case NotificationType.SYSTEM: return 'bg-slate-100 group-hover:bg-slate-200';
            case NotificationType.SALES: return 'bg-indigo-50 group-hover:bg-indigo-100';
            default: return 'bg-blue-50 group-hover:bg-blue-100';
        }
    };

    return (
        <div className="relative" ref={containerRef}>
            <button
                className="relative text-muted-foreground hover:text-foreground transition-colors pt-1 px-1"
                onClick={handleToggle}
                aria-label="Ver notificaciones"
            >
                <Bell className={`h-[22px] w-[22px] transition-transform ${isAnimating ? 'animate-bounce text-primary' : ''}`} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-[10px] w-[10px] bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-3 w-80 sm:w-96 bg-card rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-border z-[9999] animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-3 bg-card border-b border-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">Notificaciones</h3>
                            {unreadCount > 0 && (
                                <span className="bg-destructive/10 text-destructive text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-[10px] font-bold text-primary hover:text-primary/80 uppercase tracking-wide"
                            >
                                Marcar todas
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="max-h-[350px] overflow-y-auto">
                        {loading ? (
                            <div className="py-8 flex flex-col items-center justify-center text-muted-foreground">
                                <Loader2 className="h-8 w-8 animate-spin mb-2 text-primary" />
                                <p className="text-xs">Cargando...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="py-12 px-6 flex flex-col items-center justify-center text-center">
                                <div className="bg-muted p-4 rounded-full mb-3">
                                    <BellOff className="h-8 w-8 text-muted-foreground/30" />
                                </div>
                                <p className="text-sm font-semibold text-foreground mb-1">Sin notificaciones</p>
                                <p className="text-xs text-muted-foreground">Estás al día con todas tus novedades.</p>
                            </div>
                        ) : (
                            notifications.map((notification) => {
                                const isRead = notification.read ?? notification.isRead;
                                return (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`px-4 py-3 border-b border-border/60 hover:bg-muted transition-colors cursor-pointer group flex gap-3 ${!isRead ? 'bg-muted/50' : ''}`}
                                    >
                                        <div className={`${getBgColor(notification.type)} p-2 rounded-full h-fit flex-shrink-0 transition-colors`}>
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-0.5">
                                                <p className={`text-sm ${!isRead ? 'font-bold text-foreground' : 'font-semibold text-muted-foreground'} truncate pr-2`}>
                                                    {notification.title}
                                                </p>
                                                {!isRead && (
                                                    <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5 shadow-sm shadow-primary/20"></span>
                                                )}
                                            </div>
                                            <p className={`text-xs ${!isRead ? 'text-foreground/80' : 'text-muted-foreground'} mb-1.5 line-clamp-2`}>
                                                {notification.message}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground font-medium capitalize">
                                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: es })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 bg-muted/50 text-center border-t border-border">
                        <button
                            onClick={() => {
                                navigate('/notifications');
                                setIsOpen(false);
                            }}
                            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Ver historial completo
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
