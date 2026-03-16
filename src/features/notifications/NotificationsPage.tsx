import { useState, useEffect } from 'react';
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
    X
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    notificationService,
    type Notification,
    NotificationType
} from '@/services/notification.service';
import {
    Button,
    Input,
    Card,
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem
} from '@/components/ui';
import { DatePickerInput } from '@/components/shared/DatePickerInput';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { downloadFileFromUrl } from '@/utils/download.utils';

const CardContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
);

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10;

    // Filters
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<NotificationType | 'all'>('all');
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await notificationService.getAll({
                page,
                limit,
                search: search || undefined,
                type: typeFilter === 'all' ? undefined : typeFilter,
                startDate: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
                endDate: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
            });

            if (response.success) {
                setNotifications(response.data.items);
                setTotal(response.data.total);
                setTotalPages(response.data.totalPages);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            toast.error('Error al cargar notificaciones');
        } finally {
            setLoading(false);
        }
    };

    // Debounced effect for filtering
    useEffect(() => {
        const timer = setTimeout(() => {
            if (page !== 1) {
                setPage(1);
            } else {
                fetchNotifications();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [search, typeFilter, startDate, endDate]);

    // Effect for pagination
    useEffect(() => {
        fetchNotifications();
    }, [page]);

    const getIcon = (type: NotificationType) => {
        switch (type) {
            case NotificationType.WARNING:
                return <AlertTriangle className="h-5 w-5 text-orange-500" />;
            case NotificationType.SUCCESS:
                return <CheckCircle2 className="h-5 w-5 text-green-500" />;
            case NotificationType.ERROR:
                return <XCircle className="h-5 w-5 text-red-500" />;
            case NotificationType.SYSTEM:
                return <Download className="h-5 w-5 text-muted-foreground" />;
            case NotificationType.INFO:
            default:
                return <Info className="h-5 w-5 text-blue-500" />;
        }
    };

    const getBgColor = (type: NotificationType) => {
        switch (type) {
            case NotificationType.WARNING: return 'bg-orange-500/10';
            case NotificationType.SUCCESS: return 'bg-green-500/10';
            case NotificationType.ERROR: return 'bg-red-500/10';
            case NotificationType.SYSTEM: return 'bg-muted/50';
            case NotificationType.INFO:
            default: return 'bg-blue-500/10';
        }
    };

    const handleNotificationAction = async (notification: Notification) => {
        if (notification.type === NotificationType.SYSTEM) {
            if (notification.link) {
                downloadFileFromUrl(notification.link);
            }
        } else if (notification.link) {
            window.location.href = notification.link;
        }

        if (!notification.isRead) {
            try {
                await notificationService.markAsRead(notification.id);
                setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n));
            } catch (error) {
                console.error('Error marking as read:', error);
            }
        }
    };

    const clearFilters = () => {
        setSearch('');
        setTypeFilter('all');
        setStartDate(null);
        setEndDate(null);
    };

    const types = [
        { label: 'Todas las categorías', value: 'all' },
        { label: 'Información', value: NotificationType.INFO },
        { label: 'Éxito', value: NotificationType.SUCCESS },
        { label: 'Advertencia', value: NotificationType.WARNING },
        { label: 'Error', value: NotificationType.ERROR },
        { label: 'Sistema', value: NotificationType.SYSTEM },
    ];

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-lg font-bold text-foreground uppercase tracking-tight">Historial de Notificaciones</h1>
                    <p className="text-muted-foreground text-xs mt-1">
                        Revise todas las alertas, actualizaciones de pedidos y mensajes del sistema.
                    </p>
                </div>
                {(search || typeFilter !== 'all' || startDate || endDate) && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 w-fit"
                        onClick={clearFilters}
                    >
                        <X className="h-4 w-4 mr-2" />
                        Limpiar filtros
                    </Button>
                )}
            </div>

            {/* Filters Bar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm">
                <div className="lg:col-span-4 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                    <Input
                        placeholder="Buscar por titulo..."
                        className="pl-10 bg-muted/30 border-border h-10 text-xs rounded-xl focus:bg-background transition-colors"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="lg:col-span-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full h-10 justify-between bg-muted/30 border-border rounded-xl px-4 text-xs text-muted-foreground hover:bg-muted">
                                <div className="flex items-center gap-2">
                                    <Filter className="h-3.5 w-3.5 text-muted-foreground/50" />
                                    <span>{types.find(t => t.value === typeFilter)?.label}</span>
                                </div>
                                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 rotate-90" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                            {types.map((type) => (
                                <DropdownMenuItem
                                    key={type.value}
                                    onClick={() => setTypeFilter(type.value as any)}
                                    className={cn(typeFilter === type.value && "bg-sky-50 text-sky-600 font-semibold")}
                                >
                                    {type.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="lg:col-span-5 flex gap-2">
                    <DatePickerInput
                        value={startDate}
                        onChange={setStartDate}
                        placeholder="Fecha desde"
                        className="h-11"
                    />
                    <DatePickerInput
                        value={endDate}
                        onChange={setEndDate}
                        placeholder="Fecha hasta"
                        className="h-11"
                    />
                </div>
            </div>

            {/* Notifications List */}
            <Card className="overflow-hidden rounded-2xl">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
                            <Loader2 className="h-10 w-10 animate-spin mb-4" />
                            <p className="font-medium text-sm">Cargando notificaciones...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="py-20 flex flex-col items-center justify-center text-center px-6">
                            <div className="bg-muted/50 p-6 rounded-full mb-4 border border-border">
                                <BellOff className="h-12 w-12 text-muted-foreground/30" />
                            </div>
                            <h3 className="text-base font-bold text-foreground">Sin notificaciones</h3>
                            <p className="text-muted-foreground text-xs max-w-xs mx-auto mt-2">
                                No se encontraron notificaciones que coincidan con sus criterios de búsqueda.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/50">
                            {notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    onClick={() => handleNotificationAction(notif)}
                                    className={cn(
                                        "p-5 flex gap-5 hover:bg-muted/30 transition-colors cursor-pointer group relative",
                                        !notif.isRead && "bg-sky-50/20"
                                    )}
                                >
                                    {/* Unread Indicator Line */}
                                    {!notif.isRead && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-sky-500" />
                                    )}

                                    {/* Icon */}
                                    <div className={cn(
                                        "h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110",
                                        getBgColor(notif.type)
                                    )}>
                                        {getIcon(notif.type)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className={cn(
                                                "text-[12px] truncate",
                                                !notif.isRead ? "font-bold text-foreground" : "font-semibold text-muted-foreground"
                                            )}>
                                                {notif.title}
                                            </h3>
                                            {!notif.isRead && (
                                                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                            )}
                                        </div>
                                        <p className={cn(
                                            "text-xs line-clamp-2",
                                            !notif.isRead ? "text-foreground/80" : "text-muted-foreground"
                                        )}>
                                            {notif.message}
                                        </p>
                                    </div>

                                    {/* Time */}
                                    <div className="text-right flex-shrink-0">
                                        <div className="text-[10px] font-bold text-muted-foreground bg-muted/50 border border-border px-2 py-1 rounded-md mb-2">
                                            {(() => {
                                                if (!notif.createdAt) return '-';
                                                const d = new Date(notif.createdAt);
                                                if (isNaN(d.getTime())) return '-';
                                                return format(d, "eee, HH:mm", { locale: es });
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Pagination */}
            {!loading && notifications.length > 0 && (
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4">
                    <p className="text-xs text-muted-foreground font-medium">
                        Mostrando <span className="text-foreground font-bold">{(page - 1) * limit + 1}-{Math.min(page * limit, total)}</span> de <span className="text-foreground font-bold">{total}</span> notificaciones
                    </p>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 rounded-lg"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                const pageNum = i + 1;
                                return (
                                    <Button
                                        key={pageNum}
                                        variant={page === pageNum ? "primary" : "ghost"}
                                        size="sm"
                                        className={cn(
                                            "h-9 w-9 rounded-lg font-bold text-xs",
                                            page === pageNum ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "text-muted-foreground"
                                        )}
                                        onClick={() => setPage(pageNum)}
                                    >
                                        {pageNum}
                                    </Button>
                                );
                            })}
                            {totalPages > 5 && <span className="text-slate-400 px-2">...</span>}
                        </div>

                        <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 rounded-lg"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
