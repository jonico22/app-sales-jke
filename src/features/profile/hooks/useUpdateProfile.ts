import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authService, type UpdateProfileRequest } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { USER_PROFILE_QUERY_KEY } from '@/hooks/useUserProfileQuery';
import { parseBackendError } from '@/utils/error.utils';

export function useUpdateProfile() {
    const queryClient = useQueryClient();
    const { user, updateUser } = useAuthStore();

    return useMutation({
        mutationFn: async (data: UpdateProfileRequest) => {
            const response = await authService.updateProfile(data);
            return response;
        },
        onSuccess: (response) => {
            if (response.success) {
                // Merge updated data into store
                const updatedUser = {
                    ...user,
                    ...response.data,
                    // Ensure image is updated if it was in the request or response
                    image: response.data.image || user?.image,
                } as any;
                
                updateUser(updatedUser);

                // Invalidate profile queries to keep data fresh across the app
                queryClient.invalidateQueries({ queryKey: USER_PROFILE_QUERY_KEY });
                queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });

                toast.success('Perfil actualizado correctamente');
            }
        },
        onError: (error: any) => {
            console.error(error);
            const errorMessage = parseBackendError(error) || 'Error al actualizar el perfil';
            toast.error(errorMessage);
        }
    });
}
