import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { societyService } from '@/services/society.service';
import { useAuthStore } from '@/store/auth.store';

const SESSION_BOOTSTRAP_QUERY_KEY = ['auth', 'bootstrap'];

export function useSessionBootstrap() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthResolved = useAuthStore((state) => state.isAuthResolved);
  const hydrateSession = useAuthStore((state) => state.hydrateSession);
  const markAuthResolved = useAuthStore((state) => state.markAuthResolved);

  const query = useQuery({
    queryKey: SESSION_BOOTSTRAP_QUERY_KEY,
    queryFn: async () => {
      const response = await authService.getMe();

      hydrateSession(response.data);

      try {
        await societyService.getCurrent(response.data.token);
      } catch (error) {
        console.error('Failed to preload society during session bootstrap', error);
      }

      return response;
    },
    enabled: !isAuthenticated && !isAuthResolved,
    retry: false,
    staleTime: 0,
    gcTime: 0,
  });

  useEffect(() => {
    if (!isAuthenticated && !isAuthResolved && query.isFetched) {
      markAuthResolved();
    }
  }, [isAuthenticated, isAuthResolved, query.isFetched, markAuthResolved]);

  return {
    isBootstrapping: !isAuthenticated && !isAuthResolved && query.isLoading,
  };
}
