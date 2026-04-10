import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTestQueryClient } from '@/tests/test-utils';
import {
  searchKeys,
  useBestSellersQuery,
  useSearchFavoritesQuery,
  useSearchMetadataQuery,
  useSearchProductsInfiniteQuery,
} from './useSearchQueries';

vi.mock('@/services/product.service', () => ({
  productService: {
    getAll: vi.fn(),
    getColors: vi.fn(),
    getBrands: vi.fn(),
    getBestSellers: vi.fn(),
  },
}));

vi.mock('@/services/favorites.service', () => ({
  favoritesService: {
    getAll: vi.fn(),
  },
}));

import { productService } from '@/services/product.service';
import { favoritesService } from '@/services/favorites.service';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={createTestQueryClient()}>{children}</QueryClientProvider>
);

describe('useSearchQueries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps low stock filters for the infinite product query', async () => {
    vi.mocked(productService.getAll).mockResolvedValue({
      success: true,
      message: 'ok',
      data: {
        data: [],
        pagination: { page: 1, totalPages: 1, total: 0, limit: 12, hasNextPage: false, hasPrevPage: false },
      },
    });

    const { result } = renderHook(() => useSearchProductsInfiniteQuery({ stockStatus: 'low' }), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(productService.getAll).toHaveBeenCalledWith(expect.objectContaining({ lowStock: true, limit: 12, page: 1 }));
  });

  it('supports favorites, metadata and best sellers queries', async () => {
    vi.mocked(favoritesService.getAll).mockResolvedValue({ success: true, message: 'ok', data: [] });
    vi.mocked(productService.getColors).mockResolvedValue({ success: true, data: [{ id: '1', color: 'Blue', colorCode: '#00f' }] });
    vi.mocked(productService.getBrands).mockResolvedValue({ success: true, data: [{ id: '1', brand: 'Acme' }] });
    vi.mocked(productService.getBestSellers).mockResolvedValue({ success: true, message: 'ok', data: [] });

    const favorites = renderHook(() => useSearchFavoritesQuery(), { wrapper });
    const metadata = renderHook(() => useSearchMetadataQuery(), { wrapper });
    const bestSellers = renderHook(() => useBestSellersQuery(true), { wrapper });

    await waitFor(() => expect(favorites.result.current.isSuccess).toBe(true));
    await waitFor(() => expect(metadata.result.current.isSuccess).toBe(true));
    await waitFor(() => expect(bestSellers.result.current.isSuccess).toBe(true));

    expect(metadata.result.current.data).toEqual({
      colors: [{ id: '1', color: 'Blue', colorCode: '#00f' }],
      brands: [{ id: '1', brand: 'Acme' }],
    });
    expect(searchKeys.favorites()).toEqual(['search', 'favorites']);
  });
});
