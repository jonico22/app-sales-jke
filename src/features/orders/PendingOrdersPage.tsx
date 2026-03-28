import { useState, useEffect } from 'react';
import { Search, Clock, Play, CreditCard, XCircle, ChevronLeft, ChevronRight, SlidersHorizontal, RefreshCw, FileText } from 'lucide-react';
import { SortableTableHead } from '@/components/shared/SortableTableHead';
import { orderService, type Order, OrderStatus } from '@/services/order.service';
import { useCartStore } from '@/store/cart.store';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { POSPaymentModal } from '../pos/components/POSPaymentModal';
import { POSSuccessModal } from '../pos/components/POSSuccessModal';
import { POSCancelModal } from '../pos/components/POSCancelModal';
import { POSResumeModal } from '../pos/components/POSResumeModal';
import { SalesHistoryResultModal } from './components/SalesHistoryResultModal';

// Helper for relative time (e.g. "Hace 15 min")
function getTimeAgo(dateString: string) {
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

const CURRENCY_FORMATTER = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

const formatCurrency = (value: string | number, symbol: string = 'S/.') => {
    // We can swap currency symbol if needed, but Intl.NumberFormat is primarily for the formatting rules.
    return `${symbol} ${CURRENCY_FORMATTER.format(Number(value)).replace(/[^0-9.,]/g, '')}`;
};

// Status Badge Component
function StatusBadge({ date }: { date: string }) {
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
        <div className={cn("flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium w-fit", colorClass)}>
            <span className={cn("w-1.5 h-1.5 rounded-full", dotClass)}></span>
            {timeAgo}
        </div>
    );
}

