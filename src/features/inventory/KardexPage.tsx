import { useState, useEffect } from 'react';
import { 
    Search, 
    RefreshCw, 
    Download, 
    SlidersHorizontal,
    FileText,
    Clock,
    ChevronLeft,
    ChevronRight,
    ArrowUpCircle,
    ArrowDownCircle,
    Truck,
    ShoppingCart,
    PlusCircle,
    MinusCircle,
    Package,
    ArrowRightLeft,
    ChevronDown
} from 'lucide-react';
import { SortableTableHead } from '@/components/shared/SortableTableHead';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { kardexService } from '@/services/kardex.service';
import type { KardexTransaction, KardexMovementType } from '@/services/kardex.service';
import { KardexFilterPanel, type KardexFilterValues } from './components/KardexFilterPanel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { exportToExcel } from '@/utils/excel.utils';
import { ManualAdjustmentModal } from './components/ManualAdjustmentModal';

export default function KardexPage() {
    const [transactions, setTransactions] = useState<KardexTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [hasPrevPage, setHasPrevPage] = useState(false);
    const [pageSize, setPageSize] = useState(20);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
    const [filters, setFilters] = useState<KardexFilterValues>({});

    // Sorting state
    const [sortBy, setSortBy] = useState<string>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchHistory();
    }, [currentPage, pageSize, debouncedSearch, filters, sortBy, sortOrder]);

    const fetchHistory = async () => {
        setIsLoading(true);
        try {
            const response = await kardexService.getHistory({
                page: currentPage,
                limit: pageSize,
                search: debouncedSearch,
                sortBy,
                sortOrder,
                ...filters
            });

            if (response.success && response.data) {
                setTransactions(response.data.data);
                setTotalPages(response.data.pagination.totalPages);
                setTotalRecords(response.data.pagination.total);
                setHasNextPage(response.data.pagination.hasNextPage);
                setHasPrevPage(response.data.pagination.hasPrevPage);
            }
        } catch (error) {
            console.error('Error fetching kardex:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getMovementTypeBadge = (type: KardexMovementType) => {
        const configs: Record<KardexMovementType, { label: string; bg: string; text: string; icon: any }> = {
            'SALE_EXIT': { label: 'Venta', bg: 'bg-emerald-500/10', text: 'text-emerald-500', icon: ShoppingCart },
            'TRANSFER_OUT': { label: 'Salida Traslado', bg: 'bg-orange-500/10', text: 'text-orange-500', icon: Truck },
            'TRANSFER_IN': { label: 'Entrada Traslado', bg: 'bg-sky-500/10', text: 'text-sky-500', icon: Truck },
            'ADJUSTMENT_ADD': { label: 'Ajuste (+)', bg: 'bg-emerald-500/10', text: 'text-emerald-500', icon: PlusCircle },
            'ADJUSTMENT_SUB': { label: 'Ajuste (-)', bg: 'bg-red-500/10', text: 'text-red-500', icon: MinusCircle },
            'PURCHASE_ENTRY': { label: 'Compra', bg: 'bg-emerald-500/10', text: 'text-emerald-500', icon: ArrowUpCircle },
            'RETURN_ENTRY': { label: 'Devolución', bg: 'bg-emerald-500/10', text: 'text-emerald-500', icon: ArrowUpCircle },
            'SOCIETY_TRANSFER_IN': { label: 'Entrada Soc.', bg: 'bg-sky-500/10', text: 'text-sky-500', icon: ArrowUpCircle },
            'SOCIETY_TRANSFER_OUT': { label: 'Salida Soc.', bg: 'bg-orange-500/10', text: 'text-orange-500', icon: ArrowDownCircle },
        };

        const config = configs[type] || { label: type, bg: 'bg-muted', text: 'text-muted-foreground', icon: FileText };
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${config.bg} ${config.text}`}>
                <Icon size={12} className="shrink-0" />
                {config.label}
            </span>
        );
    };

    const handleExport = () => {
        const columns = [
            { header: 'Fecha', key: (t: KardexTransaction) => format(new Date(t.date), 'dd/MM/yyyy HH:mm'), width: 20 },
            { header: 'Producto', key: (t: KardexTransaction) => t.product?.name || '-', width: 30 },
            { header: 'Sucursal', key: (t: KardexTransaction) => t.branchOffice?.name || '-', width: 20 },
            { header: 'Tipo', key: (t: KardexTransaction) => t.type, width: 15 },
            { header: 'Documento', key: (t: KardexTransaction) => t.documentNumber || '-', width: 20 },
            { header: 'Cantidad', key: (t: KardexTransaction) => t.quantity, width: 12 },
            { header: 'Stock Ant.', key: (t: KardexTransaction) => t.previousStock, width: 12 },
            { header: 'Stock Nuevo', key: (t: KardexTransaction) => t.newStock, width: 12 },
            { header: 'Costo Unit.', key: (t: KardexTransaction) => t.unitCost, width: 12 },
            { header: 'Notas', key: (t: KardexTransaction) => t.notes || '-', width: 40 },
        ];
        
        exportToExcel(
            transactions,
            columns,
            `Kardex_${format(new Date(), 'yyyy-MM-dd')}`,
            'Historial de Inventario'
        );
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
        <div className="space-y-6 max-w-[1400px] mx-auto min-h-screen bg-background">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-black text-foreground tracking-tight uppercase">Kardex / Historial de Stock</h1>
                    <p className="text-muted-foreground text-[10px] mt-0.5 font-bold uppercase tracking-widest opacity-60">Seguimiento detallado de entradas y salidas de inventario</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 lg:gap-3">
                    <Button
                        variant="outline"
                        onClick={handleExport}
                        className="flex-1 sm:flex-none h-9 md:h-10 px-3 md:px-4 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest bg-card border-border hover:bg-muted shadow-sm transition-all active:scale-95"
                    >
                        <Download className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" />
                        Exportar
                    </Button>
                    <Button
                        onClick={() => setIsAdjustmentModalOpen(true)}
                        className="flex-1 sm:flex-none h-9 md:h-10 px-3 md:px-4 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all active:scale-95 border-none"
                    >
                        <PlusCircle className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" />
                        Ajuste
                    </Button>
                    <Button
                        onClick={fetchHistory}
                        className="flex-1 sm:flex-none h-9 md:h-10 px-3 md:px-4 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all active:scale-95"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Sincronizar
                    </Button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-card p-3 rounded-2xl border border-border shadow-sm flex flex-col xl:flex-row gap-3 items-center justify-between">
                <div className="relative w-full xl:max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={16} />
                    <input
                        type="text"
                        placeholder="BUSCAR POR PRODUCTO O DOCUMENTO..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-muted/20 border border-border/50 rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary text-[11px] font-bold uppercase tracking-widest outline-none transition-all placeholder:text-muted-foreground/30"
                    />
                </div>

                <div className="flex items-center gap-2 w-full xl:w-auto">
                    <Button
                        variant="outline"
                        onClick={() => setIsFilterOpen(true)}
                        className="flex-1 sm:flex-none h-10 px-4 rounded-xl bg-card border-border text-[10px] font-black uppercase tracking-widest hover:bg-muted transition-all active:scale-95"
                    >
                        <SlidersHorizontal className="w-4 h-4 mr-2 opacity-60" />
                        Filtros Avanzados
                        {Object.keys(filters).length > 0 && (
                            <Badge className="ml-2 bg-primary text-primary-foreground px-1.5 h-4 text-[8px] font-black min-w-4 justify-center">
                                {Object.keys(filters).length}
                            </Badge>
                        )}
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden min-h-[400px]">
                {/* Desktop View */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/30 border-b border-border">
                            <tr>
                                <SortableTableHead 
                                    field="date" 
                                    currentSortBy={sortBy} 
                                    currentSortOrder={sortOrder} 
                                    onSort={handleSort}
                                    className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60"
                                >
                                    Fecha / Hora
                                </SortableTableHead>
                                <SortableTableHead 
                                    field="productName" 
                                    currentSortBy={sortBy} 
                                    currentSortOrder={sortOrder} 
                                    onSort={handleSort}
                                    className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60"
                                >
                                    Producto
                                </SortableTableHead>
                                <SortableTableHead 
                                    field="branchOfficeName" 
                                    currentSortBy={sortBy} 
                                    currentSortOrder={sortOrder} 
                                    onSort={handleSort}
                                    className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60"
                                >
                                    Sucursal
                                </SortableTableHead>
                                <SortableTableHead 
                                    field="type" 
                                    currentSortBy={sortBy} 
                                    currentSortOrder={sortOrder} 
                                    onSort={handleSort}
                                    className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60"
                                >
                                    Operación
                                </SortableTableHead>
                                <SortableTableHead 
                                    field="quantity" 
                                    currentSortBy={sortBy} 
                                    currentSortOrder={sortOrder} 
                                    onSort={handleSort}
                                    className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60"
                                >
                                    Stock Movido
                                </SortableTableHead>
                                <SortableTableHead 
                                    field="newStock" 
                                    currentSortBy={sortBy} 
                                    currentSortOrder={sortOrder} 
                                    onSort={handleSort}
                                    className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60"
                                >
                                    Balance
                                </SortableTableHead>
                                <SortableTableHead 
                                    field="documentNumber" 
                                    currentSortBy={sortBy} 
                                    currentSortOrder={sortOrder} 
                                    onSort={handleSort}
                                    className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60"
                                >
                                    Documento
                                </SortableTableHead>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {isLoading && transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-24 text-center">
                                        <RefreshCw size={32} className="animate-spin text-primary/20 mx-auto mb-4" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Sincronizando con el servidor...</p>
                                    </td>
                                </tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-24 text-center">
                                        <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <FileText size={24} className="text-muted-foreground/30" />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">No se encontraron movimientos registrados</p>
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-muted/5 transition-colors group">
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-black text-foreground uppercase tracking-tight">
                                                    {format(new Date(t.date), 'dd MMM yyyy', { locale: es })}
                                                </span>
                                                <span className="text-[10px] font-bold text-muted-foreground/60">
                                                    {format(new Date(t.date), 'hh:mm a')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-muted/40 flex items-center justify-center shrink-0 border border-border/50">
                                                    <Package size={14} className="text-muted-foreground/60" />
                                                </div>
                                                <div className="flex flex-col min-w-0 max-w-[250px]">
                                                    <span className="text-[11px] font-black text-foreground uppercase tracking-tight truncate leading-tight">
                                                        {t.product?.name || 'PRODUCTO DESCONOCIDO'}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                                                        {t.product?.code || 'SIN CÓDIGO'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <span className="text-[10px] font-black text-foreground uppercase tracking-widest">
                                                {t.branchOffice?.name || '-'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            {getMovementTypeBadge(t.type)}
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <span className={`text-[13px] font-black tracking-tighter ${
                                                t.quantity > 0 ? 'text-emerald-500' : 'text-rose-500'
                                            }`}>
                                                {t.quantity > 0 ? '+' : ''}{t.quantity}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tight">
                                                    {t.previousStock}
                                                </span>
                                                <ArrowRightLeft className="w-2.5 h-2.5 text-muted-foreground/30" />
                                                <span className="text-[12px] font-black text-foreground uppercase tracking-tight">
                                                    {t.newStock}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            {t.documentNumber ? (
                                                <div className="flex items-center gap-2">
                                                    <FileText size={12} className="text-primary/50" />
                                                    <span className="text-[10px] font-black text-foreground uppercase tracking-widest">
                                                        {t.documentNumber}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] font-bold text-muted-foreground/30 italic uppercase tracking-widest">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View */}
                <div className="lg:hidden p-3 space-y-3">
                    {transactions.map((t) => (
                        <div key={t.id} className="bg-muted/10 rounded-2xl border border-border/50 p-4 space-y-4">
                            <div className="flex items-start justify-between">
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center shrink-0 shadow-sm">
                                        <Package size={18} className="text-primary/60" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest">Producto</p>
                                        <h3 className="text-[12px] font-black text-foreground uppercase tracking-tight leading-tight">
                                            {t.product?.name}
                                        </h3>
                                        <p className="text-[9px] font-bold text-muted-foreground/60">{t.product?.code}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest">Cantidad</p>
                                    <span className={`text-[16px] font-black tracking-tighter ${
                                        t.quantity > 0 ? 'text-emerald-500' : 'text-rose-500'
                                    }`}>
                                        {t.quantity > 0 ? '+' : ''}{t.quantity}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/30">
                                <div>
                                    <p className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest mb-1.5">Operación</p>
                                    {getMovementTypeBadge(t.type)}
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest mb-1.5">Balance</p>
                                    <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-2 py-1.5 w-fit">
                                        <span className="text-[10px] font-bold text-muted-foreground/60">{t.previousStock}</span>
                                        <ArrowRightLeft className="w-2.5 h-2.5 text-muted-foreground/30" />
                                        <span className="text-[11px] font-black text-foreground">{t.newStock}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-border/30 bg-muted/5 -mx-4 -mb-4 px-4 py-3 rounded-b-2xl">
                                <div className="flex items-center gap-2 text-muted-foreground/70">
                                    <Clock size={12} className="opacity-50" />
                                    <span className="text-[10px] font-bold uppercase tracking-tight">
                                        {format(new Date(t.date), 'dd MMM, hh:mm a', { locale: es })}
                                    </span>
                                </div>
                                <div className="text-[10px] font-black text-foreground uppercase tracking-widest opacity-60">
                                    {t.documentNumber || '-'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                <div className="px-6 py-5 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-6 bg-muted/10">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="flex flex-col order-2 sm:order-1">
                            <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest leading-none mb-1">Resultados</span>
                            <span className="text-[11px] font-bold text-foreground whitespace-nowrap">
                                <span className="text-primary">{transactions.length > 0 ? ((currentPage - 1) * pageSize) + 1 : 0}-{Math.min(currentPage * pageSize, totalRecords)}</span> de <span className="font-bold">{totalRecords}</span> registros
                            </span>
                        </div>
                        <div className="relative order-1 sm:order-2">
                            <select
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="pl-3 pr-8 py-2 bg-card border border-border/50 text-foreground text-[10px] rounded-xl focus:ring-4 focus:ring-primary/10 block font-black outline-none tracking-wider appearance-none shadow-sm cursor-pointer"
                            >
                                <option value="20">20 / PÁG</option>
                                <option value="40">40 / PÁG</option>
                                <option value="60">60 / PÁG</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none" size={10} />
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 w-full md:w-auto">
                        <Button
                            variant="outline"
                            size="icon"
                            disabled={!hasPrevPage || isLoading}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            className="w-10 h-10 rounded-xl border-border/50 bg-card hover:bg-muted disabled:opacity-20 active:scale-90 transition-all"
                        >
                            <ChevronLeft size={16} />
                        </Button>
                        <div className="px-5 py-2 bg-card border border-border/50 rounded-xl min-w-[100px] text-center shadow-sm">
                            <p className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest leading-none mb-0.5">Página</p>
                            <p className="text-[11px] font-black text-foreground leading-tight">{currentPage} / {totalPages}</p>
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            disabled={!hasNextPage || isLoading}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="w-10 h-10 rounded-xl border-border/50 bg-card hover:bg-muted disabled:opacity-20 active:scale-90 transition-all"
                        >
                            <ChevronRight size={16} />
                        </Button>
                    </div>
                </div>
            </div>

            <KardexFilterPanel
                open={isFilterOpen}
                onOpenChange={setIsFilterOpen}
                onApplyFilters={(v) => {
                    setFilters(v);
                    setCurrentPage(1);
                }}
                currentFilters={filters}
            />

            <ManualAdjustmentModal
                open={isAdjustmentModalOpen}
                onOpenChange={setIsAdjustmentModalOpen}
                onSuccess={() => {
                    fetchHistory();
                }}
            />
        </div>
    );
}
