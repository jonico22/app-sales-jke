import { Loader2, BellOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { type Notification } from '@/services/notification.service';
import { NotificationItem } from './NotificationItem';

interface NotificationListProps {
    notifications: Notification[];
    loading: boolean;
    isRefetching: boolean;
    onAction: (notification: Notification) => void;
    onDelete: (e: React.MouseEvent, id: string) => void;
}

export function NotificationList({ 
    notifications, 
    loading, 
    isRefetching, 
    onAction, 
    onDelete 
}: NotificationListProps) {
    if (loading) {
        return (
            <div className="py-20 bg-card rounded-2xl sm:rounded-[2rem] border border-border/50 flex flex-col items-center justify-center text-muted-foreground shadow-sm">
                <Loader2 className="h-10 w-10 animate-spin text-primary/40 mb-4" />
                <p className="font-bold text-xs sm:text-sm tracking-wide uppercase">Cargando alertas...</p>
            </div>
        );
    }

    if (notifications.length === 0) {
        return (
            <div className="py-20 bg-card rounded-2xl sm:rounded-[2rem] border border-border/50 flex flex-col items-center justify-center text-center px-10 shadow-sm">
                <div className="bg-muted/30 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] mb-6 border border-border/20">
                    <BellOff className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/20" />
                </div>
                <h3 className="text-lg sm:text-xl font-black text-foreground uppercase tracking-tight">Sin notificaciones</h3>
                <p className="text-muted-foreground text-xs sm:text-sm max-w-sm mx-auto mt-2 font-medium">
                    No tienes notificaciones en este momento.
                </p>
            </div>
        );
    }

    return (
        <div className="relative">
            {isRefetching && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 transition-all animate-in fade-in zoom-in">
                    <Badge variant="outline" className="bg-background/80 backdrop-blur-md border-primary/20 text-primary px-3 py-1 rounded-full shadow-lg flex items-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Sincronizando...
                    </Badge>
                </div>
            )}

            <div className="grid gap-3 sm:gap-4">
                {notifications.map((notif) => (
                    <NotificationItem 
                        key={notif.id} 
                        notification={notif} 
                        onAction={onAction} 
                        onDelete={onDelete} 
                    />
                ))}
            </div>
        </div>
    );
}
