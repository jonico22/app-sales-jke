import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { OrderStatus } from '@/services/order.service';

export interface SalesHistoryFilterValues {
  createdBy?: string;
  createdAtFrom: Date | null;
  createdAtTo: Date | null;
  updatedAtFrom: Date | null;
  updatedAtTo: Date | null;
  totalFrom: string;
  totalTo: string;
}

export function useSalesHistoryFilters() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [advancedFilters, setAdvancedFilters] = useState<SalesHistoryFilterValues>({
    createdBy: undefined,
    createdAtFrom: null,
    createdAtTo: null,
    updatedAtFrom: null,
    updatedAtTo: null,
    totalFrom: '',
    totalTo: '',
  });

  const [startDate, endDate] = dateRange;

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const formatDate = (date: Date | null) => {
    if (!date) return null;
    return format(date, 'yyyy-MM-dd');
  };

  const queryParams = useMemo(() => {
    const params: any = {
      page: currentPage,
      limit: pageSize,
      sortBy,
      sortOrder,
    };

    if (debouncedSearchTerm) params.search = debouncedSearchTerm;
    if (statusFilter !== 'ALL') params.status = statusFilter;
    
    if (startDate) params.dateFrom = formatDate(startDate);
    if (endDate) params.dateTo = formatDate(endDate);

    if (advancedFilters.createdBy) params.createdBy = advancedFilters.createdBy;
    
    const createdAtFrom = formatDate(advancedFilters.createdAtFrom);
    if (createdAtFrom) params.createdAtFrom = createdAtFrom;

    const createdAtTo = formatDate(advancedFilters.createdAtTo);
    if (createdAtTo) params.createdAtTo = createdAtTo;

    const updatedAtFrom = formatDate(advancedFilters.updatedAtFrom);
    if (updatedAtFrom) params.updatedAtFrom = updatedAtFrom;

    const updatedAtTo = formatDate(advancedFilters.updatedAtTo);
    if (updatedAtTo) params.updatedAtTo = updatedAtTo;

    if (advancedFilters.totalFrom) params.totalFrom = advancedFilters.totalFrom;
    if (advancedFilters.totalTo) params.totalTo = advancedFilters.totalTo;

    return params;
  }, [currentPage, pageSize, debouncedSearchTerm, statusFilter, dateRange, advancedFilters, sortBy, sortOrder]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    dateRange,
    setDateRange,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    sortBy,
    sortOrder,
    handleSort,
    advancedFilters,
    setAdvancedFilters,
    queryParams,
  };
}

export function usePendingOrdersFilters() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(50);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const queryParams = useMemo(() => {
    return {
      status: OrderStatus.PENDING_PAYMENT as OrderStatus,
      limit,
      page: currentPage,
      search: debouncedSearchQuery,
      sortBy,
      sortOrder,
      include: 'allItems'
    };
  }, [debouncedSearchQuery, sortBy, sortOrder, currentPage, limit]);

  return {
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    currentPage,
    setCurrentPage,
    queryParams
  };
}
