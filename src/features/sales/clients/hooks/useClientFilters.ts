import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';

export interface ClientFilterValues {
    createdBy?: string;
    createdAtFrom: Date | null;
    createdAtTo: Date | null;
    updatedAtFrom: Date | null;
    updatedAtTo: Date | null;
}

export function useClientFilters() {
    const [searchParams, setSearchParams] = useSearchParams();

    // ── Initial State from URL ──────────────────────────────────────────────
    const initialPage = Number(searchParams.get('page')) || 1;
    const initialLimit = Number(searchParams.get('limit')) || 10;
    const initialSearch = searchParams.get('search') || '';
    const initialStatus = (searchParams.get('status') as 'all' | 'active' | 'inactive') || 'all';
    const initialCreatedBy = searchParams.get('createdBy') || undefined;
    const initialCreatedAtFrom = searchParams.get('createdAtFrom') ? new Date(searchParams.get('createdAtFrom')!) : null;
    const initialCreatedAtTo = searchParams.get('createdAtTo') ? new Date(searchParams.get('createdAtTo')!) : null;
    const initialUpdatedAtFrom = searchParams.get('updatedAtFrom') ? new Date(searchParams.get('updatedAtFrom')!) : null;
    const initialUpdatedAtTo = searchParams.get('updatedAtTo') ? new Date(searchParams.get('updatedAtTo')!) : null;
    const initialSortBy = searchParams.get('sortBy') || '';
    const initialSortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

    // ── State ────────────────────────────────────────────────────────────────
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>(initialStatus);
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [pageSize, setPageSize] = useState(initialLimit);
    const [sortBy, setSortBy] = useState<string>(initialSortBy);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder);

    const [advancedFilters, setAdvancedFilters] = useState<ClientFilterValues>({
        createdBy: initialCreatedBy,
        createdAtFrom: initialCreatedAtFrom,
        createdAtTo: initialCreatedAtTo,
        updatedAtFrom: initialUpdatedAtFrom,
        updatedAtTo: initialUpdatedAtTo,
    });

    // ── Effects ──────────────────────────────────────────────────────────────

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1);
        }, 400);
        return () => clearTimeout(t);
    }, [searchTerm]);

    // Update URL when filters change
    useEffect(() => {
        const params: Record<string, string> = {};
        if (currentPage > 1) params.page = String(currentPage);
        if (pageSize !== 10) params.limit = String(pageSize);
        if (debouncedSearch) params.search = debouncedSearch;
        if (statusFilter !== 'all') params.status = statusFilter;
        if (sortBy) params.sortBy = sortBy;
        if (sortOrder !== 'desc' || sortBy) params.sortOrder = sortOrder;

        if (advancedFilters.createdBy) params.createdBy = advancedFilters.createdBy;
        if (advancedFilters.createdAtFrom) params.createdAtFrom = format(advancedFilters.createdAtFrom, 'yyyy-MM-dd');
        if (advancedFilters.createdAtTo) params.createdAtTo = format(advancedFilters.createdAtTo, 'yyyy-MM-dd');
        if (advancedFilters.updatedAtFrom) params.updatedAtFrom = format(advancedFilters.updatedAtFrom, 'yyyy-MM-dd');
        if (advancedFilters.updatedAtTo) params.updatedAtTo = format(advancedFilters.updatedAtTo, 'yyyy-MM-dd');

        setSearchParams(params, { replace: true });
    }, [currentPage, pageSize, debouncedSearch, statusFilter, sortBy, sortOrder, advancedFilters, setSearchParams]);

    // ── Handlers ─────────────────────────────────────────────────────────────
    const resetFilters = useCallback(() => {
        setSearchTerm('');
        setStatusFilter('all');
        setAdvancedFilters({
            createdBy: undefined,
            createdAtFrom: null,
            createdAtTo: null,
            updatedAtFrom: null,
            updatedAtTo: null,
        });
        setCurrentPage(1);
    }, []);

    const handleSort = useCallback((field: string) => {
        if (sortBy === field) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    }, [sortBy]);

    const handleApplyAdvancedFilters = useCallback((filters: ClientFilterValues) => {
        setAdvancedFilters(filters);
        setCurrentPage(1);
    }, []);

    // ── Query Params Memo ────────────────────────────────────────────────────
    const queryParams = useMemo(() => {
        const params: any = {
            page: currentPage,
            limit: pageSize,
            sortBy,
            sortOrder,
        };

        if (debouncedSearch) params.search = debouncedSearch;
        if (statusFilter !== 'all') params.isActive = statusFilter === 'active';
        
        if (advancedFilters.createdBy) params.createdBy = advancedFilters.createdBy;
        if (advancedFilters.createdAtFrom) params.createdAtFrom = format(advancedFilters.createdAtFrom, 'yyyy-MM-dd');
        if (advancedFilters.createdAtTo) params.createdAtTo = format(advancedFilters.createdAtTo, 'yyyy-MM-dd');
        if (advancedFilters.updatedAtFrom) params.updatedAtFrom = format(advancedFilters.updatedAtFrom, 'yyyy-MM-dd');
        if (advancedFilters.updatedAtTo) params.updatedAtTo = format(advancedFilters.updatedAtTo, 'yyyy-MM-dd');

        return params;
    }, [currentPage, pageSize, debouncedSearch, statusFilter, sortBy, sortOrder, advancedFilters]);

    return {
        // State
        searchTerm,
        setSearchTerm,
        statusFilter,
        setStatusFilter,
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        sortBy,
        sortOrder,
        advancedFilters,
        setAdvancedFilters,

        // Handlers
        resetFilters,
        handleSort,
        handleApplyAdvancedFilters,

        // Query
        queryParams,
    };
}
