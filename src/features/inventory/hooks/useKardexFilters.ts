import { useState, useEffect } from 'react';
import type { KardexFilterValues } from '../components/KardexFilterPanel';

export function useKardexFilters() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<KardexFilterValues>({});
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
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

  const handleApplyFilters = (newFilters: KardexFilterValues) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  return {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    searchTerm,
    setSearchTerm,
    debouncedSearch,
    isFilterOpen,
    setIsFilterOpen,
    filters,
    setFilters: handleApplyFilters,
    sortBy,
    sortOrder,
    handleSort,
    queryParams: {
      page: currentPage,
      limit: pageSize,
      search: debouncedSearch,
      sortBy,
      sortOrder,
      ...filters
    }
  };
}
