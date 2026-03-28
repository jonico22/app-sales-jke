import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { orderService, type Order, OrderStatus } from '@/services/order.service';
import { useCartStore } from '@/store/cart.store';
import { useNavigate } from 'react-router-dom';
import { POSPaymentModal } from '../pos/components/POSPaymentModal';
import { POSSuccessModal } from '../pos/components/POSSuccessModal';
import { POSCancelModal } from '../pos/components/POSCancelModal';
import { POSResumeModal } from '../pos/components/POSResumeModal';
import { SalesHistoryResultModal } from './components/SalesHistoryResultModal';
import { PendingOrdersHeader } from './components/PendingOrdersHeader';
import { PendingOrdersFilterBar } from './components/PendingOrdersFilterBar';
import { PendingOrdersTable } from './components/PendingOrdersTable';
import { PendingOrdersMobileList } from './components/PendingOrdersMobileList';



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
            // Error fetching orders
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
            // Error resuming order
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
            // Error cancelling order
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
            <PendingOrdersHeader
                ordersCount={filteredOrders.length}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />

            <PendingOrdersFilterBar
                sortBy={sortBy}
                onSortChange={(val) => {
                    setSortBy(val);
                    setSortOrder('desc');
                }}
            />

            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <PendingOrdersTable
                    orders={filteredOrders}
                    isLoading={isLoading}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                    onResume={handleResume}
                    onViewDetail={handleViewDetail}
                    onPay={handlePay}
                    onCancel={handleCancel}
                />
                
                <PendingOrdersMobileList
                    orders={filteredOrders}
                    isLoading={isLoading}
                    onResume={handleResume}
                    onViewDetail={handleViewDetail}
                    onPay={handlePay}
                    onCancel={handleCancel}
                />

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
                onPrintTicket={() => { /* TODO: Implement print */ }}
                onShareWhatsApp={() => { /* TODO: Implement share */ }}
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
