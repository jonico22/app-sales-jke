import { Search, ChevronDown } from 'lucide-react';
import { DateRangePicker } from '@/components/shared/DateRangePicker';
import { compactNativeSelectClassName } from '@/components/shared/formFieldStyles';

interface CashShiftHistoryFilterBarProps {
    searchTerm: string;
    setSearchTerm: (v: string) => void;
    branchFilter: string;
    setBranchFilter: (v: string) => void;
    statusFilter: '' | 'OPEN' | 'CLOSED';
    setStatusFilter: (v: '' | 'OPEN' | 'CLOSED') => void;
    startDate: Date | null;
    endDate: Date | null;
    setDateRange: (r: [Date | null, Date | null]) => void;
    resetPage: () => void;
    branches: Array<{ id: string; name: string }>;
}

export function CashShiftHistoryFilterBar({
    searchTerm, setSearchTerm,
    branchFilter, setBranchFilter,
    statusFilter, setStatusFilter,
    startDate, endDate, setDateRange,
    resetPage, branches
}: CashShiftHistoryFilterBarProps) {
    return (
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
                    <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.08em] mb-1.5">
                        Sucursal
                    </label>
                    <div className="relative">
                        <select
                            value={branchFilter}
                            onChange={(e) => { setBranchFilter(e.target.value); resetPage(); }}
                            className={`${compactNativeSelectClassName} pr-11`}
                        >
                            <option value="">Todas las sucursales</option>
                            {branches.map((b) => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none" size={12} />
                    </div>
                </div>

                {/* Status filter */}
                <div className="relative min-w-[160px]">
                    <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.08em] mb-1.5">
                        Estado
                    </label>
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value as any); resetPage(); }}
                            className={`${compactNativeSelectClassName} pr-11`}
                        >
                            <option value="">Todos</option>
                            <option value="OPEN">Abierto</option>
                            <option value="CLOSED">Cerrado</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none" size={12} />
                    </div>
                </div>

                {/* Date range */}
                <div>
                    <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.08em] mb-1.5">
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
    );
}
