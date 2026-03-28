import { Banknote, CreditCard, QrCode, ArrowRightLeft, HelpCircle } from 'lucide-react';
import { OrderStatus } from '@/services/order.service';
import type { OrderPayment } from '@/services/order-payment.service';

const CURRENCY_FORMATTER = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

export const formatCurrency = (value: string | number, symbol: string = 'S/') => {
    const formatted = CURRENCY_FORMATTER.format(Number(value)).replace(/[^0-9.,]/g, '');
    return `${symbol} ${formatted}`;
};

export const getStatusBadge = (status: string) => {
    const styles = {
        [OrderStatus.COMPLETED]: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', dot: 'bg-emerald-500', label: 'Completado' },
        [OrderStatus.CANCELLED]: { bg: 'bg-red-500/10', text: 'text-red-500', dot: 'bg-red-500', label: 'Anulado' },
        [OrderStatus.PENDING]: { bg: 'bg-amber-500/10', text: 'text-amber-500', dot: 'bg-amber-500', label: 'Pendiente' },
        [OrderStatus.PENDING_PAYMENT]: { bg: 'bg-orange-500/10', text: 'text-orange-500', dot: 'bg-orange-500', label: 'Pedido Pendiente' },
    };
    const config = styles[status as keyof typeof styles] || { bg: 'bg-muted', text: 'text-muted-foreground', dot: 'bg-muted-foreground', label: status };

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${config.bg} ${config.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
            {config.label}
        </span>
    );
};

export const getPaymentBadge = (payment?: OrderPayment) => {
    if (!payment) return <span className="text-muted-foreground/50 text-xs italic">-</span>;

    const styles = {
        'CASH': { bg: 'bg-emerald-500/10', text: 'text-emerald-500', icon: Banknote, label: 'Efectivo' },
        'CARD': { bg: 'bg-blue-500/10', text: 'text-blue-500', icon: CreditCard, label: 'Tarjeta' },
        'YAPE': { bg: 'bg-purple-500/10', text: 'text-purple-500', icon: QrCode, label: 'Yape' },
        'PLIN': { bg: 'bg-cyan-500/10', text: 'text-cyan-500', icon: QrCode, label: 'Plin' },
        'TRANSFER': { bg: 'bg-orange-500/10', text: 'text-orange-500', icon: ArrowRightLeft, label: 'Transferencia' },
        'OTHER': { bg: 'bg-muted', text: 'text-muted-foreground', icon: HelpCircle, label: 'Otro' },
    };

    const config = styles[payment.paymentMethod as keyof typeof styles] || styles['OTHER'];
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${config.bg} ${config.text}`}>
            <Icon size={14} />
            {config.label}
        </span>
    );
};
