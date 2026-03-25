import { useQuery } from '@tanstack/react-query';
import { authService, type MeResponse } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';

export const AUTH_ME_QUERY_KEY = ['auth', 'me'];

export function useAuthQuery() {
  const { isAuthenticated, token } = useAuthStore();

  return useQuery<MeResponse>({
    queryKey: AUTH_ME_QUERY_KEY,
    queryFn: () => authService.getMe(),
    // Only run if we have a token and think we are authenticated
    enabled: !!isAuthenticated && !!token,
    // Global staleTime is 5 min, so it won't refetch on every mount 
    // unless the data is older than 5 min.
  });
}
