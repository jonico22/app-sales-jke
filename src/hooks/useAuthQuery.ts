import { useQuery } from '@tanstack/react-query';
import { authService, type MeResponse } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';

export const AUTH_ME_QUERY_KEY = ['auth', 'me'];

export function useAuthQuery() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const token = useAuthStore(state => state.token);

  return useQuery<MeResponse>({
    queryKey: AUTH_ME_QUERY_KEY,
    queryFn: () => authService.getMe(),
    // Only run if we have a token and think we are authenticated
    enabled: !!isAuthenticated && !!token,
    // Auth data should be fresh to avoid session desync
    staleTime: 0,
    gcTime: 0, 
  });
}