export default function PendingOrdersPage() {
    const navigate = useNavigate();
    const { setCurrentOrder, clearCurrentOrder } = useCartStore();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Sorting state
    const [sortBy, setSortBy] = useState<string>('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // Modal State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
    const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<Order | null>(null);
    const [selectedOrderForCancellation, setSelectedOrderForCancellation] = useState<Order | null>(null);
    const [selectedOrderForResume, setSelectedOrderForResume] = useState<Order | null>(null);
    const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [lastPaymentMethod, setLastPaymentMethod] = useState<string>('CASH');
    const [isProcessingCancel, setIsProcessingCancel] = useState(false);
    const [isProcessingResume, setIsProcessingResume] = useState(false);

    // Fetch orders
    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const pendingPaymentResponse = await orderService.getAll({
                status: OrderStatus.PENDING_PAYMENT,
                limit: 50,
                include: 'allItems',
                sortBy,
                sortOrder,
            });

            let allOrders: Order[] = [];

            if (pendingPaymentResponse.success && pendingPaymentResponse.data) {
                const pendingPaymentOrders = (pendingPaymentResponse.data as any).data || pendingPaymentResponse.data;
                if (Array.isArray(pendingPaymentOrders)) {
                    allOrders = [...pendingPaymentOrders];
                }
            }

            const uniqueOrders = Array.from(new Map(allOrders.map(item => [item.id, item])).values());
            setOrders(uniqueOrders);

        } catch (error) {
            console.error('Error fetching pending orders:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [sortBy, sortOrder]);

    // Handlers
    const handleResume = (order: Order) => {
        setSelectedOrderForResume(order);
        setIsResumeModalOpen(true);
    };

    const handleViewDetail = (order: Order) => {
        setSelectedOrderForDetail(order);
        setIsDetailModalOpen(true);
    };

    const handleConfirmResume = async () => {
        if (!selectedOrderForResume) return;

        setIsProcessingResume(true);
        try {
            const fullOrderResponse = await orderService.getById(selectedOrderForResume.id);
            if (!fullOrderResponse.success || !fullOrderResponse.data) {
                console.error('Failed to fetch order details');
                return;
            }

            clearCurrentOrder();

            await orderService.update(selectedOrderForResume.id, {
                status: OrderStatus.CANCELLED,
                cancellationReason: 'Clonado/Retomado',
                comment: `Pedido original #${selectedOrderForResume.orderCode} retomado.`
            });

            navigate('/pos', {
                state: {
                    cloneFromOrderId: selectedOrderForResume.id
                }
            });

        } catch (error) {
            console.error('Error resuming order:', error);
        } finally {
            setIsProcessingResume(false);
            setIsResumeModalOpen(false);
        }
    };

    const handlePay = (order: Order) => {
        setSelectedOrderForPayment(order);
        setCurrentOrder(order.id, order.orderCode, Number(order.totalAmount));
        setIsPaymentModalOpen(true);
    };

    const handleCancel = (order: Order) => {
        setSelectedOrderForCancellation(order);
        setIsCancelModalOpen(true);
    };

    const handleConfirmCancel = async (reason: string, notes: string) => {
        if (!selectedOrderForCancellation) return;

        setIsProcessingCancel(true);
        try {
            await orderService.update(selectedOrderForCancellation.id, {
                status: OrderStatus.CANCELLED,
                cancellationReason: reason,
                comment: notes
            });
            fetchOrders();
            setIsCancelModalOpen(false);
            setSelectedOrderForCancellation(null);
        } catch (error) {
            console.error('Error cancelling order:', error);
        } finally {
            setIsProcessingCancel(false);
        }
    };

    const handlePaymentSuccess = (paymentMethod: string) => {
        setLastPaymentMethod(paymentMethod);
        setIsPaymentModalOpen(false);
        setIsSuccessModalOpen(true);
        fetchOrders();
    };

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const closeSuccessModal = () => {
        setIsSuccessModalOpen(false);
        setSelectedOrderForPayment(null);
        clearCurrentOrder();
    };

    // Filter (Sort is now server-side)
    const filteredOrders = orders
        .filter(order => {
            const query = searchQuery.toLowerCase();
            const clientName = (order.partner?.companyName || `${order.partner?.firstName || ''} ${order.partner?.lastName || ''}`).toLowerCase();
            return (
                order.orderCode.toLowerCase().includes(query) ||
                clientName.includes(query) ||
                order.totalAmount.toString().includes(query)
            );
        });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
                <div className="flex items-center gap-4">
                    <h1 className="text-lg font-bold text-foreground tracking-tight uppercase">
                        Pedidos Pendientes
                    </h1>
                    <div className="h-5 w-px bg-border hidden md:block"></div>
                    <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
                        <Clock className="w-4 h-4" />
                        <span>{filteredOrders.length} órdenes en espera</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative w-full md:w-64">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50">
                            <Search className="h-4 w-4" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar orden..."
                            className="w-full pl-9 pr-4 py-2 bg-muted/30 border border-border rounded-xl text-xs font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-muted/20 p-2 rounded-xl border border-border">
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-xs font-bold uppercase tracking-wider text-muted-foreground hover:bg-muted/50 transition-colors shadow-sm">
                        <SlidersHorizontal className="w-4 h-4" />
                        Filtrar
                    </button>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                    <span>Ordenar por:</span>
                    <select
                        className="bg-transparent font-bold text-foreground focus:outline-none cursor-pointer text-xs"
                        value={sortBy}
                        onChange={(e) => {
                            setSortBy(e.target.value);
                            setSortOrder('desc'); // Default to desc when changing via dropdown
                        }}
                    >
                        <option value="createdAt">Tiempo de espera</option>
                        <option value="totalAmount">Monto total</option>
                    </select>
                </div>
            </div>

            {/* Orders List / Table */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                {/* Desktop view */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <SortableTableHead
                                    field="orderCode"
                                    currentSortBy={sortBy}
                                    currentSortOrder={sortOrder}
                                    onSort={handleSort}
                                    className="px-6 py-3 text-left text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider"
                                >
                                    Ticket ID
                                </SortableTableHead>
                                <SortableTableHead
                                    field="partnerName"
                                    currentSortBy={sortBy}
                                    currentSortOrder={sortOrder}
                                    onSort={handleSort}
                                    className="px-6 py-3 text-left text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider"
                                >
                                    Cliente
                                </SortableTableHead>
                                <th className="px-6 py-3 text-left text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">Ítems</th>
                                <SortableTableHead
                                    field="createdAt"
                                    currentSortBy={sortBy}
                                    currentSortOrder={sortOrder}
                                    onSort={handleSort}
                                    className="px-6 py-3 text-left text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider"
                                >
                                    Espera
                                </SortableTableHead>
                                <SortableTableHead
                                    field="totalAmount"
                                    currentSortBy={sortBy}
                                    currentSortOrder={sortOrder}
                                    onSort={handleSort}
                                    className="px-6 py-3 text-left text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider"
                                >
                                    Total
                                </SortableTableHead>
                                <th className="px-6 py-3 text-right text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground text-sm font-medium">
                                        Cargando pedidos...
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground text-sm font-medium">
                                        No hay pedidos pendientes
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-muted/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-[11px] font-bold text-primary">#{order.orderCode}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20 shrink-0">
                                                    {order.partner?.firstName?.charAt(0) || order.partner?.companyName?.charAt(0) || 'C'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-bold text-foreground">
                                                        {order.partner?.companyName || `${order.partner?.firstName || ''} ${order.partner?.lastName || ''}`.trim() || 'Cliente General'}
                                                    </span>
                                                    {order.notes && (
                                                        <span className="text-[10px] text-muted-foreground max-w-[150px] truncate" title={order.notes}>
                                                            {order.notes}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 rounded-lg bg-muted/50 text-muted-foreground text-[10px] font-bold border border-border">
                                                {order.totalProducts || 0} productos
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge date={order.createdAt} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-black text-[12px] text-foreground">
                                                {formatCurrency(order.totalAmount, order.currency?.symbol || 'S/.')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleResume(order)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 rounded-lg text-[10px] font-bold transition-colors uppercase tracking-wider"
                                                >
                                                    <Play className="w-3 h-3 fill-current" />
                                                    Reemplazar
                                                </button>
                                                <button
                                                    onClick={() => handleViewDetail(order)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 border border-border text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg text-[10px] font-bold transition-colors uppercase tracking-wider"
                                                >
                                                    <FileText className="w-3 h-3" />
                                                    Detalle
                                                </button>
                                                <button
                                                    onClick={() => handlePay(order)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-[10px] font-bold transition-colors shadow-sm shadow-primary/20 uppercase tracking-wider"
                                                >
                                                    <CreditCard className="w-3 h-3" />
                                                    Pagar
                                                </button>
                                                <button
                                                    onClick={() => handleCancel(order)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive/20 rounded-lg text-[10px] font-bold transition-colors uppercase tracking-wider"
                                                >
                                                    <XCircle className="w-3 h-3" />
                                                    Anular
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden p-4 space-y-4 bg-muted/5 min-h-screen">
                    {isLoading ? (
                        <div className="p-8 text-center bg-card rounded-2xl border border-border/40">
                            <RefreshCw className="w-8 h-8 animate-spin text-primary/20 mx-auto mb-3" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Consultando órdenes...</p>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="p-16 text-center bg-card rounded-2xl border border-border/40">
                            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-border/50">
                                <Clock className="w-8 h-8 text-muted-foreground/20" />
                            </div>
                            <p className="text-sm font-black text-foreground uppercase tracking-widest">Sin Pendientes</p>
                            <p className="text-[10px] text-muted-foreground mt-1 font-medium tracking-wide">Todas las órdenes han sido procesadas o anuladas.</p>
                        </div>
                    ) : (
                        filteredOrders.map((order) => (
                            <div
                                key={order.id}
                                className="bg-card rounded-2xl border border-border/80 shadow-none active:bg-muted/30 transition-all relative overflow-hidden flex flex-col"
                            >
                                {/* 1. Header: Ticket ID + Wait Time Status */}
                                <div className="p-4 border-b border-border/30 flex items-center justify-between bg-muted/5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-black text-primary/60 uppercase tracking-widest">Ticket</span>
                                        <div className="px-2 py-0.5 bg-primary/5 border border-primary/20 rounded-md">
                                            <span className="font-mono text-[10px] font-black text-foreground">
                                                #{order.orderCode.includes('-') ? order.orderCode.split('-').pop() : order.orderCode}
                                            </span>
                                        </div>
                                    </div>
                                    <StatusBadge date={order.createdAt} />
                                </div>

                                {/* 2. Client Info */}
                                <div className="p-4 flex items-center gap-3.5">
                                    <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center font-black text-sm text-primary-foreground shrink-0 capitalize">
                                        {(order.partner?.firstName?.charAt(0) || order.partner?.companyName?.charAt(0) || 'C').toLowerCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest mb-0.5 leading-none">Cliente</p>
                                        <h3 className="text-[13px] font-black text-foreground uppercase tracking-tight truncate leading-tight">
                                            {order.partner?.companyName || `${order.partner?.firstName || ''} ${order.partner?.lastName || ''}`.trim() || 'Cliente General'}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-muted/30 border border-border/50">
                                                <span className="text-[9px] font-black text-foreground/70 uppercase">
                                                    {order.totalProducts || 0} ítems
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Amount Highlight Section */}
                                <div className="mx-4 mb-3 p-3 bg-primary/5 rounded-xl border border-primary/10 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest leading-none mb-1">Monto Pendiente</p>
                                        <span className="text-[10px] font-bold text-primary/60 leading-none">Total Pedido</span>
                                    </div>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-2xl font-black text-foreground tracking-tighter leading-none">
                                            {formatCurrency(order.totalAmount, order.currency?.symbol || 'S/.')}
                                        </span>
                                    </div>
                                </div>

                                {/* Primary Action Button (Full Width for better accessibility) */}
                                <div className="px-4 pb-4">
                                    <button
                                        onClick={() => handlePay(order)}
                                        className="w-full flex items-center justify-center gap-2.5 h-12 bg-primary text-primary-foreground rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] active:scale-[0.98] transition-all ring-offset-2 hover:ring-2 hover:ring-primary/20 shadow-lg shadow-primary/20"
                                    >
                                        <CreditCard className="w-4 h-4" /> Pagar Ticket
                                    </button>
                                </div>

                                {/* 4. Secondary Actions Footer */}
                                <div className="p-2 bg-muted/20 border-t border-border/30 flex items-center justify-between gap-1">
                                    <div className="flex gap-1 flex-1">
                                        <button
                                            onClick={() => handleResume(order)}
                                            className="flex-1 flex items-center justify-center gap-2 h-10 bg-card hover:bg-muted text-foreground border border-border/40 rounded-xl text-[9px] font-black uppercase tracking-wider active:scale-[0.97] transition-all"
                                        >
                                            <Play className="w-3.5 h-3.5 fill-current opacity-70" /> Continuar
                                        </button>
                                        <button
                                            onClick={() => handleViewDetail(order)}
                                            className="flex-1 flex items-center justify-center gap-2 h-10 bg-card hover:bg-muted text-foreground border border-border/40 rounded-xl text-[9px] font-black uppercase tracking-wider active:scale-[0.97] transition-all"
                                        >
                                            <FileText className="w-3.5 h-3.5 opacity-70" /> Detalle
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => handleCancel(order)}
                                        className="w-10 h-10 flex items-center justify-center text-destructive/40 hover:text-destructive hover:bg-destructive/5 rounded-xl transition-all"
                                        title="Anular Pedido"
                                    >
                                        <XCircle className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination Footer */}
                <div className="px-6 py-5 border-t border-border/30 flex items-center justify-between bg-muted/5">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">Resumen</span>
                        <span className="text-[11px] font-bold text-foreground">
                            <span className="text-primary">{filteredOrders.length}</span> órdenes pendientes
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <button className="w-10 h-10 flex items-center justify-center bg-card hover:bg-muted rounded-xl transition-all disabled:opacity-20 border border-border/40 active:scale-90 shadow-none">
                            <ChevronLeft className="w-4 h-4 text-foreground" />
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center bg-card hover:bg-muted rounded-xl transition-all disabled:opacity-20 border border-border/40 active:scale-90 shadow-none">
                            <ChevronRight className="w-4 h-4 text-foreground" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            <POSPaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onPaymentSuccess={handlePaymentSuccess}
            />

            {/* Success Modal */}
            <POSSuccessModal
                isOpen={isSuccessModalOpen}
                orderCode={selectedOrderForPayment?.orderCode || ''}
                clientName={
                    selectedOrderForPayment?.partner?.companyName ||
                    `${selectedOrderForPayment?.partner?.firstName || ''} ${selectedOrderForPayment?.partner?.lastName || ''}`.trim() ||
                    'Cliente'
                }
                paymentMethod={lastPaymentMethod}
                total={selectedOrderForPayment ? Number(selectedOrderForPayment.totalAmount) : 0}
                onClose={closeSuccessModal}
                onPrintTicket={() => { console.log('Print ticket'); }}
                onShareWhatsApp={() => { console.log('Share WhatsApp'); }}
            />

            {/* Cancel Modal */}
            <POSCancelModal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                onConfirm={handleConfirmCancel}
                orderCode={selectedOrderForCancellation?.orderCode || ''}
                totalAmount={selectedOrderForCancellation ? Number(selectedOrderForCancellation.totalAmount) : 0}
                isProcessing={isProcessingCancel}
            />

            <POSResumeModal
                isOpen={isResumeModalOpen}
                onClose={() => setIsResumeModalOpen(false)}
                onConfirm={handleConfirmResume}
                isProcessing={isProcessingResume}
                orderCode={selectedOrderForResume?.orderCode}
            />

            {/* Detail Modal */}
            <SalesHistoryResultModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                order={selectedOrderForDetail}
            />
        </div>
    );
}
