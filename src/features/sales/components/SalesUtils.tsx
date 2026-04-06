import { format, isValid, parse } from 'date-fns';
import { es } from 'date-fns/locale';

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Rule js-cache-function-results (Priority 2)
const CURRENCY_FORMATTER = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

export const formatCurrency = (amount: number | string | null | undefined, symbol: string = 'S/') => {
    const val = Number(amount ?? 0);
    const formatted = CURRENCY_FORMATTER.format(val).replace(/[^0-9.,]/g, '');
    return `${symbol} ${formatted}`;
};

export function parseDate(raw: string | null | undefined): Date | null {
    if (!raw) return null;
    const iso = new Date(raw);
    if (isValid(iso) && raw.includes('-')) return iso;
    try {
        const d = parse(raw, 'dd/MM/yyyy HH:mm:ss', new Date());
        return isValid(d) ? d : null;
    } catch {
        return null;
    }
}

export function fmtDate(raw: string | null | undefined, pattern = "dd/MM/yyyy, hh:mm a"): string {
    const d = parseDate(raw);
    return d ? format(d, pattern, { locale: es }) : '—';
}

export function ShiftStatusBadge({ status }: { status: string }) {
    if (status === 'OPEN') {
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
