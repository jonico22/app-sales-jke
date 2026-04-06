import { useState, useEffect } from 'react';

export interface FilterValues {
  createdBy?: string;
  createdAtFrom: Date | null;
  createdAtTo: Date | null;
  updatedAtFrom: Date | null;
  updatedAtTo: Date | null;
}

export function useBranchOfficeFilters() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<FilterValues>({
    createdBy: undefined,
    createdAtFrom: null,
    createdAtTo: null,
    updatedAtFrom: null,
    updatedAtTo: null,
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

    if (advancedFilters.createdBy) {
      params.createdBy = advancedFilters.createdBy;
    }

    const formatDate = (date: Date) => 
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    if (advancedFilters.createdAtFrom) params.createdAtFrom = formatDate(advancedFilters.createdAtFrom);
    if (advancedFilters.createdAtTo) params.createdAtTo = formatDate(advancedFilters.createdAtTo);
    if (advancedFilters.updatedAtFrom) params.updatedAtFrom = formatDate(advancedFilters.updatedAtFrom);
    if (advancedFilters.updatedAtTo) params.updatedAtTo = formatDate(advancedFilters.updatedAtTo);

    return params;
  };

  return {
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    statusFilter,
    setStatusFilter,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    sortBy,
    sortOrder,
    handleSort,
    isFilterPanelOpen,
    setIsFilterPanelOpen,
    advancedFilters,
    handleApplyFilters,
    getQueryParams,
  };
}
