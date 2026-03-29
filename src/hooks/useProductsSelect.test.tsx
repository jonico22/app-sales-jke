import { renderHook, waitFor } from '@testing-library/react';
import { useProductsSelect } from './useProductsSelect';
import { productService } from '@/services/product.service';
import { useBranchStore } from '@/store/branch.store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';

// Mock dependencies
vi.mock('@/services/product.service', () => ({
  productService: {
    getForSelect: vi.fn(),
  },
}));

vi.mock('@/store/branch.store', () => ({
  useBranchStore: vi.fn(),
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

describe('useProductsSelect hook', () => {
    const mockProducts = [
        { id: '1', name: 'Product 1' },
        { id: '2', name: 'Product 2' }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should fetch products using branchId from store if not provided in params', async () => {
        const mockBranch = { id: 'branch-123' };
        (useBranchStore as any).mockReturnValue(mockBranch);
        (productService.getForSelect as any).mockResolvedValue({ success: true, data: mockProducts });

        const { result } = renderHook(() => useProductsSelect(), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual(mockProducts);
        expect(productService.getForSelect).toHaveBeenCalledWith(expect.objectContaining({
            branchId: 'branch-123'
        }));
    });

    it('should fetch products using branchId from params if provided', async () => {
        (useBranchStore as any).mockReturnValue({ id: 'branch-store' });
        (productService.getForSelect as any).mockResolvedValue({ success: true, data: { data: mockProducts } });

        const { result } = renderHook(() => useProductsSelect({ branchId: 'branch-param' }), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual(mockProducts);
        expect(productService.getForSelect).toHaveBeenCalledWith(expect.objectContaining({
            branchId: 'branch-param'
        }));
    });

    it('should return empty array on failure', async () => {
        (useBranchStore as any).mockReturnValue({ id: '1' });
        (productService.getForSelect as any).mockResolvedValue({ success: false });

        const { result } = renderHook(() => useProductsSelect(), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual([]);
    });
});
