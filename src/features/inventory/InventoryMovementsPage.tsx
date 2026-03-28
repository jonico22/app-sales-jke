import { useState, useEffect } from 'react';
import {
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

import { branchMovementService, type BranchMovement, MovementStatus } from '@/services/branch-movement.service';
import { branchOfficeService, type BranchOfficeSelectOption } from '@/services/branch-office.service';
import { toast } from 'sonner';

import { alerts } from '@/utils/alerts';


import { UpdateMovementStatusModal } from './components/UpdateMovementStatusModal';
import { InventoryMovementsHeader } from './components/InventoryMovementsHeader';
import { InventoryMovementsFilterBar } from './components/InventoryMovementsFilterBar';
import { InventoryMovementsTable } from './components/InventoryMovementsTable';
import { InventoryMovementsMobileList } from './components/InventoryMovementsMobileList';

export default function InventoryMovementsPage() {
    const [movements, setMovements] = useState<BranchMovement[]>([]);
    const [branches, setBranches] = useState<BranchOfficeSelectOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Filters
    const [originBranchId, setOriginBranchId] = useState<string>('all');
    const [destinationBranchId, setDestinationBranchId] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [pageSize] = useState(10);

    // Sorting state
    const [sortBy, setSortBy] = useState<string>('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');



    useEffect(() => {
        fetchBranches();
    }, []);

    useEffect(() => {
        fetchMovements();
    }, [currentPage, originBranchId, destinationBranchId, statusFilter, searchTerm, sortBy, sortOrder]);

    const fetchBranches = async () => {
        try {
            const response = await branchOfficeService.getForSelect();
            if (response.success) {
                setBranches(response.data);
            }
        } catch (error) {
            console.error('Error fetching branches:', error);
        }
    };

    // Modals
    const [selectedMovement, setSelectedMovement] = useState<BranchMovement | null>(null);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const fetchMovements = async () => {
        try {
            setIsLoading(true);
            const params = {
                page: currentPage,
                limit: pageSize,
                originBranchId: originBranchId === 'all' ? undefined : originBranchId,
                destinationBranchId: destinationBranchId === 'all' ? undefined : destinationBranchId,
                status: statusFilter === 'all' ? undefined : (statusFilter as MovementStatus),
                sortBy,
                sortOrder,
            };

            const response = await branchMovementService.getAll(params);
            if (response.success) {
                setMovements(response.data.data);
                setTotalPages(response.data.pagination.totalPages);
                setTotalItems(response.data.pagination.total);
            }
        } catch (error) {
            toast.error('Error al cargar los movimientos');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async (status: MovementStatus, cancellationReason?: string) => {
        if (!selectedMovement) return;

        try {
            setIsUpdating(true);
            const response = await branchMovementService.updateStatus(selectedMovement.id, {
                status,
                cancellationReason
            });

            if (response.success) {
                toast.success(`Movimiento ${status === 'COMPLETED' ? 'completado' : 'cancelado'} exitosamente`);
                setIsUpdateModalOpen(false);
                fetchMovements();
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Error al actualizar el estado del movimiento');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteMovement = async (id: string, reference: string) => {
        const isConfirmed = await alerts.confirm({
            title: '¿Estás seguro?',
            text: `¿Deseas eliminar el movimiento ${reference}? Esta acción no se puede deshacer.`,
            confirmButtonText: 'Sí, eliminar',
            confirmButtonColor: '#ef4444'
        });

        if (!isConfirmed) return;

        try {
            const response = await branchMovementService.delete(id);
            if (response.success) {
                toast.success('Movimiento eliminado exitosamente');
                fetchMovements();
            }
        } catch (error) {
            console.error('Error deleting movement:', error);
            toast.error('Error al intentar eliminar el movimiento');
        }
    };

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };



    return (
        <div className=" md:p-6 space-y-4 md:space-y-6 bg-background min-h-full">
            <InventoryMovementsHeader />

            <InventoryMovementsFilterBar
                searchTerm={searchTerm}
                onSearchTermChange={setSearchTerm}
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
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
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
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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
                isLoading={isUpdating}
            />
        </div>
    );
}
