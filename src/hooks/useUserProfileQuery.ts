import { useQuery } from '@tanstack/react-query';
import { userService, type UserMeResponse } from '@/services/user.service';
import { useAuthStore } from '@/store/auth.store';

export const USER_PROFILE_QUERY_KEY = ['user', 'profile'];

export function useUserProfileQuery() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const token = useAuthStore(state => state.token);

  return useQuery<UserMeResponse>({
    queryKey: USER_PROFILE_QUERY_KEY,
    queryFn: () => userService.getMe(),
    enabled: !!isAuthenticated && !!token,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
