import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type BranchMovement, MovementStatus } from '@/services/branch-movement.service';
import { toast } from 'sonner';
import { useMovementsQuery, useUpdateMovementStatus, useDeleteMovement } from './hooks/useMovementQueries';
import { useMovementFilters } from './hooks/useMovementFilters';
import { useBranchOfficesSelect } from './hooks/useBranchOfficeQueries';

import { alerts } from '@/utils/alerts';


import { UpdateMovementStatusModal } from './components/UpdateMovementStatusModal';
import { InventoryMovementsHeader } from './components/InventoryMovementsHeader';
import { InventoryMovementsFilterBar } from './components/InventoryMovementsFilterBar';
import { InventoryMovementsTable } from './components/InventoryMovementsTable';
import { InventoryMovementsMobileList } from './components/InventoryMovementsMobileList';

export default function InventoryMovementsPage() {
    const {
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
        getQueryParams
    } = useMovementFilters();

    // Queries and Mutations
    const { data: branches = [] } = useBranchOfficesSelect();
    const { data: movementsData, isLoading } = useMovementsQuery(getQueryParams());
    const updateMutation = useUpdateMovementStatus();
    const deleteMutation = useDeleteMovement();

    const movements = movementsData?.data || [];
    const totalItems = movementsData?.pagination.total || 0;
    const totalPages = movementsData?.pagination.totalPages || 1;

    // Modals state
    const [selectedMovement, setSelectedMovement] = useState<BranchMovement | null>(null);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

    const handleUpdateStatus = async (status: MovementStatus, cancellationReason?: string) => {
        if (!selectedMovement) return;

        await updateMutation.mutateAsync({
            id: selectedMovement.id,
            data: { status, cancellationReason }
        });

        toast.success(`Movimiento ${status === 'COMPLETED' ? 'completado' : 'cancelado'} exitosamente`);
        setIsUpdateModalOpen(false);
    };

    const handleDeleteMovement = async (id: string, reference: string) => {
        const isConfirmed = await alerts.confirm({
            title: '¿Estás seguro?',
            text: `¿Deseas eliminar el movimiento ${reference}? Esta acción no se puede deshacer.`,
            confirmButtonText: 'Sí, eliminar',
            confirmButtonColor: '#ef4444'
        });

        if (!isConfirmed) return;

        await deleteMutation.mutateAsync(id);
    };



    return (
        <div className=" md:p-6 space-y-4 md:space-y-6 bg-background min-h-full">
            <InventoryMovementsHeader />

            <InventoryMovementsFilterBar
                originBranchId={originBranchId}
                onOriginBranchChange={setOriginBranchId}
                destinationBranchId={destinationBranchId}
                onDestinationBranchChange={setDestinationBranchId}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                branches={branches}
            />

            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden min-h-[400px]">
                <InventoryMovementsTable
                    movements={movements}
                    isLoading={isLoading}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                    onEdit={(movement) => {
                        setSelectedMovement(movement);
                        setIsUpdateModalOpen(true);
                    }}
                    onDelete={handleDeleteMovement}
                />

                <InventoryMovementsMobileList
                    movements={movements}
                    isLoading={isLoading}
                    onEdit={(movement) => {
                        setSelectedMovement(movement);
                        setIsUpdateModalOpen(true);
                    }}
                    onDelete={handleDeleteMovement}
                />

                {/* Pagination */}
                <div className="flex flex-col md:flex-row items-center justify-between p-4 gap-4 border-t border-border bg-card">
                    <div className="text-[11px] text-muted-foreground font-medium w-full md:w-auto text-center md:text-left">
                        Mostrando <span className="font-bold text-foreground">{movements.length > 0 ? ((currentPage - 1) * pageSize) + 1 : 0}-{Math.min(currentPage * pageSize, totalItems)}</span> de <span className="font-bold text-foreground">{totalItems}</span> registros
                    </div>
                    <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 disabled:opacity-30 text-muted-foreground border-border bg-card hover:bg-muted rounded-lg transition-all active:scale-95"
                            disabled={currentPage === 1 || isLoading}
                            onClick={() => setCurrentPage((p: number) => Math.max(1, p - 1))}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider min-w-[80px] text-center">
                            Página {currentPage} / {totalPages}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 disabled:opacity-30 text-muted-foreground border-border bg-card hover:bg-muted rounded-lg transition-all active:scale-95"
                            disabled={currentPage === totalPages || isLoading}
                            onClick={() => setCurrentPage((p: number) => Math.min(totalPages, p + 1))}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <UpdateMovementStatusModal
                isOpen={isUpdateModalOpen}
                onClose={() => setIsUpdateModalOpen(false)}
                onConfirm={handleUpdateStatus}
                movement={selectedMovement}
                isLoading={updateMutation.isPending}
            />
        </div>
    );
}
