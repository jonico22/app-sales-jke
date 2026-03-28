import { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    SlidersHorizontal,
    ChevronDown,
    Pencil,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Building2,
    MapPin,
    Phone as PhoneIcon,
    Mail
} from 'lucide-react';
import { SortableTableHead } from '@/components/shared/SortableTableHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table } from '@/components/ui/table';
import { TableHeader } from '@/components/ui/table';
import { TableBody } from '@/components/ui/table';
import { TableRow } from '@/components/ui/table';
import { TableCell } from '@/components/ui/table';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DropdownMenuContent } from '@/components/ui/dropdown-menu';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { branchOfficeService, type BranchOffice } from '@/services/branch-office.service';
import { alerts } from '@/utils/alerts';
import { BranchOfficeEditPanel } from './components/BranchOfficeEditPanel';
import { BranchOfficeFilterPanel, type FilterValues } from './components/BranchOfficeFilterPanel';

export default function BranchOfficesPage() {
    const [branchOffices, setBranchOffices] = useState<BranchOffice[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [advancedFilters, setAdvancedFilters] = useState<FilterValues>({
        createdBy: undefined,
        createdAtFrom: null,
        createdAtTo: null,
        updatedAtFrom: null,
        updatedAtTo: null,
    });

    // Sorting state
    const [sortBy, setSortBy] = useState<string>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalBranches, setTotalBranches] = useState(0);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [hasPrevPage, setHasPrevPage] = useState(false);
    const [pageSize, setPageSize] = useState(10);

    // Edit panel state
    const [editPanelOpen, setEditPanelOpen] = useState(false);
    const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

    const handleEditBranch = (branchId: string) => {
        setSelectedBranchId(branchId);
        setEditPanelOpen(true);
    };

    const handleNewBranch = () => {
        setSelectedBranchId(null);
        setEditPanelOpen(true);
    };

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            if (searchTerm !== debouncedSearchTerm) {
                setCurrentPage(1);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Reset page when status filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter]);

    const fetchBranches = async () => {
        try {
            setIsLoading(true);
            const params: any = {
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

            // Add advanced filters
            if (advancedFilters.createdBy) {
                params.createdBy = advancedFilters.createdBy;
            }
            if (advancedFilters.createdAtFrom) {
                const date = advancedFilters.createdAtFrom;
                params.createdAtFrom = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            }
            if (advancedFilters.createdAtTo) {
                const date = advancedFilters.createdAtTo;
                params.createdAtTo = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            }
            if (advancedFilters.updatedAtFrom) {
                const date = advancedFilters.updatedAtFrom;
                params.updatedAtFrom = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            }
            if (advancedFilters.updatedAtTo) {
                const date = advancedFilters.updatedAtTo;
                params.updatedAtTo = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            }

            const response = await branchOfficeService.getAll(params);

            setBranchOffices(response.data.data || []);
            setTotalPages(response.data.pagination.totalPages);
            setTotalBranches(response.data.pagination.total);
            setHasNextPage(response.data.pagination.hasNextPage);
            setHasPrevPage(response.data.pagination.hasPrevPage);
        } catch (error: any) {
            console.error('Error fetching branch offices:', error);
            toast.error(error.response?.data?.message || 'Error al cargar las sucursales');
            setBranchOffices([]);
        } finally {
            setIsLoading(false);
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

    useEffect(() => {
        fetchBranches();
    }, [currentPage, debouncedSearchTerm, statusFilter, advancedFilters, pageSize, sortBy, sortOrder]);

    const handleDeleteBranch = async (id: string) => {
        const isConfirmed = await alerts.confirm({
            title: '¿Estás seguro?',
            text: '¿Deseas eliminar esta sucursal? Esta acción no se puede deshacer.',
            confirmButtonText: 'Sí, eliminar',
            confirmButtonColor: '#ef4444'
        });

        if (!isConfirmed) return;

        try {
            await branchOfficeService.delete(id);
            toast.success('Sucursal eliminada exitosamente');
            await fetchBranches();
        } catch (error: any) {
            console.error('Error deleting branch office:', error);
            toast.error(error.response?.data?.message || 'Error al eliminar la sucursal');
        }
    };

    const getStatusLabel = () => {
        switch (statusFilter) {
            case 'active': return 'Activos';
            case 'inactive': return 'Inactivos';
            default: return 'Todos los estados';
        }
    };

    const handleNextPage = () => {
        if (hasNextPage) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const handlePrevPage = () => {
        if (hasPrevPage) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const handleApplyFilters = (filters: FilterValues) => {
        setAdvancedFilters(filters);
        setCurrentPage(1);
        setIsFilterPanelOpen(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-base font-bold text-foreground tracking-tight uppercase">Sucursales</h2>
                    <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Administra las sedes físicas de tu negocio.</p>
                </div>
                <Button 
                    onClick={handleNewBranch}
                    className="h-9 px-4 text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-primary/20 flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" /> Nueva Sucursal
                </Button>
            </div>

            {/* Filters Bar */}
            <div className="bg-card p-3 rounded-2xl border border-border shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                    <Input
                        placeholder="Buscar por nombre, código o ciudad..."
                        className="pl-9 bg-muted/30 border-border h-10 text-xs focus:bg-background transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex w-full sm:w-auto gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="flex-1 sm:flex-none justify-between h-10 text-[11px] font-bold uppercase tracking-wider text-foreground border-border bg-card hover:bg-muted min-w-[160px] rounded-xl transition-all">
                                {getStatusLabel()}
                                <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[180px] bg-card border-border shadow-xl rounded-xl p-1">
                            <DropdownMenuItem className="text-[11px] font-medium py-2 rounded-lg cursor-pointer" onClick={() => setStatusFilter('all')}>
                                Todos los estados
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-[11px] font-medium py-2 rounded-lg cursor-pointer" onClick={() => setStatusFilter('active')}>
                                Solo Activos
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-[11px] font-medium py-2 rounded-lg cursor-pointer" onClick={() => setStatusFilter('inactive')}>
                                Solo Inactivos
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                        variant="outline"
                        className="flex-1 sm:flex-none h-10 text-[11px] font-bold uppercase tracking-wider text-foreground border-border bg-card hover:bg-muted gap-2 rounded-xl transition-all"
                        onClick={() => setIsFilterPanelOpen(true)}
                    >
                        <SlidersHorizontal className="h-4 w-4" />
                        Filtros
                    </Button>
                </div>
            </div>

            {/* Data Table / Cards View */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                {/* Desktop/Tablet Table View */}
                <div className="hidden md:block">
                    <Table>
                    <TableHeader className="bg-muted/50 border-b border-border">
                        <TableRow className="hover:bg-transparent border-none">
                            <SortableTableHead 
                                field="code" 
                                currentSortBy={sortBy} 
                                currentSortOrder={sortOrder} 
                                onSort={handleSort}
                                className="w-[100px] h-10 font-bold text-[10px] uppercase tracking-wider text-muted-foreground/70"
                            >
                                Código
                            </SortableTableHead>
                            <SortableTableHead 
                                field="name" 
                                currentSortBy={sortBy} 
                                currentSortOrder={sortOrder} 
                                onSort={handleSort}
                                className="w-[250px] h-10 font-bold text-[10px] uppercase tracking-wider text-muted-foreground/70"
                            >
                                Nombre
                            </SortableTableHead>
                            <SortableTableHead 
                                field="address" 
                                currentSortBy={sortBy} 
                                currentSortOrder={sortOrder} 
                                onSort={handleSort}
                                className="w-[300px] h-10 font-bold text-[10px] uppercase tracking-wider text-muted-foreground/70"
                            >
                                Dirección
                            </SortableTableHead>
                            <th className="w-[150px] h-10 font-bold text-[10px] uppercase tracking-wider text-muted-foreground/70 px-4">Contacto</th>
                            <SortableTableHead 
                                field="isActive" 
                                currentSortBy={sortBy} 
                                currentSortOrder={sortOrder} 
                                onSort={handleSort}
                                className="w-[100px] h-10 font-bold text-[10px] uppercase tracking-wider text-muted-foreground/70 text-center"
                            >
                                Estado
                            </SortableTableHead>
                            <th className="w-[100px] text-right font-bold text-[10px] uppercase tracking-wider text-muted-foreground/70 px-4">Acciones</th>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center">
                                    <div className="flex items-center justify-center gap-2 text-slate-500">
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <span>Cargando sucursales...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : branchOffices.length > 0 ? (
                            branchOffices.map((branch) => (
                                <TableRow key={branch.id} className="hover:bg-muted/30 border-border transition-colors group">
                                    <TableCell className="font-mono text-[10px] text-muted-foreground">{branch.code}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                <Building2 className="h-4 w-4 text-primary" />
                                            </div>
                                            <div className="text-[11px] font-bold text-foreground">{branch.name}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <MapPin className="h-3.5 w-3.5 shrink-0 opacity-50" />
                                            <span className="text-[11px] line-clamp-1">{branch.address || '—'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            {branch.phone && (
                                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                                                    <PhoneIcon className="h-3 w-3 opacity-50" />
                                                    {branch.phone}
                                                </div>
                                            )}
                                            {branch.email && (
                                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                                                    <Mail className="h-3 w-3 opacity-50" />
                                                    {branch.email}
                                                </div>
                                            )}
                                            {!branch.phone && !branch.email && <span className="text-muted-foreground/40 text-[10px]">Sin contacto</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={branch.isActive ? 'success' : 'outline'} className={`uppercase text-[9px] font-black tracking-tight px-2 py-0.5 rounded-md ${!branch.isActive && 'bg-muted/50 border-border text-muted-foreground'}`}>
                                            {branch.isActive ? 'Activa' : 'Inactiva'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                                onClick={() => handleEditBranch(branch.id)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            {branch.code !== 'ALM-PRINCIPAL' && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => handleDeleteBranch(branch.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-64 text-center">
                                    <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in-50">
                                        <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4 border border-border">
                                            <Building2 className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <h3 className="text-base font-bold text-foreground mb-1">
                                            No se encontraron sucursales
                                        </h3>
                                        <p className="text-muted-foreground max-w-sm mb-6">
                                            No hay sucursales registradas o que coincidan con tu búsqueda.
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-border">
                    {isLoading ? (
                        <div className="p-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span className="text-xs font-medium tracking-tight uppercase">Cargando sucursales...</span>
                        </div>
                    ) : branchOffices.length > 0 ? (
                        branchOffices.map((branch) => (
                            <div key={branch.id} className="p-4 bg-card active:bg-muted/50 transition-colors">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1 min-w-0 pr-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-mono text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                                {branch.code || 'S/C'}
                                            </span>
                                            <Badge variant={branch.isActive ? 'success' : 'secondary'} className="uppercase text-[8px] font-bold px-1.5 py-0 h-4">
                                                {branch.isActive ? 'Activa' : 'Inactiva'}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                                            <h3 className="text-sm font-bold text-foreground leading-tight truncate">{branch.name}</h3>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-muted-foreground"
                                            onClick={() => handleEditBranch(branch.id)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        {branch.code !== 'ALM-PRINCIPAL' && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                                onClick={() => handleDeleteBranch(branch.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2 pt-3 border-t border-border/50">
                                    <div className="flex items-start gap-2 text-muted-foreground">
                                        <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 opacity-60" />
                                        <span className="text-[10px] font-medium leading-relaxed">{branch.address || 'Sin dirección registrada'}</span>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                                        {branch.phone && (
                                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                                                <PhoneIcon className="h-3 w-3 opacity-60" />
                                                {branch.phone}
                                            </div>
                                        )}
                                        {branch.email && (
                                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                                                <Mail className="h-3 w-3 opacity-60" />
                                                <span className="truncate max-w-[150px]">{branch.email}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-12 flex flex-col items-center justify-center text-center">
                            <Building2 className="h-10 w-10 text-muted-foreground/20 mb-3" />
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">No se encontraron sucursales</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                <div className="flex flex-col md:flex-row items-center justify-between p-4 gap-4 border-t border-border bg-card">
                    <div className="flex items-center justify-between w-full md:w-auto gap-4">
                        <div className="text-[11px] text-muted-foreground font-medium whitespace-nowrap">
                            Mostrando <span className="font-bold text-foreground">{branchOffices.length > 0 ? ((currentPage - 1) * pageSize) + 1 : 0}-{Math.min(currentPage * pageSize, totalBranches)}</span> de <span className="font-bold text-foreground">{totalBranches}</span>
                        </div>
                        <select
                            value={pageSize}
                            onChange={(e) => {
                                setPageSize(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="bg-muted/30 border border-border text-foreground text-[10px] font-bold uppercase tracking-wider rounded-lg focus:ring-primary focus:border-primary block p-1.5 h-8 transition-colors hover:bg-muted/50"
                        >
                            <option value="10">10 Filas</option>
                            <option value="20">20 Filas</option>
                            <option value="40">40 Filas</option>
                        </select>
                    </div>
                    <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 disabled:opacity-30 text-muted-foreground border-border bg-card hover:bg-muted rounded-lg transition-all active:scale-95"
                            disabled={!hasPrevPage || isLoading}
                            onClick={handlePrevPage}
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
                            disabled={!hasNextPage || isLoading}
                            onClick={handleNextPage}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Panels */}
            <BranchOfficeEditPanel
                open={editPanelOpen}
                onOpenChange={setEditPanelOpen}
                branchOfficeId={selectedBranchId}
                onSuccess={fetchBranches}
            />

            <BranchOfficeFilterPanel
                open={isFilterPanelOpen}
                onOpenChange={setIsFilterPanelOpen}
                onApplyFilters={handleApplyFilters}
            />
        </div>
    );
}
