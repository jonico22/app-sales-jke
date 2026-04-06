import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { NotificationType } from '@/services/notification.service';

export function useNotificationsFilters() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<NotificationType | 'all'>('all');
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    // Sync debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Page reset on filter change
    useEffect(() => {
        setPage(1);
    }, [typeFilter, startDate, endDate]);

    const clearFilters = () => {
        setSearch('');
        setDebouncedSearch('');
        setTypeFilter('all');
        setStartDate(null);
        setEndDate(null);
        setPage(1);
    };

    const queryParams = {
        page,
        limit: 10,
        search: debouncedSearch || undefined,
        type: typeFilter === 'all' ? undefined : typeFilter,
        startDate: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
        endDate: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
    };

    return {
        page,
        setPage,
        search,
        setSearch,
        typeFilter,
        setTypeFilter,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        clearFilters,
        queryParams
    };
}
