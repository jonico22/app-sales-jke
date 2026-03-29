import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authService, type ChangePasswordRequest } from '@/services/auth.service';
import { societyService } from '@/services/society.service';
import { useAuthStore } from '@/store/auth.store';
import { PERMISSIONS_QUERY_KEY } from '@/hooks/usePermissions';
import { parseBackendError } from '@/utils/error.utils';

export function useChangePassword() {
    const queryClient = useQueryClient();
    const { setMustChangePassword, updateUser } = useAuthStore();

    return useMutation({
        mutationFn: async (data: ChangePasswordRequest) => {
            const response = await authService.changePassword(data);
            return response;
        },
        onSuccess: async () => {
            // Update store so the user doesn't have to change password again in this session
            setMustChangePassword(false);

            // Remove permissions to force a clean fetch and show skeleton loader if needed
            queryClient.removeQueries({ queryKey: PERMISSIONS_QUERY_KEY });

            // Fetch me data and society data now that the user is fully authorized
            try {
                const meRes = await authService.getMe();
                if (meRes.success) {
                    updateUser(meRes.data.user);
                }
                await societyService.getCurrent();
                queryClient.invalidateQueries({ queryKey: ['society'] });
            } catch (err) {
                console.error('Failed to load user/society data after password change', err);
            }

            toast.success('Contraseña actualizada correctamente');
        },
        onError: (error: any) => {
            console.error(error);
            const errorMessage = parseBackendError(error) || 'Error al cambiar la contraseña. Verifica tu contraseña actual.';
            toast.error(errorMessage);
        }
    });
}
