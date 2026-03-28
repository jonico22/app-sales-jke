import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { orderService, OrderStatus } from '@/services/order.service';
import type { Order } from '@/services/order.service';
import { SalesHistoryFilterPanel, type FilterValues } from './components/SalesHistoryFilterPanel';
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

export default function SalesHistoryPage() {
    // const user = useAuthStore((state) => state.user); // Not needed for societyId anymore if we trust backend context

    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportMessage, setReportMessage] = useState<string>('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [hasPrevPage, setHasPrevPage] = useState(false);
    const [pageSize, setPageSize] = useState(10);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
    const [startDate, endDate] = dateRange;
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'CANCELLED'>('ALL');
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [advancedFilters, setAdvancedFilters] = useState<FilterValues>({
        createdBy: undefined,
        createdAtFrom: null,
        createdAtTo: null,
        updatedAtFrom: null,
        updatedAtTo: null,
        totalFrom: '',
        totalTo: '',
    });

    // Sorting state
    const [sortBy, setSortBy] = useState<string>('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1); // Reset to first page on search
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchOrders(currentPage);
    }, [currentPage, statusFilter, dateRange, advancedFilters, debouncedSearchTerm, pageSize, sortBy, sortOrder]); // Re-fetch on page, status, date, or advanced filters change

    const fetchOrders = async (page: number = 1) => {
        setIsLoading(true);
        try {
            const queryParams: any = {
                page,
                limit: pageSize,
                search: debouncedSearchTerm,
                sortBy,
                sortOrder,
            };

            if (startDate) {
                queryParams.dateFrom = format(startDate, 'yyyy-MM-dd');
            }
            if (endDate) {
                queryParams.dateTo = format(endDate, 'yyyy-MM-dd');
            }

            // Add advanced filters
            if (advancedFilters.createdBy) {
                queryParams.createdBy = advancedFilters.createdBy;
            }
            if (advancedFilters.createdAtFrom) {
                const date = advancedFilters.createdAtFrom;
                queryParams.createdAtFrom = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            }
            if (advancedFilters.createdAtTo) {
                const date = advancedFilters.createdAtTo;
                queryParams.createdAtTo = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            }
            if (advancedFilters.updatedAtFrom) {
                const date = advancedFilters.updatedAtFrom;
                queryParams.updatedAtFrom = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            }
            if (advancedFilters.updatedAtTo) {
                const date = advancedFilters.updatedAtTo;
                queryParams.updatedAtTo = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            }
            if (advancedFilters.totalFrom) {
                queryParams.totalFrom = advancedFilters.totalFrom;
            }
            if (advancedFilters.totalTo) {
                queryParams.totalTo = advancedFilters.totalTo;
            }

            if (statusFilter !== 'ALL') {
                queryParams.status = statusFilter;
            } else {
                // Creating a custom filter for history (COMPLETED or CANCELLED)
                // Since the API might not support OR filtering directly easily without custom backend logic,
                // we might need to rely on the backend sending all and we filter, OR 
                // if the backend implementation of `getAll` supports filtering by multiple statuses.
                // Checking order.service.ts, it seems to just take `status`.
                // For now, let's assume we want to show all non-pending if possible, or we might need to fetch all and filter client side if the API doesn't support "NOT PENDING".
                // However, moving to server-side pagination means we CANNOT filter client-side efficiently.
                // Strategies:
                // 1. Ask backend to support `status` as array.
                // 2. Filter by `status` explicitly if user selects one.
                // 3. If 'ALL' is selected, we ideally want only Completed/Cancelled.
                //    If the API returns everything, we show everything (including Pending).
                //    Let's check if we can filter by `status`.
                //    The `order.service.ts` says `status?: OrderStatus`.
                //    If we allow 'ALL', it will return PENDING too.
                //    Let's leave it as is for now, and maybe later refine the backend to support `status: ['COMPLETED', 'CANCELLED']`.
                //    OR, for this view, maybe we just accept showing all orders including Pending if they exist?
                //    The previous logic filtered client-side: value was `historyOrders = ordersData.filter(...)`.
                //    With pagination, we can't do that. 
                //    Let's try to pass `display: 'history'` param if the backend supported it, but it doesn't seem to.
                //    Let's explicitly fetch without status params for 'ALL', which means we get everything.
                //    The User might see Pending orders here too. That might be acceptable or we fix backend later.
            }

            // NOTE: To strictly mimic previous behavior (only COMPLETED/CANCELLED), we would need backend changes.
            // For now, we will implement standard pagination.

            const response = await orderService.getAll(queryParams);

            if (response.success && response.data) {
                // The service response type suggests data.data and data.pagination
                // But let's handle the response structure carefully as `order.service.ts` was recently updated.
                // It defines `OrdersResponse` with `data: { data: Order[], pagination: Pagination }`.

                const responseData = response.data as any; // Cast to avoid strict type issues during transition

                if (responseData.data && Array.isArray(responseData.data)) {
                    setOrders(responseData.data);
                    if (responseData.pagination) {
                        setTotalPages(responseData.pagination.totalPages);
                        setTotalOrders(responseData.pagination.total);
                        setHasNextPage(responseData.pagination.hasNextPage);
                        setHasPrevPage(responseData.pagination.hasPrevPage);
                    }
                } else if (Array.isArray(responseData)) {
                    // Fallback if API returns direct array (legacy)
                    setOrders(responseData);
                }
            }
        } catch (error) {
            console.error('Error fetching sales history:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    // Removed obsolete useEffect and fetchOrders call in favor of the new ones above


    // Local filtering removed in favor of Server Side Pagination
    const filteredOrders = orders;



    const [isExporting, setIsExporting] = useState(false);

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
                    [OrderStatus.COMPLETED]: 'Completado',
                    [OrderStatus.CANCELLED]: 'Anulado',
                    [OrderStatus.PENDING]: 'Pendiente',
                    [OrderStatus.PENDING_PAYMENT]: 'Pedido Pendiente'
                };
                return statuses[order.status] || order.status;
            },
            width: 15
        },
    ];

    const handleExport = () => {
        exportToExcel(
            filteredOrders,
            getExcelColumns(),
            `Reporte_Ventas_Pagina_${currentPage}_${format(new Date(), 'yyyy-MM-dd')}`,
            'Ventas'
        );
    };

    const handleExportGeneral = async () => {
        setIsExporting(true);
        try {
            const queryParams: any = {
                search: debouncedSearchTerm,
            };

            if (startDate) {
                queryParams.dateFrom = format(startDate, 'yyyy-MM-dd');
            }
            if (endDate) {
                queryParams.dateTo = format(endDate, 'yyyy-MM-dd');
            }

            // Add advanced filters
            if (advancedFilters.createdBy) queryParams.createdBy = advancedFilters.createdBy;
            if (advancedFilters.createdAtFrom) {
                const date = advancedFilters.createdAtFrom;
                queryParams.createdAtFrom = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            }
            if (advancedFilters.createdAtTo) {
                const date = advancedFilters.createdAtTo;
                queryParams.createdAtTo = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            }
            if (advancedFilters.updatedAtFrom) {
                const date = advancedFilters.updatedAtFrom;
                queryParams.updatedAtFrom = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            }
            if (advancedFilters.updatedAtTo) {
                const date = advancedFilters.updatedAtTo;
                queryParams.updatedAtTo = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            }
            if (statusFilter !== 'ALL') {
                queryParams.status = statusFilter;
            }

            const response = await orderService.getReports(queryParams);

            if (response.success && response.data) {
                // Open success modal instead of exporting
                setReportMessage(response.data.message);
                setIsReportModalOpen(true);
            } else {
                console.error('Error fetching general report:', response);
            }

        } catch (error) {
            console.error('Error exporting general report:', error);
        } finally {
            setIsExporting(false);
        }
    };



    // URL Search Params for Detail View
    const [searchParams, setSearchParams] = useSearchParams();
    const detailId = searchParams.get('id');

    // Effect to auto-open modal or handle view based on URL
    // Note: User requested full page, so we will switch view if detailId matches
    useEffect(() => {
        if (detailId) {
            // Logic to handle detail view is in the render
        }
    }, [detailId]);

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
                    orders={filteredOrders}
                    isLoading={isLoading}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                    onViewDetail={(id) => setSearchParams({ id })}
                />
                <SalesHistoryMobileList
                    orders={filteredOrders}
                    isLoading={isLoading}
                    onViewDetail={(id) => setSearchParams({ id })}
                />
                <SalesHistoryPagination
                    ordersLength={filteredOrders.length}
                    currentPage={currentPage}
                    pageSize={pageSize}
                    totalOrders={totalOrders}
                    totalPages={totalPages}
                    isLoading={isLoading}
                    hasPrevPage={hasPrevPage}
                    hasNextPage={hasNextPage}
                    onPageSizeChange={(size) => {
                        setPageSize(size);
                        setCurrentPage(1);
                    }}
                    onPrevPage={() => setCurrentPage(prev => prev - 1)}
                    onNextPage={() => setCurrentPage(prev => prev + 1)}
                />
            </div>

            <SalesHistoryFilterPanel
                open={isFilterPanelOpen}
                onOpenChange={setIsFilterPanelOpen}
                onApplyFilters={(filters) => {
                    setAdvancedFilters(filters);
                    setCurrentPage(1); // Reset to first page when applying filters
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
        </div>
    );
}
