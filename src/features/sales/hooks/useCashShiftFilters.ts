import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import type { GetAllCashShiftsParams, ShiftStatus } from '@/services/cash-shift.service';

export function useCashShiftFilters() {
    const [searchParams, setSearchParams] = useSearchParams();

    // ── Initial State from URL ──────────────────────────────────────────────
    const initialPage = Number(searchParams.get('page')) || 1;
    const initialLimit = Number(searchParams.get('limit')) || 10;
    const initialSearch = searchParams.get('search') || '';
    const initialBranch = searchParams.get('branch') || '';
    const initialStatus = (searchParams.get('status') as ShiftStatus | '') || '';
    const initialDateFrom = searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : null;
    const initialDateTo = searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : null;

    // ── State ────────────────────────────────────────────────────────────────
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
    const [branchFilter, setBranchFilter] = useState(initialBranch);
    const [statusFilter, setStatusFilter] = useState<'' | 'OPEN' | 'CLOSED'>(initialStatus);
    const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([initialDateFrom, initialDateTo]);
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [pageSize, setPageSize] = useState(initialLimit);

    const [startDate, endDate] = dateRange;

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
        if (branchFilter) params.branch = branchFilter;
        if (statusFilter) params.status = statusFilter;
        if (startDate) params.dateFrom = format(startDate, 'yyyy-MM-dd');
        if (endDate) params.dateTo = format(endDate, 'yyyy-MM-dd');

        setSearchParams(params, { replace: true });
    }, [currentPage, pageSize, debouncedSearch, branchFilter, statusFilter, startDate, endDate, setSearchParams]);

    // ── Handlers ─────────────────────────────────────────────────────────────
    const resetFilters = useCallback(() => {
        setSearchTerm('');
        setBranchFilter('');
        setStatusFilter('');
        setDateRange([null, null]);
        setCurrentPage(1);
    }, []);

    const resetPage = useCallback(() => setCurrentPage(1), []);

    // ── Query Params Memo ────────────────────────────────────────────────────
    const queryParams = useMemo((): GetAllCashShiftsParams => {
        const params: GetAllCashShiftsParams = {
            page: currentPage,
            limit: pageSize,
            sortBy: 'openedAt',
            sortOrder: 'desc',
        };

        if (branchFilter) params.branchId = branchFilter;
        if (statusFilter) params.status = statusFilter;
        if (startDate) params.dateFrom = format(startDate, 'yyyy-MM-dd');
        if (endDate) params.dateTo = format(endDate, 'yyyy-MM-dd');
        // Note: The API might not support 'search' for shifts directly, 
        // but we keep it here in case it's added or used by the service.
        // if (debouncedSearch) params.search = debouncedSearch; 

        return params;
    }, [currentPage, pageSize, branchFilter, statusFilter, startDate, endDate]);

    return {
        // State
        searchTerm,
        setSearchTerm,
        debouncedSearch,
        branchFilter,
        setBranchFilter,
        statusFilter,
        setStatusFilter,
        dateRange,
        setDateRange,
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        startDate,
        endDate,

        // Handlers
        resetFilters,
        resetPage,

        // Query
        queryParams,
    };
}
