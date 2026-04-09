import {
    ShoppingCart,
    Truck,
    PlusCircle,
    MinusCircle,
    ArrowUpCircle,
    ArrowDownCircle,
    FileText,
    type LucideIcon
} from 'lucide-react';
import type { KardexMovementType } from '@/services/kardex.service';

interface KardexMovementBadgeProps {
    type: KardexMovementType;
}

export function KardexMovementBadge({ type }: KardexMovementBadgeProps) {
    const configs: Record<KardexMovementType, { label: string; bg: string; text: string; icon: LucideIcon }> = {
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
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.08em] ${config.bg} ${config.text}`}>
            <Icon size={12} className="shrink-0" />
            {config.label}
        </span>
    );
}
