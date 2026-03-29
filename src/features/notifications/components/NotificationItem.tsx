import { 
    AlertTriangle, 
    CheckCircle2, 
    Info, 
    XCircle, 
    Download, 
    ShoppingBag, 
    Trash2, 
    Calendar 
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { type Notification, NotificationType } from '@/services/notification.service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
    notification: Notification;
    onAction: (notification: Notification) => void;
    onDelete: (e: React.MouseEvent, id: string) => void;
}

export function NotificationItem({ notification, onAction, onDelete }: NotificationItemProps) {
    const isUnread = !(notification.read ?? notification.isRead);

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

    return (
        <div
            onClick={() => onAction(notification)}
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
                getBgColor(notification.type)
            )}>
                {getIcon(notification.type)}
            </div>

            {/* Content Area */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className={cn(
                        "text-[13px] sm:text-sm tracking-tight truncate flex-1",
                        isUnread ? "font-black text-foreground" : "font-bold text-muted-foreground"
                    )}>
                        {notification.title}
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
                    {notification.message}
                </p>

                <div className="flex items-center gap-4 mt-3 sm:mt-4">
                    <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-muted-foreground/50 uppercase tracking-widest whitespace-nowrap">
                        <Calendar className="h-3 w-3" />
                        {(() => {
                            if (!notification.createdAt) return '-';
                            const d = new Date(notification.createdAt);
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
                    onClick={(e) => onDelete(e, notification.id)}
                >
                    <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
            </div>
        </div>
    );
}
