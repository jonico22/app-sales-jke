import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Data is considered fresh for 5 minutes by default
            staleTime: 1000 * 60 * 5,
            // Retry failed queries once
            retry: 1,
            // Do not refetch on window focus by default (can be noisy)
            refetchOnWindowFocus: false,
        },
    },
});
