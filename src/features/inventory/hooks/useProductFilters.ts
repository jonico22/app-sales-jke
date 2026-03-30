import { useState, useEffect } from 'react';

export interface FilterValues {
    categoryCode?: string;
    priceFrom: string;
    priceTo: string;
    priceCostFrom: string;
    priceCostTo: string;
    stockFrom: string;
    stockTo: string;
    lowStock: boolean;
    stockStatus?: 'out';
}

export function useProductFilters() {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState<string>('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    
    const [advancedFilters, setAdvancedFilters] = useState<FilterValues>({
        categoryCode: undefined,
        priceFrom: '',
        priceTo: '',
        priceCostFrom: '',
        priceCostTo: '',
        stockFrom: '',
        stockTo: '',
        lowStock: false,
        stockStatus: undefined,
    });

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const handleApplyFilters = (filters: FilterValues) => {
        setAdvancedFilters(filters);
        setCurrentPage(1);
        setIsFilterPanelOpen(false);
    };

    const getQueryParams = () => {
        const params: Record<string, string | number | boolean | undefined> = {
            page: currentPage,
            limit: pageSize,
            sortBy,
            sortOrder,
        };

        if (debouncedSearchTerm) {
            params.search = debouncedSearchTerm;
        }

        if (statusFilter !== 'all') {
            params.isActive = statusFilter === 'active';
        }

        if (advancedFilters.categoryCode) {
            params.categoryCode = advancedFilters.categoryCode;
        }

        if (advancedFilters.priceFrom) params.priceFrom = Number(advancedFilters.priceFrom);
        if (advancedFilters.priceTo) params.priceTo = Number(advancedFilters.priceTo);
        if (advancedFilters.priceCostFrom) params.priceCostFrom = Number(advancedFilters.priceCostFrom);
        if (advancedFilters.priceCostTo) params.priceCostTo = Number(advancedFilters.priceCostTo);
        if (advancedFilters.stockFrom) params.stockFrom = Number(advancedFilters.stockFrom);
        if (advancedFilters.stockTo) params.stockTo = Number(advancedFilters.stockTo);
        if (advancedFilters.lowStock) params.lowStock = true;
        if (advancedFilters.stockStatus) params.stockStatus = advancedFilters.stockStatus;

        return params;
    };

    return {
        searchTerm,
        setSearchTerm,
        debouncedSearchTerm,
        statusFilter,
        setStatusFilter,
        isFilterPanelOpen,
        setIsFilterPanelOpen,
        pageSize,
        setPageSize,
        currentPage,
        setCurrentPage,
        sortBy,
        sortOrder,
        advancedFilters,
        handleSort,
        handleApplyFilters,
        getQueryParams,
    };
}
