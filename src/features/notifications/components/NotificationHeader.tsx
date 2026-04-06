import { Bell, CheckCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotificationHeaderProps {
    unreadCount: number;
    hasFilters: boolean;
    onMarkAllAsRead: () => void;
    onClearFilters: () => void;
}

export function NotificationHeader({ unreadCount, hasFilters, onMarkAllAsRead, onClearFilters }: NotificationHeaderProps) {
    return (
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
                        onClick={onMarkAllAsRead}
                    >
                        <CheckCheck className="h-3.5 w-3.5 mr-1.5 sm:mr-2" />
                        Marcar todo como leído
                    </Button>
                )}

                {hasFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/5 h-9 sm:h-10 px-3 sm:px-4 rounded-xl text-[10px] sm:text-xs whitespace-nowrap"
                        onClick={onClearFilters}
                    >
                        <X className="h-3.5 w-3.5 mr-1.5 sm:mr-2" />
                        Limpiar
                    </Button>
                )}
            </div>
        </div>
    );
}
