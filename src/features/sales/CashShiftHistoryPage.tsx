import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { cashShiftService } from '@/services/cash-shift.service';
import type { CashShift, GetAllCashShiftsParams } from '@/services/cash-shift.service';
import { useBranchStore } from '@/store/branch.store';
import { AddMovementModal } from './components/AddMovementModal';
import { CashShiftHistoryHeader } from './components/CashShiftHistoryHeader';
import { CashShiftHistoryFilterBar } from './components/CashShiftHistoryFilterBar';
import { CashShiftHistoryTable } from './components/CashShiftHistoryTable';
import { CashShiftHistoryMobileList } from './components/CashShiftHistoryMobileList';

export default function CashShiftHistoryPage() {
    const { branches } = useBranchStore();

    // ── Filters ──────────────────────────────────────────────────────────────
    const [branchFilter, setBranchFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState<'' | 'OPEN' | 'CLOSED'>('');
    const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
    const [startDate, endDate] = dateRange;
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // ── Pagination ───────────────────────────────────────────────────────────
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalShifts, setTotalShifts] = useState(0);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [hasPrevPage, setHasPrevPage] = useState(false);
    const [pageSize, setPageSize] = useState(10);

    // ── Data ─────────────────────────────────────────────────────────────────
    const [shifts, setShifts] = useState<CashShift[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1);
        }, 400);
        return () => clearTimeout(t);
    }, [searchTerm]);

    const fetchShifts = useCallback(async () => {
        setIsLoading(true);
        try {
            const params: GetAllCashShiftsParams = {
                page: currentPage,
                limit: pageSize,
                sortBy: 'openedAt',
                sortOrder: 'desc',
            };
            if (branchFilter) params.branchId = branchFilter;
            if (statusFilter) params.status = statusFilter as any;
            if (startDate) params.dateFrom = format(startDate, 'yyyy-MM-dd');
            if (endDate) params.dateTo = format(endDate, 'yyyy-MM-dd');

            const res = await cashShiftService.getAll(params);
            if (res.success && res.data) {
                const d = res.data as any;
                const list: CashShift[] = Array.isArray(d.data) ? d.data : Array.isArray(d) ? d : [];
                setShifts(list);
                if (d.pagination) {
                    setTotalPages(d.pagination.totalPages ?? 1);
                    setTotalShifts(d.pagination.total ?? list.length);
                    setHasNextPage(d.pagination.hasNextPage ?? false);
                    setHasPrevPage(d.pagination.hasPrevPage ?? false);
                } else {
                    setTotalPages(1);
                    setTotalShifts(list.length);
                    setHasNextPage(false);
                    setHasPrevPage(false);
                }
            }
        } catch (err) {
            console.error('[CashShiftHistoryPage] fetch error:', err);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, pageSize, branchFilter, statusFilter, startDate, endDate, debouncedSearch]);

    useEffect(() => {
        fetchShifts();
    }, [fetchShifts]);

    // Reset page when filters change
    const resetPage = () => setCurrentPage(1);

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <>
            <div className="space-y-6 max-w-[1400px] mx-auto min-h-screen bg-background">

                {/* ── Header ──────────────────────────────────────────────────── */}
                <CashShiftHistoryHeader
                    isLoading={isLoading}
                    onRefresh={fetchShifts}
                    onOpenMovement={() => setIsMovementModalOpen(true)}
                />

                {/* ── Filter Bar ──────────────────────────────────────────────── */}
                <CashShiftHistoryFilterBar
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    branchFilter={branchFilter}
                    setBranchFilter={setBranchFilter}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    startDate={startDate}
                    endDate={endDate}
                    setDateRange={setDateRange}
                    resetPage={resetPage}
                    branches={branches}
                />

                {/* ── Table / Mobile Cards ────────────────────────────────────── */}
                <div className="space-y-4">
                    <CashShiftHistoryTable
                        shifts={shifts}
                        isLoading={isLoading}
                        branches={branches}
                        currentPage={currentPage}
                        pageSize={pageSize}
                        totalShifts={totalShifts}
                        totalPages={totalPages}
                        hasPrevPage={hasPrevPage}
                        hasNextPage={hasNextPage}
                        setCurrentPage={setCurrentPage}
                        setPageSize={setPageSize}
                    />

                    <CashShiftHistoryMobileList
                        shifts={shifts}
                        isLoading={isLoading}
                        branches={branches}
                        hasPrevPage={hasPrevPage}
                        hasNextPage={hasNextPage}
                        setCurrentPage={setCurrentPage}
                        totalShifts={totalShifts}
                    />
                </div>
            </div>

            <AddMovementModal
                isOpen={isMovementModalOpen}
                onClose={() => setIsMovementModalOpen(false)}
                onSuccess={() => fetchShifts()}
            />
        </>
    );
}
