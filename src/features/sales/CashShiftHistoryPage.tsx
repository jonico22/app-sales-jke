import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    RefreshCw,
    ChevronDown,
    Search,
    Eye,
    CalendarDays,
    Banknote,
    Clock,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { format, isValid, parse } from 'date-fns';
import { es } from 'date-fns/locale';
import { cashShiftService, ShiftStatus } from '@/services/cash-shift.service';
import type { CashShift, GetAllCashShiftsParams } from '@/services/cash-shift.service';
import { useBranchStore } from '@/store/branch.store';
import { DateRangePicker } from '@/components/shared/DateRangePicker';
import { AddMovementModal } from './components/AddMovementModal';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (n: number) => `S/ ${Number(n).toFixed(2)}`;

/** Safely parse an API date string — handles both ISO and dd/MM/yyyy HH:mm:ss formats */
function parseDate(raw: string | null | undefined): Date | null {
    if (!raw) return null;
    // Try ISO first
    const iso = new Date(raw);
    if (isValid(iso) && raw.includes('-')) return iso;
    // Try dd/MM/yyyy HH:mm:ss (API custom format)
    try {
        const d = parse(raw, 'dd/MM/yyyy HH:mm:ss', new Date());
        return isValid(d) ? d : null;
    } catch {
        return null;
    }
}

