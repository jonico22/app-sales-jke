import { useState, useEffect, useMemo } from 'react';

export interface FilterValues {
  createdBy?: string;
  createdAtFrom: Date | null;
  createdAtTo: Date | null;
  updatedAtFrom: Date | null;
  updatedAtTo: Date | null;
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

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when search or status changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, statusFilter, advancedFilters]);

  const formatDate = (date: Date | null) => {
    if (!date) return null;
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const queryParams = useMemo(() => {
    const params: any = {
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
    setStatusFilter,
    currentPage,
    setCurrentPage,
    sortBy,
    sortOrder,
    handleSort,
    advancedFilters,
    setAdvancedFilters,
    queryParams,
  };
}
