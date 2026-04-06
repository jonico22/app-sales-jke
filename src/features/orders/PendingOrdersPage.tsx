import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
import { useOrdersQuery, useUpdateOrderMutation } from './hooks/useOrderQueries';
import { usePendingOrdersFilters } from './hooks/useOrderFilters';
import { type Order, OrderStatus } from '@/services/order.service';

export default function PendingOrdersPage() {
    const navigate = useNavigate();
    const { setCurrentOrder, clearCurrentOrder } = useCartStore();
    
    // Filters and Query
    const { 
        searchQuery, 
        setSearchQuery, 
        sortBy, 
        setSortBy, 
        sortOrder, 
        setSortOrder,
        setCurrentPage,
        queryParams 
    } = usePendingOrdersFilters();

    const { data: ordersResponse, isLoading } = useOrdersQuery(queryParams);
    const updateOrderMutation = useUpdateOrderMutation();

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

    const orders = useMemo(() => ordersResponse?.data?.data || [], [ordersResponse]);
    const pagination = ordersResponse?.data?.pagination;

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

        try {
            await updateOrderMutation.mutateAsync({
                id: selectedOrderForResume.id,
                data: {
                    status: OrderStatus.CANCELLED,
                    cancellationReason: 'Clonado/Retomado',
                    comment: `Pedido original #${selectedOrderForResume.orderCode} retomado.`
                }
            });

            clearCurrentOrder();

            navigate('/pos', {
                state: {
                    cloneFromOrderId: selectedOrderForResume.id
                }
            });

        } catch (error) {
            // Error handling is managed by the mutation hook
        } finally {
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

        try {
            await updateOrderMutation.mutateAsync({
                id: selectedOrderForCancellation.id,
                data: {
                    status: OrderStatus.CANCELLED,
                    cancellationReason: reason,
                    comment: notes
                }
            });
            setIsCancelModalOpen(false);
            setSelectedOrderForCancellation(null);
        } catch (error) {
            // Error handled by mutation
        }
    };

    const handlePaymentSuccess = (paymentMethod: string) => {
        setLastPaymentMethod(paymentMethod);
        setIsPaymentModalOpen(false);
        setIsSuccessModalOpen(true);
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

    return (
        <div className="space-y-6">
            <PendingOrdersHeader
                ordersCount={pagination?.total || 0}
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
                    orders={orders}
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
                    orders={orders}
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
                        {pagination && (
                            <span className="text-[11px] font-bold text-foreground">
                                <span className="text-primary">{pagination.total}</span> órdenes pendientes
                                <span className="mx-2 text-muted-foreground/30">|</span>
                                Página {pagination.page} de {pagination.totalPages}
                            </span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={!pagination?.hasPrevPage || isLoading}
                            className="w-10 h-10 flex items-center justify-center bg-card hover:bg-muted rounded-xl transition-all disabled:opacity-20 border border-border/40 active:scale-90 shadow-none cursor-pointer"
                        >
                            <ChevronLeft className="w-4 h-4 text-foreground" />
                        </button>
                        <button 
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            disabled={!pagination?.hasNextPage || isLoading}
                            className="w-10 h-10 flex items-center justify-center bg-card hover:bg-muted rounded-xl transition-all disabled:opacity-20 border border-border/40 active:scale-90 shadow-none cursor-pointer"
                        >
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
                onPrintTicket={() => {}}
                onShareWhatsApp={() => {}}
            />

            {/* Cancel Modal */}
            <POSCancelModal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                onConfirm={handleConfirmCancel}
                orderCode={selectedOrderForCancellation?.orderCode || ''}
                totalAmount={selectedOrderForCancellation ? Number(selectedOrderForCancellation.totalAmount) : 0}
                isProcessing={updateOrderMutation.isPending}
            />

            <POSResumeModal
                isOpen={isResumeModalOpen}
                onClose={() => setIsResumeModalOpen(false)}
                onConfirm={handleConfirmResume}
                isProcessing={updateOrderMutation.isPending}
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
