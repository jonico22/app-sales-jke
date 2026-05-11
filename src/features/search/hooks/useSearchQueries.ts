import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { productService, type ProductsResponse } from '@/services/product.service';
import { favoritesService, type FavoritesResponse } from '@/services/favorites.service';

export const searchKeys = {
  all: ['search'] as const,
  products: (filters: Record<string, unknown>) => [...searchKeys.all, 'products', filters] as const,
  favorites: () => [...searchKeys.all, 'favorites'] as const,
  metadata: () => [...searchKeys.all, 'metadata'] as const,
  bestSellers: () => [...searchKeys.all, 'bestSellers'] as const,
};

export function useSearchProductsInfiniteQuery(filters: {
  search?: string;
  categoryId?: string;
  brand?: string;
  color?: string;
  priceFrom?: number;
  priceTo?: number;
  stockStatus?: 'all' | 'available' | 'low' | 'out';
  branchId?: string;
  enabled?: boolean;
}) {
  return useInfiniteQuery<ProductsResponse>({
    queryKey: searchKeys.products(filters),
    queryFn: ({ pageParam = 1 }) => {
      const params: Record<string, unknown> = { 
        ...filters, 
        page: pageParam as number, 
        limit: 12 
      };
      
      // Map stock status to service params
      if (filters.stockStatus === 'low') {
        params.lowStock = true;
        delete params.stockStatus;
      } else if (filters.stockStatus === 'out') {
        params.stockStatus = 'out';
      } else if (filters.stockStatus === 'available') {
        params.stockFrom = 1;
        delete params.stockStatus;
      } else {
        delete params.stockStatus;
      }

      return productService.getAll(params);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => 
      lastPage.data.pagination.hasNextPage ? lastPage.data.pagination.page + 1 : undefined,
    enabled: filters.enabled !== false,
  });
}

export function useSearchFavoritesQuery(enabled: boolean = true) {
  return useQuery<FavoritesResponse>({
    queryKey: searchKeys.favorites(),
    queryFn: () => favoritesService.getAll(),
    enabled,
  });
}

export function useSearchMetadataQuery() {
  return useQuery({
    queryKey: searchKeys.metadata(),
    queryFn: async () => {
      const [colors, brands] = await Promise.all([
        productService.getColors(),
        productService.getBrands()
      ]);
      return { 
        colors: colors.data || [], 
        brands: brands.data || [] 
      };
    },
  });
}

export function useBestSellersQuery(enabled: boolean = false) {
  return useQuery({
    queryKey: searchKeys.bestSellers(),
    queryFn: () => productService.getBestSellers(),
    enabled,
  });
}
