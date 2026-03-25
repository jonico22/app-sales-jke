import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    AlertTriangle,
    CheckCircle2,
    Info,
    XCircle,
    Download,
    BellOff,
    Loader2,
    Trash2,
    X,
    CheckCheck,
    Calendar,
    Bell,
    ShoppingBag
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    notificationService,
    type Notification,
    NotificationType
} from '@/services/notification.service';
import { useNotificationsQuery } from '@/hooks/useNotificationsQuery';
import { useQueryClient } from '@tanstack/react-query';
import { useUnreadCount } from '@/hooks/useUnreadCount';
import {
    Button,
    Input,
    Card,
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    Badge
} from '@/components/ui';
import { DatePickerInput } from '@/components/shared/DatePickerInput';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { downloadFileFromUrl } from '@/utils/download.utils';

export default function NotificationsPage() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const limit = 10;

    // Filters
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<NotificationType | 'all'>('all');
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    // Sync debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const { data: response, isLoading: loading, isRefetching } = useNotificationsQuery({
        page,
        limit,
        search: debouncedSearch || undefined,
        type: typeFilter === 'all' ? undefined : typeFilter,
        startDate: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
        endDate: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
    });

    const { data: unreadCount = 0 } = useUnreadCount();

    const notifications = response?.data?.items || [];
    const total = response?.data?.total || 0;
    const totalPages = response?.data?.totalPages || 1;

    // Page reset on filter change
    useEffect(() => {
        setPage(1);
    }, [typeFilter, startDate, endDate]);

    const getIcon = (type: NotificationType) => {
        switch (type) {
            case NotificationType.WARNING: return <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />;
            case NotificationType.SUCCESS: return <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />;
            case NotificationType.ERROR: return <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-rose-500" />;
            case NotificationType.SYSTEM: return <Download className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500" />;
            case NotificationType.SALES: return <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500" />;
            default: return <Info className="h-4 w-4 sm:h-5 sm:w-5 text-sky-500" />;
        }
    };

    const getBgColor = (type: NotificationType) => {
        switch (type) {
            case NotificationType.WARNING: return 'bg-amber-500/10 border-amber-500/20';
            case NotificationType.SUCCESS: return 'bg-emerald-500/10 border-emerald-500/20';
            case NotificationType.ERROR: return 'bg-rose-500/10 border-rose-500/20';
            case NotificationType.SYSTEM: return 'bg-slate-500/10 border-slate-500/20';
            case NotificationType.SALES: return 'bg-indigo-500/10 border-indigo-500/20';
            default: return 'bg-sky-500/10 border-sky-500/20';
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            toast.success('Todas las notificaciones marcadas como leídas');
        } catch (error) {
            console.error('Error marking all as read:', error);
            toast.error('Error al marcar todas como leídas');
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        try {
            await notificationService.delete(id);
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            toast.success('Notificación eliminada');
        } catch (error) {
            console.error('Error deleting notification:', error);
            toast.error('Error al eliminar la notificación');
        }
    };

    const handleNotificationAction = async (notification: Notification) => {
        const isAlreadyRead = notification.read ?? notification.isRead;

        if (!isAlreadyRead) {
            try {
                await notificationService.markAsRead(notification.id);
                queryClient.invalidateQueries({ queryKey: ['notifications'] });
            } catch (error) {
                console.error('Error marking as read:', error);
            }
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

    const clearFilters = () => {
        setSearch('');
        setDebouncedSearch('');
        setTypeFilter('all');
        setStartDate(null);
        setEndDate(null);
        setPage(1);
    };

    const types = [
        { label: 'Todas las categorías', value: 'all' },
        { label: 'Ventas', value: NotificationType.SALES },
        { label: 'Información', value: NotificationType.INFO },
        { label: 'Éxito', value: NotificationType.SUCCESS },
        { label: 'Advertencia', value: NotificationType.WARNING },
        { label: 'Error', value: NotificationType.ERROR },
        { label: 'Sistema', value: NotificationType.SYSTEM },
    ];

    return (
        <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto pb-10 px-4 sm:px-0">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-foreground uppercase tracking-tight flex items-center gap-3">
                        <Bell className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                        Historial de Notificaciones
                    </h1>
                    <p className="text-muted-foreground text-[10px] sm:text-sm mt-1 font-medium">
                        Administra tus alertas y mensajes de sistema en un solo lugar.
                    </p>
                </div>
                
                <div className="flex flex-row md:flex-row items-center gap-2 sm:gap-3 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
                    {unreadCount > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="bg-primary/5 border-primary/20 text-primary hover:bg-primary/10 rounded-xl font-bold h-9 sm:h-10 px-3 sm:px-4 text-[10px] sm:text-xs whitespace-nowrap"
                            onClick={handleMarkAllAsRead}
                        >
                            <CheckCheck className="h-3.5 w-3.5 mr-1.5 sm:mr-2" />
                            Marcar todo como leído
                        </Button>
                    )}
                    
                    {(search || typeFilter !== 'all' || startDate || endDate) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/5 h-9 sm:h-10 px-3 sm:px-4 rounded-xl text-[10px] sm:text-xs whitespace-nowrap"
                            onClick={clearFilters}
                        >
                            <X className="h-3.5 w-3.5 mr-1.5 sm:mr-2" />
                            Limpiar
                        </Button>
                    )}
                </div>
            </div>

            {/* Compact Filters Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 bg-card/60 backdrop-blur-md p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] border border-border/50 shadow-xl shadow-slate-200/20 dark:shadow-none">
                <div className="lg:col-span-4 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Buscar..."
                        className="pl-12 bg-muted/50 border-transparent h-10 sm:h-12 text-sm rounded-xl sm:rounded-2xl focus:bg-background transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="lg:col-span-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full h-10 sm:h-12 justify-between bg-muted/50 border-transparent rounded-xl sm:rounded-2xl px-5 text-sm font-medium text-muted-foreground hover:bg-muted transition-all">
                                <div className="flex items-center gap-3">
                                    <Filter className="h-4 w-4 text-primary/60" />
                                    <span className="truncate max-w-[120px]">{types.find(t => t.value === typeFilter)?.label}</span>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground/30 rotate-90" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-64 rounded-xl p-2 shadow-2xl border-border/50 backdrop-blur-xl">
                            {types.map((type) => (
                                <DropdownMenuItem
                                    key={type.value}
                                    onClick={() => setTypeFilter(type.value as any)}
                                    className={cn(
                                        "rounded-lg py-2 px-4 text-sm mb-1 transition-colors",
                                        typeFilter === type.value 
                                            ? "bg-primary text-primary-foreground font-bold" 
                                            : "hover:bg-primary/10 text-muted-foreground"
                                    )}
                                >
                                    {type.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="lg:col-span-5 grid grid-cols-2 gap-2 sm:gap-3">
                    <DatePickerInput
                        value={startDate}
                        onChange={setStartDate}
                        placeholder="Desde"
                        className="h-10 sm:h-12 bg-muted/50 border-transparent rounded-xl sm:rounded-2xl text-xs sm:text-sm"
                    />
                    <DatePickerInput
                        value={endDate}
                        onChange={setEndDate}
                        placeholder="Hasta"
                        className="h-10 sm:h-12 bg-muted/50 border-transparent rounded-xl sm:rounded-2xl text-xs sm:text-sm"
                    />
                </div>
            </div>

            {/* Notifications List */}
            <div className="relative">
                {isRefetching && !loading && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 transition-all animate-in fade-in zoom-in">
                        <Badge variant="outline" className="bg-background/80 backdrop-blur-md border-primary/20 text-primary px-3 py-1 rounded-full shadow-lg flex items-center gap-2">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Sincronizando...
                        </Badge>
                    </div>
                )}

                <div className="grid gap-3 sm:gap-4">
                    {loading ? (
                        <div className="py-20 bg-card rounded-2xl sm:rounded-[2rem] border border-border/50 flex flex-col items-center justify-center text-muted-foreground shadow-sm">
                            <Loader2 className="h-10 w-10 animate-spin text-primary/40 mb-4" />
                            <p className="font-bold text-xs sm:text-sm tracking-wide uppercase">Cargando alertas...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="py-20 bg-card rounded-2xl sm:rounded-[2rem] border border-border/50 flex flex-col items-center justify-center text-center px-10 shadow-sm">
                            <div className="bg-muted/30 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] mb-6 border border-border/20">
                                <BellOff className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/20" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-black text-foreground uppercase tracking-tight">Sin notificaciones</h3>
                            <p className="text-muted-foreground text-xs sm:text-sm max-w-sm mx-auto mt-2 font-medium">
                                No tienes notificaciones en este momento.
                            </p>
                        </div>
                    ) : (
                        notifications.map((notif) => {
                            const isUnread = !(notif.read ?? notif.isRead);
                            return (
                                <div
                                    key={notif.id}
                                    onClick={() => handleNotificationAction(notif)}
                                    className={cn(
                                        "group relative flex items-start gap-4 sm:gap-6 p-4 sm:p-6 transition-all duration-300 cursor-pointer overflow-hidden",
                                        "bg-card rounded-xl sm:rounded-[1.5rem] border border-border/50 hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5",
                                        isUnread ? "bg-gradient-to-r from-primary/[0.04] to-transparent ring-1 ring-primary/20" : "opacity-90"
                                    )}
                                >
                                    {/* Unread Accent */}
                                    {isUnread && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-full sm:h-12 w-1 sm:w-1 bg-primary rounded-r-full shadow-[0_0_10px_theme(colors.primary.DEFAULT)]" />
                                    )}

                                    {/* Icon */}
                                    <div className={cn(
                                        "h-10 w-10 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl border flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110",
                                        getBgColor(notif.type)
                                    )}>
                                        {getIcon(notif.type)}
                                    </div>

                                    {/* Content Area */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className={cn(
                                                "text-[13px] sm:text-sm tracking-tight truncate flex-1",
                                                isUnread ? "font-black text-foreground" : "font-bold text-muted-foreground"
                                            )}>
                                                {notif.title}
                                            </h3>
                                            {isUnread && (
                                                <div className="bg-primary h-1.5 w-1.5 rounded-full shrink-0 animate-pulse block sm:hidden" />
                                            )}
                                            {isUnread && (
                                                <Badge className="bg-primary text-[8px] sm:text-[10px] h-4 sm:h-5 font-black uppercase px-1.5 rounded-md hidden sm:flex">Nuevo</Badge>
                                            )}
                                        </div>
                                        <p className={cn(
                                            "text-xs sm:text-sm leading-relaxed",
                                            isUnread ? "text-foreground/90 font-medium" : "text-muted-foreground"
                                        )}>
                                            {notif.message}
                                        </p>
                                        
                                        <div className="flex items-center gap-4 mt-3 sm:mt-4">
                                            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-muted-foreground/50 uppercase tracking-widest whitespace-nowrap">
                                                <Calendar className="h-3 w-3" />
                                                {(() => {
                                                    if (!notif.createdAt) return '-';
                                                    const d = new Date(notif.createdAt);
                                                    if (isNaN(d.getTime())) return '-';
                                                    return format(d, "eee, dd MMMM HH:mm", { locale: es });
                                                })()}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col items-center gap-3 flex-shrink-0 self-center">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 sm:h-11 sm:w-11 rounded-lg sm:rounded-2xl bg-destructive/5 text-destructive hover:text-white hover:bg-destructive transition-all duration-300 shadow-sm"
                                            onClick={(e) => handleDelete(e, notif.id)}
                                        >
                                            <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                                        </Button>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>

            {/* Compact Pagination */}
            {!loading && notifications.length > 0 && (
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-4 sm:px-6 py-4 sm:py-6 bg-card/40 rounded-2xl sm:rounded-[2rem] border border-border/40 backdrop-blur-sm">
                    <p className="text-[10px] sm:text-xs text-muted-foreground font-bold uppercase tracking-widest text-center sm:text-left">
                         Mostrando <span className="text-primary">{notifications.length}</span> de <span className="text-primary">{total}</span>
                    </p>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 sm:h-11 sm:w-11 rounded-lg sm:rounded-xl border-border/50"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>

                        <div className="flex items-center gap-1 sm:gap-2">
                            {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
                                const pageNum = i + 1;
                                return (
                                    <Button
                                        key={pageNum}
                                        variant={page === pageNum ? "primary" : "ghost"}
                                        className={cn(
                                            "h-9 w-9 sm:h-11 sm:w-11 rounded-lg sm:rounded-xl font-black text-xs sm:text-sm",
                                            page === pageNum && "shadow-lg shadow-primary/30"
                                        )}
                                        onClick={() => setPage(pageNum)}
                                    >
                                        {pageNum}
                                    </Button>
                                );
                            })}
                        </div>

                        <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 sm:h-11 sm:w-11 rounded-lg sm:rounded-xl border-border/50"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                        >
                            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
