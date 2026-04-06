import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { notificationService } from '@/services/notification.service';

export function useNotificationMutations() {
    const queryClient = useQueryClient();

    const markAllAsReadMutation = useMutation({
        mutationFn: () => notificationService.markAllAsRead(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            toast.success('Todas las notificaciones marcadas como leídas');
        },
        onError: () => toast.error('Error al marcar todas como leídas')
    });

    const markAsReadMutation = useMutation({
        mutationFn: (id: string) => notificationService.markAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => notificationService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            toast.success('Notificación eliminada');
        },
        onError: () => toast.error('Error al eliminar la notificación')
    });

    return {
        markAllAsRead: markAllAsReadMutation.mutate,
        markAsRead: markAsReadMutation.mutate,
        deleteNotification: deleteMutation.mutate,
        isPending: markAllAsReadMutation.isPending || deleteMutation.isPending
    };
}