function ShiftStatusBadge({ status }: { status: string }) {
    if (status === ShiftStatus.OPEN) {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Abierto
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-muted text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
            Cerrado
        </span>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const PAGE_SIZE_OPTIONS = [10, 20, 40];

export default function CashShiftHistoryPage() {
    const navigate = useNavigate();
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
        <div className="p-6 space-y-6 max-w-[1400px] mx-auto min-h-screen bg-background">

            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-lg font-bold text-foreground tracking-tight uppercase">
                        Historial de Turnos de Caja
                    </h1>

                    <p className="text-muted-foreground text-[10px] mt-0.5 font-medium">
                        Consulte y gestione todos los turnos de apertura y cierre de caja.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => fetchShifts()}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-xl text-foreground hover:bg-muted shadow-sm transition-all text-[11px] font-bold uppercase tracking-wider active:scale-95 disabled:opacity-60"
                    >
                        <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                        Actualizar
                    </button>
                    <button
                        onClick={() => setIsMovementModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl shadow-sm shadow-primary/20 transition-all text-[11px] font-bold uppercase tracking-wider hover:bg-primary/90 active:scale-95"
                    >
                        <span className="text-base leading-none">+</span>
                        Registrar Movimiento
                    </button>
                </div>
            </div>

            {/* ── Filter Bar ──────────────────────────────────────────────── */}
            <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
                <div className="flex flex-wrap gap-3 items-end">

                    {/* Search */}
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                        <input
                            type="text"
                            placeholder="Buscar por ID de turno..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); resetPage(); }}
                            className="w-full pl-9 pr-4 py-2 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary text-xs outline-none transition-all placeholder:text-muted-foreground/60 font-medium text-foreground"
                        />
                    </div>

                    {/* Branch filter */}
                    <div className="relative min-w-[180px]">
                        <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1.5">
                            Sucursal
                        </label>
                        <div className="relative">
                            <select
                                value={branchFilter}
                                onChange={(e) => { setBranchFilter(e.target.value); resetPage(); }}
                                className="w-full appearance-none pl-3 pr-8 py-2 bg-muted/50 hover:bg-muted border border-border rounded-xl text-xs text-foreground focus:outline-none cursor-pointer font-medium transition-colors"
                            >
                                <option value="">Todas las sucursales</option>
                                {branches.map((b) => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none" size={12} />
                        </div>
                    </div>

                    {/* Status filter */}
                    <div className="relative min-w-[160px]">
                        <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1.5">
                            Estado
                        </label>
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value as any); resetPage(); }}
                                className="w-full appearance-none pl-3 pr-8 py-2 bg-muted/50 hover:bg-muted border border-border rounded-xl text-xs text-foreground focus:outline-none cursor-pointer font-medium transition-colors"
                            >
                                <option value="">Todos</option>
                                <option value="OPEN">Abierto</option>
                                <option value="CLOSED">Cerrado</option>
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none" size={12} />
                        </div>
                    </div>

                    {/* Date range */}
                    <div>
                        <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1.5">
                            Rango de Fechas
                        </label>
                        <DateRangePicker
                            startDate={startDate}
                            endDate={endDate}
                            onChange={(update) => { setDateRange(update); resetPage(); }}
                        />
                    </div>
                </div>
            </div>

            {/* ── Table ───────────────────────────────────────────────────── */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/30 border-b border-border">
                            <tr>
                                <th className="px-5 py-3 text-left text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
                                    ID Turno
                                </th>
                                <th className="px-5 py-3 text-left text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
                                    Sucursal
                                </th>
                                <th className="px-5 py-3 text-left text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-5 py-3 text-left text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
                                    Apertura / Cierre
                                </th>
                                <th className="px-5 py-3 text-right text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
                                    Monto Inicial
                                </th>
                                <th className="px-5 py-3 text-right text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
                                    Ingresos
                                </th>
                                <th className="px-5 py-3 text-right text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
                                    Balance Final
                                </th>
                                <th className="px-5 py-3 text-center text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-12 text-center text-muted-foreground">
                                        <RefreshCw size={24} className="animate-spin mx-auto mb-2 opacity-20" />
                                        <span className="text-sm">Cargando turnos...</span>
                                    </td>
                                </tr>
                            ) : shifts.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Banknote size={32} className="text-muted-foreground/20" />
                                            <p className="text-sm text-muted-foreground">No se encontraron turnos de caja.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                shifts.map((shift) => {
                                    const s = shift as any; // API includes extra fields not in the type
                                    const isOpen = shift.status === ShiftStatus.OPEN;
                                    const openedAt = parseDate(shift.openedAt);
                                    const closedAt = parseDate(shift.closedAt);
                                    const shortId = shift.id.slice(0, 8).toUpperCase();
                                    const branchName = s.branch?.name
                                        ?? branches.find(b => b.id === shift.branchId)?.name
                                        ?? shift.branchId.slice(0, 8);
                                    // Income totals from API fields
                                    const totalIncome = [s.incomeCash, s.incomeCard, s.incomeYape, s.incomePlin, s.incomeTransfer]
                                        .reduce((acc: number, v: any) => acc + (Number(v) || 0), 0);

                                    return (
                                        <tr
                                            key={shift.id}
                                            className="hover:bg-muted/10 transition-colors group"
                                        >
                                            {/* ID */}
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <span className="text-xs font-bold text-primary tabular-nums">
                                                    #{shortId}
                                                </span>
                                            </td>

                                            {/* Branch */}
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <span className="text-xs font-semibold text-foreground">
                                                    {branchName}
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <ShiftStatusBadge status={shift.status} />
                                            </td>

                                            {/* Dates */}
                                            <td className="px-5 py-4">
                                                <div className="space-y-0.5">
                                                    {openedAt && (
                                                        <div className="flex items-center gap-1.5 text-[11px] text-foreground font-medium">
                                                            <CalendarDays size={11} className="text-muted-foreground shrink-0" />
                                                            {format(openedAt, "dd MMM yyyy, HH:mm", { locale: es })}
                                                        </div>
                                                    )}
                                                    {closedAt && (
                                                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
                                                            <Clock size={11} className="shrink-0" />
                                                            {format(closedAt, "dd MMM yyyy, HH:mm", { locale: es })}
                                                        </div>
                                                    )}
                                                    {!closedAt && isOpen && (
                                                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                                                            En curso
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Opening balance */}
                                            <td className="px-5 py-4 whitespace-nowrap text-right">
                                                <span className="text-xs font-bold text-foreground tabular-nums">
                                                    {formatCurrency(Number(s.initialAmount ?? shift.openingBalance))}
                                                </span>
                                            </td>

                                            {/* Total income */}
                                            <td className="px-5 py-4 whitespace-nowrap text-right">
                                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                                                    {formatCurrency(totalIncome)}
                                                </span>
                                            </td>

                                            {/* Current / closing balance */}
                                            <td className="px-5 py-4 whitespace-nowrap text-right">
                                                <span className={`text-xs font-bold tabular-nums ${
                                                    isOpen
                                                        ? 'text-emerald-600 dark:text-emerald-400'
                                                        : 'text-foreground'
                                                }`}>
                                                    {formatCurrency(Number(s.finalReportedAmount ?? s.finalSystemAmount ?? shift.currentBalance ?? s.initialAmount ?? 0))}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-5 py-4 whitespace-nowrap text-center">
                                                <div className="flex justify-center items-center gap-1.5">
                                                    {isOpen && (
                                                        <button
                                                            onClick={() => navigate(`/pos/cash-closing/${shift.id}`)}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-500/5 hover:bg-rose-500/15 border border-rose-500/20 rounded-lg transition-all active:scale-95"
                                                            title="Cerrar turno"
                                                        >
                                                            Cerrar Caja
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => navigate(`/sales/shifts/${shift.id}`)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-primary bg-primary/5 hover:bg-primary/15 border border-primary/20 rounded-lg transition-all active:scale-95"
                                                        title="Ver detalle"
                                                    >
                                                        <Eye size={13} />
                                                        Ver Detalle
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ── Pagination ──────────────────────────────────────────── */}
                <div className="px-6 py-5 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/20">
                    <div className="flex items-center gap-4">
                        <span className="text-[11px] text-muted-foreground font-medium">
                            Mostrando{' '}
                            <span className="font-bold text-foreground">
                                {shifts.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}–
                                {Math.min(currentPage * pageSize, totalShifts)}
                            </span>{' '}
                            de{' '}
                            <span className="font-bold text-foreground">{totalShifts}</span>{' '}
                            turnos
                        </span>
                        <select
                            value={pageSize}
                            onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                            className="bg-card border border-border text-foreground text-sm rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary block p-2 font-bold outline-none transition-all"
                        >
                            {PAGE_SIZE_OPTIONS.map(n => (
                                <option key={n} value={n}>{n} por página</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={!hasPrevPage || isLoading}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="p-2 border border-border bg-card rounded-xl text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all active:scale-95"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-sm font-semibold text-foreground min-w-[130px] text-center bg-card border border-border py-2 rounded-xl px-4">
                            Página {currentPage} de {totalPages}
                        </span>
                        <button
                            disabled={!hasNextPage || isLoading}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="p-2 border border-border bg-card rounded-xl text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all active:scale-95"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
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
