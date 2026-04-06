import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

export interface SearchFilters {
    categoryId: string;
    brand: string;
    color: string;
    priceFrom: number;
    priceTo: number;
    stockStatus: 'all' | 'available' | 'low' | 'out';
}

export type QuickFilter = 'all' | 'favorites' | 'bestSellers';

export interface SearchQueryParams {
    search: string;
    categoryId: string;
    brand: string;
    color: string;
    priceFrom: number;
    priceTo: number;
    stockStatus?: SearchFilters['stockStatus'];
}

export function useSearchFilters() {
    const [searchParams, setSearchParams] = useSearchParams();

    // ── Initial State from URL ──────────────────────────────────────────────
    const initialSearch = searchParams.get('q') || '';
    const initialCategory = searchParams.get('category') || '';
    const initialBrand = searchParams.get('brand') || '';
    const initialColor = searchParams.get('color') || '';
    const initialPriceFrom = Number(searchParams.get('minPrice')) || 0;
    const initialPriceTo = Number(searchParams.get('maxPrice')) || 1000;
    const initialStockStatus = (searchParams.get('stock') as SearchFilters['stockStatus']) || 'all';
    const initialQuickFilter = (searchParams.get('filter') as QuickFilter) || 'all';

    // ── State ────────────────────────────────────────────────────────────────
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
    
    const [quickFilter, setQuickFilter] = useState<QuickFilter>(initialQuickFilter);
    
    const [filters, setFilters] = useState<SearchFilters>({
        categoryId: initialCategory,
        brand: initialBrand,
        color: initialColor,
        priceFrom: initialPriceFrom,
        priceTo: initialPriceTo,
        stockStatus: initialStockStatus
    });

    const [debouncedPriceFrom, setDebouncedPriceFrom] = useState(initialPriceFrom);
    const [debouncedPriceTo, setDebouncedPriceTo] = useState(initialPriceTo);

    // ── Effects ──────────────────────────────────────────────────────────────

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchQuery), 400);
        return () => clearTimeout(t);
    }, [searchQuery]);

    // Debounce prices
    useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedPriceFrom(filters.priceFrom);
            setDebouncedPriceTo(filters.priceTo);
        }, 500);
        return () => clearTimeout(t);
    }, [filters.priceFrom, filters.priceTo]);

    // Update URL
    useEffect(() => {
        const params: Record<string, string> = {};
        if (debouncedSearch) params.q = debouncedSearch;
        if (filters.categoryId) params.category = filters.categoryId;
        if (filters.brand) params.brand = filters.brand;
        if (filters.color) params.color = filters.color;
        if (filters.priceFrom > 0) params.minPrice = String(filters.priceFrom);
        if (filters.priceTo < 1000) params.maxPrice = String(filters.priceTo);
        if (filters.stockStatus !== 'all') params.stock = filters.stockStatus;
        if (quickFilter !== 'all') params.filter = quickFilter;

        setSearchParams(params, { replace: true });
    }, [debouncedSearch, filters, quickFilter, setSearchParams]);

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleFilterChange = useCallback((key: keyof SearchFilters, value: unknown) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    const clearFilters = useCallback(() => {
        setFilters({
            categoryId: '',
            brand: '',
            color: '',
            priceFrom: 0,
            priceTo: 1000,
            stockStatus: 'all'
        });
        setSearchQuery('');
        setQuickFilter('all');
    }, []);

    // ── Computed ────────────────────────────────────────────────────────────
    const queryParams = useMemo((): SearchQueryParams => {
        const params: SearchQueryParams = {
            search: debouncedSearch,
            categoryId: filters.categoryId,
            brand: filters.brand,
            color: filters.color,
            priceFrom: debouncedPriceFrom,
            priceTo: debouncedPriceTo,
        };

        if (quickFilter !== 'favorites' && quickFilter !== 'bestSellers') {
            params.stockStatus = filters.stockStatus;
        }

        return params;
    }, [debouncedSearch, filters, debouncedPriceFrom, debouncedPriceTo, quickFilter]);

    return {
        searchQuery,
        setSearchQuery,
        debouncedSearch,
        filters,
        setFilters,
        quickFilter,
        setQuickFilter,
        handleFilterChange,
        clearFilters,
        queryParams
    };
}
