import { useState } from 'react';
import type { GetAllBranchMovementsParams, MovementStatus } from '@/services/branch-movement.service';

export function useMovementFilters() {
    const [originBranchId, setOriginBranchId] = useState<string>('all');
    const [destinationBranchId, setDestinationBranchId] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);

    // Sorting
    const [sortBy, setSortBy] = useState<string>('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');


    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const getQueryParams = (): GetAllBranchMovementsParams => {
        return {
            page: currentPage,
            limit: pageSize,
            originBranchId: originBranchId === 'all' ? undefined : originBranchId,
            destinationBranchId: destinationBranchId === 'all' ? undefined : destinationBranchId,
            status: statusFilter === 'all' ? undefined : (statusFilter as MovementStatus),
            sortBy: sortBy || undefined,
            sortOrder,
        };
    };

    return {
        originBranchId,
        setOriginBranchId,
        destinationBranchId,
        setDestinationBranchId,
        statusFilter,
        setStatusFilter,
        currentPage,
        setCurrentPage,
        pageSize,
        sortBy,
        sortOrder,
        handleSort,
        getQueryParams,
    };
}
