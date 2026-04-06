import { useBranchStore } from '@/store/branch.store';
import { AddMovementModal } from './components/AddMovementModal';
import { CashShiftHistoryHeader } from './components/CashShiftHistoryHeader';
import { CashShiftHistoryFilterBar } from './components/CashShiftHistoryFilterBar';
import { CashShiftHistoryTable } from './components/CashShiftHistoryTable';
import { CashShiftHistoryMobileList } from './components/CashShiftHistoryMobileList';
import { useCashShiftFilters } from './hooks/useCashShiftFilters';
import { useCashShiftsQuery } from './hooks/useCashShiftQueries';
import { useState } from 'react';

export default function CashShiftHistoryPage() {
    const { branches } = useBranchStore();

    // ── Logic Hooks ────────────────────────────────────────────────────────
    const {
        searchTerm,
        setSearchTerm,
        branchFilter,
        setBranchFilter,
        statusFilter,
        setStatusFilter,
        startDate,
        endDate,
        setDateRange,
        resetPage,
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        queryParams
    } = useCashShiftFilters();

    const { data, isLoading, refetch } = useCashShiftsQuery(queryParams);

    // ── Local UI State ─────────────────────────────────────────────────────
    const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);

    // ── Data Processing ────────────────────────────────────────────────────
    const res = data?.data;
    const shifts = Array.isArray(res?.data) ? res?.data : Array.isArray(res) ? res : [];
    const pagination = res?.pagination;

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <>
            <div className="space-y-6 max-w-[1400px] mx-auto min-h-screen bg-background">

                {/* ── Header ──────────────────────────────────────────────────── */}
                <CashShiftHistoryHeader
                    isLoading={isLoading}
                    onRefresh={() => refetch()}
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
                        totalShifts={pagination?.total ?? shifts.length}
                        totalPages={pagination?.totalPages ?? 1}
                        hasPrevPage={pagination?.hasPrevPage ?? false}
                        hasNextPage={pagination?.hasNextPage ?? false}
                        setCurrentPage={setCurrentPage}
                        setPageSize={setPageSize}
                    />

                    <CashShiftHistoryMobileList
                        shifts={shifts}
                        isLoading={isLoading}
                        branches={branches}
                        hasPrevPage={pagination?.hasPrevPage ?? false}
                        hasNextPage={pagination?.hasNextPage ?? false}
                        setCurrentPage={setCurrentPage}
                        totalShifts={pagination?.total ?? shifts.length}
                    />
                </div>
            </div>

            <AddMovementModal
                isOpen={isMovementModalOpen}
                onClose={() => setIsMovementModalOpen(false)}
                onSuccess={() => refetch()}
            />
        </>
    );
}
