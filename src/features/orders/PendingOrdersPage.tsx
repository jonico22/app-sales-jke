import { useState, useEffect } from 'react';
import { Search, Clock, Play, CreditCard, XCircle, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { orderService, type Order, OrderStatus } from '@/services/order.service';
import { useCartStore } from '@/store/cart.store';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { POSPaymentModal } from '../pos/components/POSPaymentModal';
import { POSSuccessModal } from '../pos/components/POSSuccessModal';
import { POSCancelModal } from '../pos/components/POSCancelModal';
import { POSResumeModal } from '../pos/components/POSResumeModal';

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

// Status Badge Component
function StatusBadge({ date }: { date: string }) {
    const timeAgo = getTimeAgo(date);

    // Determine color based on time elapsed (urgent if > 30 min)
    const dateObj = new Date(date);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - dateObj.getTime()) / 60000);

    let colorClass = "text-emerald-600 bg-emerald-50"; // Green (fresh)
    let dotClass = "bg-emerald-500";

    if (diffInMinutes > 30) {
        colorClass = "text-red-600 bg-red-50"; // Red (urgent)
        dotClass = "bg-red-500";
    } else if (diffInMinutes > 15) {
        colorClass = "text-amber-600 bg-amber-50"; // Orange (warning)
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
    const [sortBy, setSortBy] = useState<'time' | 'total'>('time');

    // Modal State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
    const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<Order | null>(null);
    const [selectedOrderForCancellation, setSelectedOrderForCancellation] = useState<Order | null>(null);
    const [selectedOrderForResume, setSelectedOrderForResume] = useState<Order | null>(null);
    const [lastPaymentMethod, setLastPaymentMethod] = useState<string>('CASH');
    const [isProcessingCancel, setIsProcessingCancel] = useState(false);
    const [isProcessingResume, setIsProcessingResume] = useState(false);

    // Fetch orders
    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            // Fetch only PENDING_PAYMENT
            const pendingPaymentResponse = await orderService.getAll({
                status: OrderStatus.PENDING_PAYMENT,
                limit: 50,
                include: 'allItems' // Request items
            });

            let allOrders: Order[] = [];

            if (pendingPaymentResponse.success && pendingPaymentResponse.data) {
                const pendingPaymentOrders = (pendingPaymentResponse.data as any).data || pendingPaymentResponse.data;
                if (Array.isArray(pendingPaymentOrders)) {
                    allOrders = [...pendingPaymentOrders];
                }
            }

            // Remove duplicates if any (just safe guard)
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
    }, []);

    // Handlers
    const handleResume = (order: Order) => {
        setSelectedOrderForResume(order);
        setIsResumeModalOpen(true);
    };


    const handleConfirmResume = async () => {
        if (!selectedOrderForResume) return;

        setIsProcessingResume(true);
        try {
            // 1. Get full order details to ensure we have items
            const fullOrderResponse = await orderService.getById(selectedOrderForResume.id);
            if (!fullOrderResponse.success || !fullOrderResponse.data) {
                console.error('Failed to fetch order details');
                return;
            }

            //const fullOrder = fullOrderResponse.data;
            //const orderItems = fullOrder.items || []; // Assuming API returns 'items'

            // 2. Load items into Cart Store
            // We need to clear current cart first? Maybe
            clearCurrentOrder(); // Clear any existing cart state to start fresh

            // We need to map OrderItems to the format expectations of CartStore if necessary
            // For now, assuming we just need to re-add them. 
            // BUT CartStore might not have a direct "setItems" for raw products. 
            // We usually add products. 

            // WORKAROUND: For now, we set the 'currentOrder' ID to null (new order) but we need to populate items.
            // Since we can't easily reconstruction "Product" objects without fetching them, 
            // we will set the cart state if possible or navigate.

            // ACTUALLY: The user requirement says "clonar los productos".
            // Since we can't easily inject into cart without Product details (image, stock, etc.), 
            // we might need to rely on the backend or just pass the order ID to POS and let POS fetch and populate as a "copy".
            // But the requirement says "pedido actual se cancelara".

            // PLAN:
            // 1. Cancel the current order first (or after).
            // 2. We will pass the 'orderId' to POS via state, but with a flag 'isClone: true'.
            // 3. POSPage will handle fetching the order items and populating the cart as NEW items.

            // Let's UPDATE the plan:
            // Cancel here.
            await orderService.update(selectedOrderForResume.id, {
                status: OrderStatus.CANCELLED,
                cancellationReason: 'Clonado/Retomado',
                comment: `Pedido original #${selectedOrderForResume.orderCode} retomado.`
            });

            // Navigate to POS with instruction to load items from this Old Order ID as NEW items
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
        // Open local modal instead of navigating
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
                comment: notes // Backend expects 'comment' for additional notes
            });
            fetchOrders(); // Refresh list
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
        fetchOrders(); // Refresh list to remove paid order
    };

    const closeSuccessModal = () => {
        setIsSuccessModalOpen(false);
        setSelectedOrderForPayment(null);
        clearCurrentOrder(); // Clear cart store state
    };

    // Filter and Sort
    const filteredOrders = orders
        .filter(order => {
            const query = searchQuery.toLowerCase();
            const clientName = (order.partner?.companyName || `${order.partner?.firstName || ''} ${order.partner?.lastName || ''}`).toLowerCase();
            return (
                order.orderCode.toLowerCase().includes(query) ||
                clientName.includes(query) ||
                order.totalAmount.toString().includes(query)
            );
        })
        .sort((a, b) => {
            if (sortBy === 'time') {
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            }
            // By total desc
            return Number(b.totalAmount) - Number(a.totalAmount);
        });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                        Pedidos Pendientes
                    </h1>
                    <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>{filteredOrders.length} órdenes en espera</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative w-full md:w-64">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                            <Search className="h-4 w-4" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar orden..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {/* Notifications and Profile are in TopBar usually, preserving local search here */}
                </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/50 p-2 rounded-xl">
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                        <SlidersHorizontal className="w-4 h-4" />
                        Filtrar
                    </button>
                    {/* Additional filters could go here */}
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span>Ordenar por:</span>
                    <select
                        className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'time' | 'total')}
                    >
                        <option value="time">Tiempo de espera</option>
                        <option value="total">Monto total</option>
                    </select>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Ticket ID</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Cliente</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Ítems</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Espera</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                        Cargando pedidos...
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                        No hay pedidos pendientes
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-slate-700">#{order.orderCode}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                                                    {order.partner?.firstName?.charAt(0) || order.partner?.companyName?.charAt(0) || 'C'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-slate-700">
                                                        {order.partner?.companyName || `${order.partner?.firstName || ''} ${order.partner?.lastName || ''}`.trim() || 'Cliente General'}
                                                    </span>
                                                    {order.notes && (
                                                        <span className="text-xs text-slate-400 max-w-[150px] truncate" title={order.notes}>
                                                            {order.notes}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
                                                {order.totalProducts || 0} productos
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge date={order.createdAt} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-black text-slate-700">
                                                {order.currency?.symbol || 'S/.'} {Number(order.totalAmount).toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleResume(order)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-sky-200 text-sky-600 hover:bg-sky-50 rounded-lg text-xs font-bold transition-colors"
                                                >
                                                    <Play className="w-3.5 h-3.5 fill-current" />
                                                    Remplazar
                                                </button>
                                                <button
                                                    onClick={() => handlePay(order)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 text-white hover:bg-sky-600 rounded-lg text-xs font-bold transition-colors shadow-sm shadow-sky-500/20"
                                                >
                                                    <CreditCard className="w-3.5 h-3.5" />
                                                    Pagar
                                                </button>
                                                <button
                                                    onClick={() => handleCancel(order)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold transition-colors"
                                                >
                                                    <XCircle className="w-3.5 h-3.5" />
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

                {/* Pagination Footer */}
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
                    <div>
                        Mostrando {filteredOrders.length} órdenes
                    </div>
                    <div className="flex gap-2">
                        <button className="p-1 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button className="p-1 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50">
                            <ChevronRight className="w-5 h-5" />
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

            {/* Resume Modal */}
            <POSResumeModal
                isOpen={isResumeModalOpen}
                onClose={() => setIsResumeModalOpen(false)}
                onConfirm={handleConfirmResume}
                isProcessing={isProcessingResume}
                orderCode={selectedOrderForResume?.orderCode}
            />
        </div>
    );
}
