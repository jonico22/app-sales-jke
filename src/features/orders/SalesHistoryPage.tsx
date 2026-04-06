import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { orderService } from '@/services/order.service';
import type { Order } from '@/services/order.service';
import { OrderStatus } from '@/services/order.service';
import { SalesHistoryFilterPanel } from './components/SalesHistoryFilterPanel';
import { SalesHistoryResultModal } from './components/SalesHistoryResultModal';
import { exportToExcel } from '@/utils/excel.utils';
import { ReportGenerationModal } from './components/ReportGenerationModal';
import { format } from 'date-fns';
import { SalesHistoryHeader } from './components/SalesHistoryHeader';
import { SalesHistoryFilterBar } from './components/SalesHistoryFilterBar';
import { SalesHistoryTable } from './components/SalesHistoryTable';
import { SalesHistoryMobileList } from './components/SalesHistoryMobileList';
import { SalesHistoryPagination } from './components/SalesHistoryPagination';
import { formatCurrency } from './components/SalesHistoryUtils';
import { SalesOrderDetailView } from './components/SalesOrderDetailView';
import { useOrdersQuery, useUpdateOrderMutation } from './hooks/useOrderQueries';
import { useSalesHistoryFilters } from './hooks/useOrderFilters';
import { POSCancelModal } from '../pos/components/POSCancelModal';

export default function SalesHistoryPage() {
    const {
        searchTerm,
        setSearchTerm,
        dateRange,
        setDateRange,
        statusFilter,
        setStatusFilter,
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        sortBy,
        sortOrder,
        handleSort,
        setAdvancedFilters,
        queryParams
    } = useSalesHistoryFilters();

    const { data: ordersResponse, isLoading } = useOrdersQuery(queryParams);
    
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportMessage, setReportMessage] = useState<string>('');
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [selectedOrderForCancellation, setSelectedOrderForCancellation] = useState<Order | null>(null);

    const updateOrderMutation = useUpdateOrderMutation();

    const orders = useMemo(() => ordersResponse?.data?.data || [], [ordersResponse]);
    const pagination = ordersResponse?.data?.pagination;

    const [startDate, endDate] = dateRange;

    const getExcelColumns = () => [
        { header: 'ID Venta', key: 'orderCode' as keyof Order, width: 15 },
        {
            header: 'Fecha de Modificación',
            key: (order: Order) => order.updatedAt ? format(new Date(order.updatedAt), 'dd/MM/yyyy HH:mm') : '-',
            width: 20
        },
        {
            header: 'Cliente',
            key: (order: Order) => order.partner?.companyName || `${order.partner?.firstName || ''} ${order.partner?.lastName || ''}`.trim() || 'Cliente General',
            width: 30
        },
        { header: 'Total', key: (order: Order) => formatCurrency(order.totalAmount, ''), width: 15 },
        {
            header: 'Método de Pago',
            key: (order: Order) => {
                const method = order.OrderPayment?.[0]?.paymentMethod;
                const methods: Record<string, string> = {
                    'CASH': 'Efectivo', 'CARD': 'Tarjeta', 'YAPE': 'Yape', 'PLIN': 'Plin',
                    'TRANSFER': 'Transferencia', 'OTHER': 'Otro'
                };
                return method ? (methods[method] || method) : '-';
            },
            width: 15
        },
        {
            header: 'Estado',
            key: (order: Order) => {
                const statuses: Record<string, string> = {
                    'COMPLETED': 'Completado',
                    'CANCELLED': 'Anulado',
                    'PENDING': 'Pendiente',
                    'PENDING_PAYMENT': 'Pedido Pendiente'
                };
                return statuses[order.status] || order.status;
            },
            width: 15
        },
    ];

    const handleExport = () => {
        exportToExcel(
            orders,
            getExcelColumns(),
            `Reporte_Ventas_Pagina_${currentPage}_${format(new Date(), 'yyyy-MM-dd')}`,
            'Ventas'
        );
    };

    const handleExportGeneral = async () => {
        setIsExporting(true);
        try {
            const response = await orderService.getReports(queryParams);
            if (response.success && response.data) {
                setReportMessage(response.data.message);
                setIsReportModalOpen(true);
            }
        } catch (error) {
            console.error('Error exporting general report:', error);
        } finally {
            setIsExporting(false);
        }
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
        } catch {
            // Error handled by mutation
        }
    };

    const [searchParams, setSearchParams] = useSearchParams();
    const detailId = searchParams.get('id');

    const handleClearDetail = () => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('id');
        setSearchParams(newParams);
        setSelectedOrder(null);
    };

    if (detailId) {
        return (
            <div className="max-w-[1400px] mx-auto">
                <SalesOrderDetailView
                    orderId={detailId}
                    onBack={handleClearDetail}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto min-h-screen bg-background">
            <SalesHistoryHeader
                isExporting={isExporting}
                onExportGeneral={handleExportGeneral}
                onExportCurrent={handleExport}
            />

            <SalesHistoryFilterBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                startDate={startDate}
                endDate={endDate}
                onDateChange={(range: any) => {
                    setDateRange(range);
                    setCurrentPage(1);
                }}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                onOpenFilters={() => setIsFilterPanelOpen(true)}
            />

            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <SalesHistoryTable
                    orders={orders}
                    isLoading={isLoading}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                    onViewDetail={(id) => setSearchParams({ id })}
                    onCancel={handleCancel}
                />
                <SalesHistoryMobileList
                    orders={orders}
                    isLoading={isLoading}
                    onViewDetail={(id) => setSearchParams({ id })}
                    onCancel={handleCancel}
                />
                <SalesHistoryPagination
                    ordersLength={orders.length}
                    currentPage={currentPage}
                    pageSize={pageSize}
                    totalOrders={pagination?.total || 0}
                    totalPages={pagination?.totalPages || 1}
                    isLoading={isLoading}
                    hasPrevPage={pagination?.hasPrevPage || false}
                    hasNextPage={pagination?.hasNextPage || false}
                    onPageSizeChange={(size) => {
                        setPageSize(size);
                        setCurrentPage(1);
                    }}
                    onPrevPage={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    onNextPage={() => setCurrentPage(prev => prev + 1)}
                />
            </div>

            <SalesHistoryFilterPanel
                open={isFilterPanelOpen}
                onOpenChange={setIsFilterPanelOpen}
                onApplyFilters={(filters) => {
                    setAdvancedFilters(filters);
                    setCurrentPage(1);
                }}
            />

            <SalesHistoryResultModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                order={selectedOrder}
            />

            <ReportGenerationModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                message={reportMessage}
            />

            <POSCancelModal
                isOpen={isCancelModalOpen}
                onClose={() => {
                    setIsCancelModalOpen(false);
                    setSelectedOrderForCancellation(null);
                }}
                onConfirm={handleConfirmCancel}
                orderCode={selectedOrderForCancellation?.orderCode || ''}
                totalAmount={selectedOrderForCancellation ? Number(selectedOrderForCancellation.totalAmount) : 0}
                isProcessing={updateOrderMutation.isPending}
            />
        </div>
    );
}
