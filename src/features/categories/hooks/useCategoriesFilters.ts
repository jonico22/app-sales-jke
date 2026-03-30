import { useState, useEffect, useMemo } from 'react';

export interface FilterValues {
  createdBy?: string;
  createdAtFrom: Date | null;
  createdAtTo: Date | null;
  updatedAtFrom: Date | null;
  updatedAtTo: Date | null;
}

interface CategoryQueryParams {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  search?: string;
  isActive?: boolean;
  createdBy?: string;
  createdAtFrom?: string | null;
  createdAtTo?: string | null;
  updatedAtFrom?: string | null;
  updatedAtTo?: string | null;
}

export function useCategoriesFilters() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [advancedFilters, setAdvancedFilters] = useState<FilterValues>({
    createdBy: undefined,
    createdAtFrom: null,
    createdAtTo: null,
    updatedAtFrom: null,
    updatedAtTo: null,
  });

  // Debounce search term and reset page
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      if (searchTerm) setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Wrapper setters to reset page
  const handleStatusChange = (status: 'all' | 'active' | 'inactive') => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleAdvancedFiltersChange = (filters: FilterValues) => {
    setAdvancedFilters(filters);
    setCurrentPage(1);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return null;
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const queryParams = useMemo(() => {
    const params: CategoryQueryParams = {
      page: currentPage,
      limit: 10,
      sortBy,
      sortOrder,
    };

    if (debouncedSearchTerm) params.search = debouncedSearchTerm;
    if (statusFilter !== 'all') params.isActive = statusFilter === 'active';
    if (advancedFilters.createdBy) params.createdBy = advancedFilters.createdBy;
    
    const createdAtFrom = formatDate(advancedFilters.createdAtFrom);
    if (createdAtFrom) params.createdAtFrom = createdAtFrom;

    const createdAtTo = formatDate(advancedFilters.createdAtTo);
    if (createdAtTo) params.createdAtTo = createdAtTo;

    const updatedAtFrom = formatDate(advancedFilters.updatedAtFrom);
    if (updatedAtFrom) params.updatedAtFrom = updatedAtFrom;

    const updatedAtTo = formatDate(advancedFilters.updatedAtTo);
    if (updatedAtTo) params.updatedAtTo = updatedAtTo;

    return params;
  }, [currentPage, debouncedSearchTerm, statusFilter, advancedFilters, sortBy, sortOrder]);

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
    statusFilter,
    setStatusFilter: handleStatusChange,
    currentPage,
    setCurrentPage,
    sortBy,
    sortOrder,
    handleSort,
    advancedFilters,
    setAdvancedFilters: handleAdvancedFiltersChange,
    queryParams,
  };
}
