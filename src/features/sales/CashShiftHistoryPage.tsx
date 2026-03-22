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
import { cn } from '@/lib/utils';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (n: number) => `S/ ${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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
            <div className="space-y-6 max-w-[1400px] mx-auto min-h-screen bg-background">

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

                {/* ── Table / Mobile Cards ────────────────────────────────────── */}
                <div className="space-y-4">
                    {/* Desktop View */}
                    <div className="hidden md:block bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
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
                                            Egresos
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
                                            const s = shift as any;
                                            const isOpen = shift.status === ShiftStatus.OPEN;
                                            const openedAt = parseDate(shift.openedAt);
                                            const closedAt = parseDate(shift.closedAt);
                                            const shortId = shift.id.slice(0, 8).toUpperCase();
                                            const branchName = s.branch?.name
                                                ?? branches.find(b => b.id === shift.branchId)?.name
                                                ?? shift.branchId.slice(0, 8);
                                            const totalIncome = [s.incomeCash, s.incomeCard, s.incomeYape, s.incomePlin, s.incomeTransfer]
                                                .reduce((acc: number, v: any) => acc + (Number(v) || 0), 0);

                                            const totalExpense = Number(s.expenseCash || 0);
                                            const initialAmt = Number(s.initialAmount ?? shift.openingBalance ?? 0);
                                            const finalExpected = initialAmt + totalIncome - totalExpense;

                                            return (
                                                <tr key={shift.id} className="hover:bg-muted/10 transition-colors group">
                                                    <td className="px-5 py-4 whitespace-nowrap">
                                                        <span className="text-xs font-bold text-primary tabular-nums">
                                                            #{shortId}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4 whitespace-nowrap">
                                                        <span className="text-xs font-semibold text-foreground">
                                                            {branchName}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4 whitespace-nowrap">
                                                        <ShiftStatusBadge status={shift.status} />
                                                    </td>
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
                                                    <td className="px-5 py-4 whitespace-nowrap text-right">
                                                        <span className="text-xs font-bold text-foreground tabular-nums">
                                                            {formatCurrency(initialAmt)}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4 whitespace-nowrap text-right">
                                                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                                                            {formatCurrency(totalIncome)}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4 whitespace-nowrap text-right">
                                                        <span className="text-xs font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                                                            {totalExpense > 0 ? `-${formatCurrency(totalExpense)}` : formatCurrency(0)}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4 whitespace-nowrap text-right">
                                                        <span className={`text-xs font-black tabular-nums ${isOpen ? 'text-primary' : 'text-foreground'}`}>
                                                            {formatCurrency(isOpen ? finalExpected : Number(s.finalReportedAmount ?? s.finalSystemAmount ?? finalExpected))}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4 whitespace-nowrap text-center">
                                                        <div className="flex justify-center items-center gap-1.5">
                                                            {isOpen && (
                                                                <button
                                                                    onClick={() => navigate(`/pos/cash-closing/${shift.id}`)}
                                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-500/5 hover:bg-rose-500/15 border border-rose-500/20 rounded-lg transition-all active:scale-95"
                                                                >
                                                                    Cerrar Caja
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => navigate(`/sales/shifts/${shift.id}`)}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-primary bg-primary/5 hover:bg-primary/15 border border-primary/20 rounded-lg transition-all active:scale-95"
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

                        {/* Pagination Desktop */}
                        <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-muted/20">
                            <div className="flex items-center gap-4">
                                <span className="text-[11px] text-muted-foreground font-medium">
                                    Mostrando <span className="font-bold text-foreground">{(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalShifts)}</span> de <span className="font-bold text-foreground">{totalShifts}</span> turnos
                                </span>
                                <select
                                    value={pageSize}
                                    onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                                    className="bg-card border border-border text-foreground text-xs rounded-xl p-1.5 font-bold outline-none"
                                >
                                    {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n} por página</option>)}
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <button disabled={!hasPrevPage} onClick={() => setCurrentPage(p => p - 1)} className="p-1.5 border border-border bg-card rounded-lg hover:bg-muted disabled:opacity-30"><ChevronLeft size={16} /></button>
                                <span className="text-xs font-bold px-3">Página {currentPage} de {totalPages}</span>
                                <button disabled={!hasNextPage} onClick={() => setCurrentPage(p => p + 1)} className="p-1.5 border border-border bg-card rounded-lg hover:bg-muted disabled:opacity-30"><ChevronRight size={16} /></button>
                            </div>
                        </div>
                    </div>

                    {/* Mobile View - Cards */}
                    <div className="md:hidden space-y-4">
                        {isLoading ? (
                            <div className="py-12 text-center text-muted-foreground">
                                <RefreshCw size={24} className="animate-spin mx-auto mb-2 opacity-20" />
                                <span className="text-xs uppercase font-black tracking-widest">Cargando datos...</span>
                            </div>
                        ) : shifts.length === 0 ? (
                            <div className="py-12 text-center border-2 border-dashed border-border rounded-2xl bg-card/50">
                                <Banknote size={32} className="text-muted-foreground/10 mx-auto mb-2" />
                                <p className="text-xs font-bold text-muted-foreground/40 uppercase tracking-widest">No hay turnos disponibles</p>
                            </div>
                        ) : (
                            shifts.map((shift) => {
                                const s = shift as any;
                                const isOpen = shift.status === ShiftStatus.OPEN;
                                const openedAt = parseDate(shift.openedAt);
                                const shortId = shift.id.slice(0, 8).toUpperCase();
                                const branchName = s.branch?.name ?? branches.find(b => b.id === shift.branchId)?.name ?? 'S/N';
                                
                                const totalIncome = [s.incomeCash, s.incomeCard, s.incomeYape, s.incomePlin, s.incomeTransfer]
                                    .reduce((acc: number, v: any) => acc + (Number(v) || 0), 0);
                                const totalExpense = Number(s.expenseCash || 0);
                                const initialAmt = Number(s.initialAmount ?? shift.openingBalance ?? 0);
                                const finalExpected = initialAmt + totalIncome - totalExpense;
                                const balanceVal = isOpen ? finalExpected : Number(s.finalReportedAmount ?? s.finalSystemAmount ?? finalExpected);

                                return (
                                    <div key={shift.id} className="bg-card rounded-2xl border border-border/80 shadow-none overflow-hidden relative flex flex-col active:scale-[0.99] transition-all">
                                        {/* 1. Header: ID & Branch */}
                                        <div className="p-4 border-b border-border/30 flex items-start justify-between bg-muted/5">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[11px] font-black text-primary uppercase tracking-widest">Turno #{shortId}</span>
                                                    <ShiftStatusBadge status={shift.status} />
                                                </div>
                                                <h3 className="text-[13px] font-black text-foreground tracking-tight uppercase">
                                                    {branchName}
                                                </h3>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[8px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] mb-1">Apertura</p>
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-foreground/80 justify-end">
                                                    <Clock size={10} className="opacity-40" />
                                                    <span>{openedAt ? format(openedAt, "dd MMM, hh:mm a", { locale: es }) : '-'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 2. Financial Highlights Grid */}
                                        <div className="p-4 bg-muted/5 grid grid-cols-2 gap-4 border-b border-border/10">
                                            <div>
                                                <p className="text-[8px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] mb-1.5">Initial</p>
                                                <p className="text-[11px] font-black text-foreground/80 tabular-nums">
                                                    {formatCurrency(initialAmt)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[8px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] mb-1.5">Ingresos</p>
                                                <p className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                                                    {formatCurrency(totalIncome)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] mb-1.5">Egresos</p>
                                                <p className="text-[11px] font-black text-rose-600 dark:text-rose-400 tabular-nums">
                                                    {totalExpense > 0 ? `-${formatCurrency(totalExpense)}` : formatCurrency(0)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[8px] font-black text-primary/50 uppercase tracking-[0.2em] mb-1.5">Balance Final</p>
                                                <p className={cn(
                                                    "text-[13px] font-black tabular-nums",
                                                    isOpen ? "text-primary" : "text-foreground"
                                                )}>
                                                    {formatCurrency(balanceVal)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* 3. Actions */}
                                        <div className="p-3 flex items-center gap-2 bg-muted/20">
                                            <button
                                                onClick={() => navigate(`/sales/shifts/${shift.id}`)}
                                                className="flex-1 flex items-center justify-center gap-2 h-10 bg-card border border-border/80 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 active:scale-[0.97] transition-all"
                                            >
                                                <Eye size={14} />
                                                Detalle
                                            </button>
                                            {isOpen && (
                                                <button
                                                    onClick={() => navigate(`/pos/cash-closing/${shift.id}`)}
                                                    className="flex-1 flex items-center justify-center gap-2 h-10 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-[0.97] transition-all"
                                                >
                                                    Cerrar Caja
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}

                        {/* Pagination Mobile */}
                        <div className="flex items-center justify-between p-2 pt-4">
                            <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">{totalShifts} turnos total</span>
                            <div className="flex gap-2">
                                <button disabled={!hasPrevPage} onClick={() => setCurrentPage(p => p - 1)} className="w-10 h-10 rounded-xl border border-border bg-card flex items-center justify-center disabled:opacity-30"><ChevronLeft size={16} /></button>
                                <button disabled={!hasNextPage} onClick={() => setCurrentPage(p => p + 1)} className="w-10 h-10 rounded-xl border border-border bg-card flex items-center justify-center disabled:opacity-30"><ChevronRight size={16} /></button>
                            </div>
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
