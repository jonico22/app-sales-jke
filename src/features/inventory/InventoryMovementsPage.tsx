import { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Loader2,
    ArrowRightLeft,
    Edit2,
    Trash2,
    History
} from 'lucide-react';
import { SortableTableHead } from '@/components/shared/SortableTableHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table } from '@/components/ui/table';
import { TableHeader } from '@/components/ui/table';
import { TableBody } from '@/components/ui/table';
import { TableRow } from '@/components/ui/table';
import { TableHead } from '@/components/ui/table';
import { TableCell } from '@/components/ui/table';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DropdownMenuContent } from '@/components/ui/dropdown-menu';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { branchMovementService, type BranchMovement, MovementStatus } from '@/services/branch-movement.service';
import { branchOfficeService, type BranchOfficeSelectOption } from '@/services/branch-office.service';
import { toast } from 'sonner';
import { format, parse } from 'date-fns';
import { es } from 'date-fns/locale';
import { alerts } from '@/utils/alerts';

import { useNavigate } from 'react-router-dom';
import { UpdateMovementStatusModal } from './components/UpdateMovementStatusModal';

export default function InventoryMovementsPage() {
    const navigate = useNavigate();
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

    const getBranchName = (id: string, type: 'origin' | 'destination') => {
        if (id === 'all') return type === 'origin' ? 'Todas las sedes (Origen)' : 'Todas las sedes (Destino)';
        return branches.find(b => b.id === id)?.name || (type === 'origin' ? 'Sucursal Origen' : 'Sucursal Destino');
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'all': return 'Todos los estados';
            case 'PENDING': return 'En Tránsito';
            case 'COMPLETED': return 'Recibido';
            case 'CANCELLED': return 'Cancelado';
            default: return status;
        }
    };

    const formatDateSafe = (dateString: string | undefined | null, formatStr: string) => {
        if (!dateString) return '-';
        try {
            // First try direct Date parsing (ISO)
            let date = new Date(dateString);

            // If failed, try parsing the specific format from the snippet: DD/MM/YYYY HH:mm:ss
            if (isNaN(date.getTime()) && dateString.includes('/')) {
                date = parse(dateString, 'dd/MM/yyyy HH:mm:ss', new Date());
            }

            if (isNaN(date.getTime())) return '-';
            return format(date, formatStr, { locale: es });
        } catch (e) {
            return '-';
        }
    };

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

    const getStatusBadge = (status: MovementStatus) => {
        switch (status) {
            case 'PENDING':
                return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20">En Tránsito</Badge>;
            case 'COMPLETED':
                return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20">Recibido</Badge>;
            case 'CANCELLED':
                return <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20">Cancelado</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className=" md:p-6 space-y-4 md:space-y-6 bg-background min-h-full">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4">
                <div>
                    <h1 className="text-sm md:text-lg font-bold text-foreground tracking-tight uppercase">Movimientos entre Sucursales</h1>
                    <p className="text-muted-foreground text-[10px] md:text-sm mt-0.5 md:mt-1 flex items-center gap-2">
                        Gestione y rastree traslados internos de mercancía.
                    </p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Button
                        onClick={() => navigate('/inventory/movements/bulk')}
                        variant="outline"
                        className="flex-1 md:flex-none h-8 md:h-9 px-3 md:px-4 text-[9px] md:text-[11px] font-extrabold uppercase tracking-wider text-primary border-border bg-card hover:bg-muted gap-1.5 md:gap-2 rounded-xl transition-all"
                    >
                        <ArrowRightLeft className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        Traslado en Bloque
                    </Button>
                    <Button
                        onClick={() => navigate('/inventory/movements/new')}
                        className="flex-1 md:flex-none h-8 md:h-9 px-3 md:px-4 text-[9px] md:text-[11px] font-extrabold uppercase tracking-wider bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 md:gap-2 shadow-lg shadow-primary/20 rounded-xl transition-all"
                    >
                        <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        Nuevo Traslado
                    </Button>
                </div>
            </div>
            {/* Filter bar */}
            <div className="bg-card p-3 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row gap-2 md:gap-4 items-center">
                <div className="relative w-full md:min-w-[300px] md:max-w-md flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                    <Input
                        placeholder="Buscar por ID o responsable..."
                        className="pl-9 bg-muted/30 border-border h-10 text-xs focus:bg-background transition-colors rounded-xl font-medium w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap w-full md:w-auto gap-2 items-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="flex-1 md:flex-none justify-between h-10 text-[10px] font-black uppercase tracking-widest text-foreground border-border bg-card hover:bg-muted min-w-[140px] md:min-w-[180px] rounded-xl transition-all">
                                {getBranchName(originBranchId, 'origin')}
                                <ChevronDown className="w-3 h-3 ml-2 opacity-30" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px] bg-card border-border shadow-2xl rounded-xl p-1 animate-in fade-in zoom-in-95 duration-200">
                            <DropdownMenuItem className="text-[10px] py-2 font-bold uppercase tracking-wider rounded-lg cursor-pointer transition-colors hover:bg-muted" onClick={() => setOriginBranchId('all')}>Todas las sedes (Origen)</DropdownMenuItem>
                            {branches.map(branch => (
                                <DropdownMenuItem key={branch.id} className="text-[10px] py-2 font-bold uppercase tracking-wider rounded-lg cursor-pointer transition-colors hover:bg-muted" onClick={() => setOriginBranchId(branch.id)}>
                                    {branch.name}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="flex-1 md:flex-none justify-between h-10 text-[10px] font-black uppercase tracking-widest text-foreground border-border bg-card hover:bg-muted min-w-[140px] md:min-w-[180px] rounded-xl transition-all">
                                {getBranchName(destinationBranchId, 'destination')}
                                <ChevronDown className="w-3 h-3 ml-2 opacity-30" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px] bg-card border-border shadow-2xl rounded-xl p-1 animate-in fade-in zoom-in-95 duration-200">
                            <DropdownMenuItem className="text-[10px] py-2 font-bold uppercase tracking-wider rounded-lg cursor-pointer transition-colors hover:bg-muted" onClick={() => setDestinationBranchId('all')}>Todas las sedes (Destino)</DropdownMenuItem>
                            {branches.map(branch => (
                                <DropdownMenuItem key={branch.id} className="text-[10px] py-2 font-bold uppercase tracking-wider rounded-lg cursor-pointer transition-colors hover:bg-muted" onClick={() => setDestinationBranchId(branch.id)}>
                                    {branch.name}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="flex-1 md:flex-none justify-between h-10 text-[10px] font-black uppercase tracking-widest text-foreground border-border bg-card hover:bg-muted min-w-[130px] md:min-w-[160px] rounded-xl transition-all">
                                {getStatusLabel(statusFilter)}
                                <ChevronDown className="w-3 h-3 ml-2 opacity-30" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[180px] bg-card border-border shadow-2xl rounded-xl p-1 animate-in fade-in zoom-in-95 duration-200">
                            <DropdownMenuItem className="text-[10px] py-2 font-bold uppercase tracking-wider rounded-lg cursor-pointer transition-colors hover:bg-muted" onClick={() => setStatusFilter('all')}>Todos los estados</DropdownMenuItem>
                            <DropdownMenuItem className="text-[10px] py-2 font-bold uppercase tracking-wider rounded-lg cursor-pointer text-blue-500 hover:bg-blue-500/10" onClick={() => setStatusFilter('PENDING')}>En Tránsito</DropdownMenuItem>
                            <DropdownMenuItem className="text-[10px] py-2 font-bold uppercase tracking-wider rounded-lg cursor-pointer text-emerald-500 hover:bg-emerald-500/10" onClick={() => setStatusFilter('COMPLETED')}>Recibido</DropdownMenuItem>
                            <DropdownMenuItem className="text-[10px] py-2 font-bold uppercase tracking-wider rounded-lg cursor-pointer text-rose-500 hover:bg-rose-500/10" onClick={() => setStatusFilter('CANCELLED')}>Cancelado</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Table section / Cards View */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden min-h-[400px]">
                {/* Desktop/Tablet Table View */}
                <div className="hidden md:block">
                    <Table>
                        <TableHeader className="bg-muted/30 border-b border-border">
                            <TableRow className="hover:bg-transparent border-none">
                                <SortableTableHead
                                    field="referenceCode"
                                    currentSortBy={sortBy}
                                    currentSortOrder={sortOrder}
                                    onSort={handleSort}
                                    className="font-black text-[9px] uppercase tracking-[0.15em] text-muted-foreground/70 py-4 px-6"
                                >
                                    Referencia
                                </SortableTableHead>
                                <SortableTableHead
                                    field="createdAt"
                                    currentSortBy={sortBy}
                                    currentSortOrder={sortOrder}
                                    onSort={handleSort}
                                    className="font-black text-[9px] uppercase tracking-[0.15em] text-muted-foreground/70 py-4 text-center"
                                >
                                    Fecha
                                </SortableTableHead>
                                <SortableTableHead
                                    field="productName"
                                    currentSortBy={sortBy}
                                    currentSortOrder={sortOrder}
                                    onSort={handleSort}
                                    className="font-black text-[9px] uppercase tracking-[0.15em] text-muted-foreground/70 py-4"
                                >
                                    Producto
                                </SortableTableHead>
                                <SortableTableHead
                                    field="originBranchName"
                                    currentSortBy={sortBy}
                                    currentSortOrder={sortOrder}
                                    onSort={handleSort}
                                    className="font-black text-[9px] uppercase tracking-[0.15em] text-muted-foreground/70 py-4"
                                >
                                    Ruta (Origen → Destino)
                                </SortableTableHead>
                                <SortableTableHead
                                    field="quantityMoved"
                                    currentSortBy={sortBy}
                                    currentSortOrder={sortOrder}
                                    onSort={handleSort}
                                    className="font-black text-[9px] uppercase tracking-[0.15em] text-muted-foreground/70 py-4 text-center"
                                >
                                    Cant.
                                </SortableTableHead>
                                <SortableTableHead
                                    field="notes"
                                    currentSortBy={sortBy}
                                    currentSortOrder={sortOrder}
                                    onSort={handleSort}
                                    className="font-black text-[9px] uppercase tracking-[0.15em] text-muted-foreground/70 py-4"
                                >
                                    Observación / Motivo
                                </SortableTableHead>
                                <SortableTableHead
                                    field="status"
                                    currentSortBy={sortBy}
                                    currentSortOrder={sortOrder}
                                    onSort={handleSort}
                                    className="font-black text-[9px] uppercase tracking-[0.15em] text-muted-foreground/70 py-4 text-center"
                                >
                                    Estado
                                </SortableTableHead>
                                <TableHead className="font-black text-[9px] uppercase tracking-[0.15em] text-muted-foreground/70 py-4 px-6 text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow className="border-none">
                                    <TableCell colSpan={8} className="h-64 text-center border-none">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Sincronizando movimientos...</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : movements.length === 0 ? (
                                <TableRow className="border-none">
                                    <TableCell colSpan={8} className="h-64 text-center border-none">
                                        <div className="flex flex-col items-center justify-center gap-4">
                                            <div className="p-5 bg-muted/30 rounded-full">
                                                <History className="h-10 w-10 text-muted-foreground/30" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-foreground font-black text-xs uppercase tracking-wider">No se encontraron movimientos</p>
                                                <p className="text-muted-foreground text-[10px] font-medium max-w-[250px] mx-auto opacity-70">Ajusta los filtros para visualizar el historial de traslados internos.</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                movements.map((movement) => (
                                    <TableRow key={movement.id} className="group hover:bg-muted/30 transition-colors border-border/40 last:border-none">
                                        <TableCell className="px-6">
                                            <div className="inline-flex items-center gap-1.5 py-1 px-2.5 bg-primary/5 rounded-lg border border-primary/10">
                                                <span className="font-black text-primary text-[10px] uppercase tracking-tighter">
                                                    {movement.referenceCode || `TR-${movement.id.slice(0, 5).toUpperCase()}`}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="text-foreground font-extrabold text-[11px] mb-0.5">{formatDateSafe(movement.createdAt, 'dd/MM/yyyy')}</span>
                                                <span className="text-muted-foreground text-[9px] uppercase font-bold tracking-tighter opacity-60">{formatDateSafe(movement.createdAt, 'HH:mm:ss')}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-foreground font-black text-[11px] uppercase tracking-tight">{movement.product?.name || 'Producto'}</span>
                                                <span className="text-muted-foreground text-[9px] font-bold opacity-60">SKU-{movement.product?.code || '---'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className="text-foreground/80 truncate max-w-[100px] text-[10px] font-bold uppercase tracking-tight">
                                                    {movement.originBranch?.name || 'Origen'}
                                                </span>
                                                <ArrowRightLeft className="w-2.5 h-2.5 text-muted-foreground/30" />
                                                <span className="text-foreground/80 truncate max-w-[100px] text-[10px] font-bold uppercase tracking-tight">
                                                    {movement.destinationBranch?.name || 'Destino'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="inline-flex items-center justify-center font-black text-foreground text-[11px] h-7 w-7 bg-muted/40 rounded-full border border-border/30">
                                                {movement.quantityMoved}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col max-w-[200px]">
                                                {movement.status === 'CANCELLED' ? (
                                                    <span className="text-rose-500 text-[10px] font-bold uppercase tracking-tight leading-tight italic">
                                                        {movement.cancellationReason || 'Sin motivo de cancelación'}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground/60 text-[10px] font-medium truncate italic">
                                                        {movement.notes || '---'}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {getStatusBadge(movement.status)}
                                        </TableCell>
                                        <TableCell className="text-right px-6">
                                            <div className="flex items-center justify-end gap-1.5 transition-all duration-200">
                                                {movement.status === 'PENDING' && (
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors border-border hover:border-primary/10"
                                                        onClick={() => {
                                                            setSelectedMovement(movement);
                                                            setIsUpdateModalOpen(true);
                                                        }}
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors border-border hover:border-rose-500/10"
                                                    onClick={() => handleDeleteMovement(movement.id, movement.referenceCode || movement.id)}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-border">
                    {isLoading ? (
                        <div className="p-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
                            <p className="text-[10px] font-bold uppercase tracking-widest">Sincronizando...</p>
                        </div>
                    ) : movements.length === 0 ? (
                        <div className="p-12 flex flex-col items-center justify-center text-center gap-4">
                            <History className="h-10 w-10 text-muted-foreground/20" />
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">No se encontraron movimientos</p>
                        </div>
                    ) : (
                        movements.map((movement) => (
                            <div key={movement.id} className="p-4 bg-card active:bg-muted/50 transition-colors">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1 min-w-0 pr-4">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className="font-mono text-[9px] font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/10 uppercase">
                                                {movement.referenceCode || `TR-${movement.id.slice(0, 5).toUpperCase()}`}
                                            </span>
                                            {getStatusBadge(movement.status)}
                                        </div>
                                        <h3 className="text-sm font-bold text-foreground leading-tight">{movement.product?.name || 'Producto'}</h3>
                                        <div className="flex items-center gap-1.5 mt-1 text-[10px] text-muted-foreground font-medium">
                                            <span>SKU-{movement.product?.code || '---'}</span>
                                            <span className="opacity-30">•</span>
                                            <span>{formatDateSafe(movement.createdAt, 'dd/MM/yyyy')}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 shrink-0">
                                        {movement.status === 'PENDING' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-muted-foreground"
                                                onClick={() => {
                                                    setSelectedMovement(movement);
                                                    setIsUpdateModalOpen(true);
                                                }}
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-500"
                                            onClick={() => handleDeleteMovement(movement.id, movement.referenceCode || movement.id)}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="bg-muted/30 rounded-xl p-2.5 border border-border/50 mb-2">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-wider mb-0.5">Origen</p>
                                            <p className="text-[11px] font-bold text-foreground truncate">{movement.originBranch?.name || 'Origen'}</p>
                                        </div>
                                        <div className="flex flex-col items-center px-2">
                                            <div className="h-6 w-6 rounded-full bg-background border border-border flex items-center justify-center text-[11px] font-black text-primary shadow-sm mb-1">
                                                {movement.quantityMoved}
                                            </div>
                                            <ArrowRightLeft className="w-3 h-3 text-muted-foreground/30" />
                                        </div>
                                        <div className="flex-1 min-w-0 text-right">
                                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-wider mb-0.5">Destino</p>
                                            <p className="text-[11px] font-bold text-foreground truncate">{movement.destinationBranch?.name || 'Destino'}</p>
                                        </div>
                                    </div>
                                </div>

                                {(movement.notes || movement.cancellationReason) && (
                                    <div className="text-[10px] italic">
                                        {movement.status === 'CANCELLED' ? (
                                            <p className="text-rose-500 font-bold uppercase tracking-tight">Motivo: {movement.cancellationReason}</p>
                                        ) : (
                                            <p className="text-muted-foreground font-medium line-clamp-2">Nota: {movement.notes}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

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
