import { cn } from '@/lib/utils';

export function getTimeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Hace menos de un minuto';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours} horas`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `Hace ${diffInDays} días`;
}

export function StatusBadge({ date }: { date: string }) {
    const timeAgo = getTimeAgo(date);

    const dateObj = new Date(date);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - dateObj.getTime()) / 60000);

    let colorClass = "text-emerald-600 bg-emerald-500/10";
    let dotClass = "bg-emerald-500";

    if (diffInMinutes > 30) {
        colorClass = "text-destructive bg-destructive/10";
        dotClass = "bg-destructive";
    } else if (diffInMinutes > 15) {
        colorClass = "text-amber-600 bg-amber-500/10";
        dotClass = "bg-amber-500";
    }

    return (
        <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.08em] w-fit", colorClass)}>
            <span className={cn("w-1.5 h-1.5 rounded-full", dotClass)}></span>
            {timeAgo}
        </div>
    );
}

const CURRENCY_FORMATTER = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

export const formatCurrency = (value: string | number, symbol: string = 'S/.') => {
    return `${symbol} ${CURRENCY_FORMATTER.format(Number(value)).replace(/[^0-9.,]/g, '')}`;
};
