import { renderHook, waitFor } from '@testing-library/react';
import { useBranches } from './useBranches';
import { branchOfficeService } from '@/services/branch-office.service';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';

// Mock dependencies
vi.mock('@/services/branch-office.service', () => ({
  branchOfficeService: {
    getForSelect: vi.fn(),
  },
}));

// Wrapper for query client
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={createTestQueryClient()}>
    {children}
  </QueryClientProvider>
);

describe('useBranches hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should fetch branches for select', async () => {
        const mockData = { data: [{ id: 1, name: 'Branch 1' }] };
        (branchOfficeService.getForSelect as any).mockResolvedValue(mockData);

        const { result } = renderHook(() => useBranches(), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual(mockData.data);
        expect(branchOfficeService.getForSelect).toHaveBeenCalled();
    });

    it('should return empty array when data is missing', async () => {
        (branchOfficeService.getForSelect as any).mockResolvedValue({ data: null });

        const { result } = renderHook(() => useBranches(), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual([]);
    });
});
