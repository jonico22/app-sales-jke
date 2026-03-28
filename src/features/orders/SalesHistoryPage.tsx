import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SalesOrderDetailView } from './components/SalesOrderDetailView';

import { orderService, OrderStatus } from '@/services/order.service';
import type { Order } from '@/services/order.service';
import {
    Search,
    RefreshCw,
    Download,
    Plus,
    MoreVertical,
    Banknote,
    CreditCard,
    QrCode,
    ArrowRightLeft,
    HelpCircle,
    ChevronDown,
    SlidersHorizontal,
    FileText,
    Clock,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { OrderPayment } from '@/services/order-payment.service';
import { DateRangePicker } from '@/components/shared/DateRangePicker';
import { SalesHistoryFilterPanel, type FilterValues } from './components/SalesHistoryFilterPanel';
import { SalesHistoryResultModal } from './components/SalesHistoryResultModal';
import { exportToExcel } from '@/utils/excel.utils';
import { ReportGenerationModal } from './components/ReportGenerationModal';
import { SortableTableHead } from '@/components/shared/SortableTableHead';

// Rule js-cache-function-results (Priority 2)
const CURRENCY_FORMATTER = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

const formatCurrency = (value: string | number, symbol: string = 'S/') => {
    // We replace the symbol to match the society symbol if needed
    const formatted = CURRENCY_FORMATTER.format(Number(value)).replace(/[^0-9.,]/g, '');
    return `${symbol} ${formatted}`;
};

export default function SalesHistoryPage() {
    // const user = useAuthStore((state) => state.user); // Not needed for societyId anymore if we trust backend context
    const navigate = useNavigate();

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


    const getStatusBadge = (status: string) => {
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

    const getPaymentBadge = (payment?: OrderPayment) => {
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
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-lg font-bold text-foreground tracking-tight uppercase">Historial de Ventas</h1>
                    <p className="text-muted-foreground text-[10px] mt-0.5 font-medium">Gestione y verifique las transacciones recientes.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <button
                        onClick={handleExportGeneral}
                        disabled={isExporting}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-md shadow-emerald-600/10 transition-all text-[11px] font-bold uppercase tracking-wider disabled:opacity-70 disabled:cursor-not-allowed active:scale-95"
                    >
                        {isExporting ? <RefreshCw size={14} className="animate-spin" /> : <FileText size={14} />}
                        <span className="truncate">Exportar Reporte General</span>
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-card border border-border rounded-xl text-foreground hover:bg-muted shadow-sm transition-all text-[11px] font-bold uppercase tracking-wider active:scale-95"
                    >
                        <Download size={14} />
                        <span className="truncate">Exportar Actual</span>
                    </button>
                    <button
                        onClick={() => navigate('/pos')}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary-hover shadow-md shadow-primary/10 transition-all text-[11px] font-bold uppercase tracking-wider active:scale-95"
                    >
                        <Plus size={14} />
                        Nueva Venta
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-card p-3 rounded-2xl border border-border shadow-sm flex flex-col xl:flex-row gap-3 items-center justify-between">
                <div className="relative w-full xl:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar por cliente o ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary text-xs outline-none transition-all placeholder:text-muted-foreground/60 font-medium"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
                    <DateRangePicker
                        startDate={startDate}
                        endDate={endDate}
                        onChange={(update) => {
                            setDateRange(update);
                            setCurrentPage(1);
                        }}
                    />

                    <div className="relative flex-1 sm:flex-none sm:min-w-[180px]">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="w-full appearance-none pl-10 pr-10 py-2 bg-muted/50 hover:bg-muted border border-border rounded-xl text-xs text-foreground focus:outline-none cursor-pointer font-medium transition-colors"
                        >
                            <option value="ALL">Todos los Estados</option>
                            <option value={OrderStatus.COMPLETED}>Completados</option>
                            <option value={OrderStatus.CANCELLED}>Cancelados</option>
                        </select>
                        <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={14} />
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none" size={12} />
                    </div>

                    <button
                        onClick={() => setIsFilterPanelOpen(true)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-muted/50 hover:bg-muted border border-border rounded-xl text-xs text-muted-foreground hover:text-foreground transition-all font-medium active:scale-95"
                    >
                        <SlidersHorizontal size={14} />
                        <span>Más Filtros</span>
                    </button>
                </div>
            </div>

            {/* Table / List */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                {/* Desktop view */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/30 border-b border-border">
                            <tr>
                                <SortableTableHead
                                    field="orderCode"
                                    currentSortBy={sortBy}
                                    currentSortOrder={sortOrder}
                                    onSort={handleSort}
                                    className="px-5 py-3 text-left text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider"
                                >
                                    ID Venta
                                </SortableTableHead>
                                <SortableTableHead
                                    field="updatedAt"
                                    currentSortBy={sortBy}
                                    currentSortOrder={sortOrder}
                                    onSort={handleSort}
                                    className="px-5 py-3 text-left text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider"
                                >
                                    Fecha de Modificación
                                </SortableTableHead>
                                <SortableTableHead
                                    field="partnerName"
                                    currentSortBy={sortBy}
                                    currentSortOrder={sortOrder}
                                    onSort={handleSort}
                                    className="px-5 py-3 text-left text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider"
                                >
                                    Cliente
                                </SortableTableHead>
                                <SortableTableHead
                                    field="totalAmount"
                                    currentSortBy={sortBy}
                                    currentSortOrder={sortOrder}
                                    onSort={handleSort}
                                    className="px-5 py-3 text-left text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider"
                                >
                                    Total
                                </SortableTableHead>
                                <th className="px-5 py-3 text-left text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">Pago</th>
                                <SortableTableHead
                                    field="status"
                                    currentSortBy={sortBy}
                                    currentSortOrder={sortOrder}
                                    onSort={handleSort}
                                    className="px-5 py-3 text-left text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider"
                                >
                                    Estado
                                </SortableTableHead>
                                <th className="px-5 py-3 text-center text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                                        <RefreshCw size={24} className="animate-spin mx-auto mb-2 opacity-20" />
                                        <span className="text-sm">Cargando transacciones...</span>
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                                        No se encontraron ventas recientes.
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => {
                                    const clientName = order.partner?.companyName || `${order.partner?.firstName || ''} ${order.partner?.lastName || ''}`.trim() || 'Cliente General';
                                    const initials = clientName.slice(0, 2).toUpperCase();
                                    const payment = order.OrderPayment && order.OrderPayment.length > 0 ? order.OrderPayment[0] : undefined;

                                    return (
                                        <tr key={order.id} className="hover:bg-muted/10 transition-colors group">
                                            <td className="px-5 py-3 whitespace-nowrap text-xs font-semibold text-foreground">
                                                #{order.orderCode}
                                            </td>
                                            <td className="px-5 py-3 whitespace-nowrap text-[11px] text-muted-foreground/80 font-medium">
                                                {order.updatedAt ? format(new Date(order.updatedAt), 'dd MMM, hh:mm a', { locale: es }) : '-'}
                                            </td>
                                            <td className="px-5 py-3 whitespace-nowrap">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold border border-primary/20">
                                                        {initials}
                                                    </div>
                                                    <span className="text-xs text-foreground font-semibold">{clientName}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 whitespace-nowrap text-xs font-bold text-foreground">
                                                {formatCurrency(order.totalAmount, order.currency?.symbol || 'S/')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getPaymentBadge(payment)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(order.status)}
                                            </td>
                                            <td className="px-5 py-3 whitespace-nowrap text-center">
                                                <div className="flex justify-center gap-1.5 transition-opacity">
                                                    <button
                                                        onClick={() => {
                                                            setSearchParams({ id: order.id });
                                                        }}
                                                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-all active:scale-95"
                                                        title="Ver Detalle"
                                                    >
                                                        <FileText size={18} />
                                                    </button>
                                                    <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all active:scale-95">
                                                        <MoreVertical size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile view */}
                <div className="md:hidden p-4 space-y-4 bg-muted/5 min-h-screen">
                    {isLoading ? (
                        <div className="p-8 text-center bg-card rounded-2xl border border-border/40">
                            <RefreshCw className="w-8 h-8 animate-spin text-primary/20 mx-auto mb-3" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Sincronizando ventas...</p>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="p-16 text-center bg-card rounded-2xl border border-border/40 text-muted-foreground/40 font-black uppercase tracking-widest text-[10px]">
                            No se encontraron ventas recientes
                        </div>
                    ) : (
                        filteredOrders.map((order) => {
                            const clientName = order.partner?.companyName || `${order.partner?.firstName || ''} ${order.partner?.lastName || ''}`.trim() || 'Cliente General';
                            const initials = clientName.slice(0, 2).toUpperCase();
                            const payment = order.OrderPayment && order.OrderPayment.length > 0 ? order.OrderPayment[0] : undefined;

                            return (
                                <div
                                    key={order.id}
                                    className="bg-card rounded-2xl border border-border/80 shadow-none active:bg-muted/30 transition-all relative overflow-hidden flex flex-col"
                                    onClick={() => setSearchParams({ id: order.id })}
                                >
                                    {/* 1. Header: Venta ID + Date */}
                                    <div className="p-4 border-b border-border/30 flex items-center justify-between bg-muted/5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-black text-primary/60 uppercase tracking-widest">Venta</span>
                                            <span className="font-mono text-[11px] font-black text-foreground">#{order.orderCode}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/70">
                                            <Clock size={10} className="opacity-50" />
                                            <span>{order.updatedAt ? format(new Date(order.updatedAt), 'dd MMM, hh:mm a', { locale: es }) : '-'}</span>
                                        </div>
                                    </div>

                                    {/* 2. Client Info */}
                                    <div className="p-4 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black border border-primary/10 shrink-0">
                                            {initials}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest mb-0.5 leading-none">Cliente</p>
                                            <h3 className="text-[13px] font-black text-foreground uppercase tracking-tight truncate leading-tight">{clientName}</h3>
                                        </div>
                                    </div>

                                    {/* 3. Status & Payment Row */}
                                    <div className="px-4 pb-3 flex items-center gap-4">
                                        <div className="space-y-1">
                                            <p className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] leading-none mb-1.5">Estado</p>
                                            {getStatusBadge(order.status)}
                                        </div>
                                        <div className="w-px h-8 bg-border/40" />
                                        <div className="space-y-1">
                                            <p className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] leading-none mb-1.5">Método</p>
                                            {getPaymentBadge(payment)}
                                        </div>
                                    </div>

                                    {/* 4. Total highlight section (Prominent & Full Width) */}
                                    <div className="mx-4 mb-4 p-3 bg-primary/5 rounded-xl border border-primary/10 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <p className="text-[9px] font-black text-primary/50 uppercase tracking-widest leading-none mb-1">Monto Cobrado</p>
                                            <span className="text-[10px] font-bold text-muted-foreground/60 leading-none">Total Final</span>
                                        </div>
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-xl font-black text-foreground tracking-tighter leading-none">
                                                {formatCurrency(order.totalAmount, order.currency?.symbol || 'S/')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* 5. Actions Footer */}
                                    <div className="p-3 bg-muted/20 border-t border-border/30 flex items-center justify-end gap-2">
                                        <button
                                            className="flex-1 flex items-center justify-center gap-2 h-10 bg-card hover:bg-muted text-foreground border border-border/40 rounded-xl transition-all active:scale-95"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSearchParams({ id: order.id });
                                            }}
                                        >
                                            <FileText size={14} className="opacity-50" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Ver Detalle</span>
                                        </button>
                                        <button
                                            className="w-10 h-10 flex items-center justify-center bg-card hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40 rounded-xl transition-all active:scale-95 shrink-0"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <MoreVertical size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Pagination */}
                <div className="px-6 py-5 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-6 bg-muted/10">
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                        <div className="flex flex-col items-center sm:items-start order-2 sm:order-1">
                            <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest leading-none mb-1">Resultados</span>
                            <span className="text-[11px] font-bold text-foreground whitespace-nowrap">
                                <span className="text-primary">{orders.length > 0 ? ((currentPage - 1) * pageSize) + 1 : 0}-{Math.min(currentPage * pageSize, totalOrders)}</span> de <span className="font-bold">{totalOrders}</span> registros
                            </span>
                        </div>
                        <div className="relative w-full sm:w-auto order-1 sm:order-2">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40">
                                <SlidersHorizontal size={10} />
                            </div>
                            <select
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="w-full sm:w-auto pl-8 pr-8 py-2 bg-card border border-border/50 text-foreground text-[10px] rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary block font-black outline-none transition-all uppercase tracking-wider appearance-none shadow-sm"
                            >
                                <option value="10">10 / pág</option>
                                <option value="20">20 / pág</option>
                                <option value="40">40 / pág</option>
                                <option value="60">60 / pág</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none" size={10} />
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 w-full md:w-auto">
                        <button
                            disabled={!hasPrevPage || isLoading}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            className="w-10 h-10 flex items-center justify-center border border-border/50 bg-card rounded-xl text-foreground hover:bg-muted disabled:opacity-20 shadow-sm transition-all active:scale-90"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <div className="px-4 py-2 bg-muted/50 border border-border/50 rounded-xl min-w-[100px] text-center shadow-inner">
                            <p className="text-[8px] font-black text-muted-foreground/60 uppercase tracking-widest leading-none mb-0.5">Página</p>
                            <p className="text-[11px] font-black text-foreground">{currentPage} / {totalPages}</p>
                        </div>
                        <button
                            disabled={!hasNextPage || isLoading}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="w-10 h-10 flex items-center justify-center border border-border/50 bg-card rounded-xl text-foreground hover:bg-muted disabled:opacity-20 shadow-sm transition-all active:scale-90"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
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
