import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
    FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { OrderPayment } from '@/services/order-payment.service';
import { DateRangePicker } from '@/components/shared/DateRangePicker';
import { SalesHistoryFilterPanel, type FilterValues } from './components/SalesHistoryFilterPanel';
import { SalesHistoryResultModal } from './components/SalesHistoryResultModal';

export default function SalesHistoryPage() {
    // const user = useAuthStore((state) => state.user); // Not needed for societyId anymore if we trust backend context
    const navigate = useNavigate();

    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [hasPrevPage, setHasPrevPage] = useState(false);
    const pageLimit = 10;

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
    }, [currentPage, statusFilter, dateRange, advancedFilters, debouncedSearchTerm]); // Re-fetch on page, status, date, or advanced filters change

    const fetchOrders = async (page: number = 1) => {
        setIsLoading(true);
        try {
            const queryParams: any = {
                page,
                limit: pageLimit,
                search: debouncedSearchTerm,
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

    // Removed obsolete useEffect and fetchOrders call in favor of the new ones above


    // Local filtering removed in favor of Server Side Pagination
    const filteredOrders = orders;

    const handleViewDetails = (order: Order) => {
        setSelectedOrder(order);
        setIsDetailModalOpen(true);
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            [OrderStatus.COMPLETED]: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Completado' },
            [OrderStatus.CANCELLED]: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', label: 'Anulado' },
            [OrderStatus.PENDING]: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Pendiente' },
            [OrderStatus.PENDING_PAYMENT]: { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500', label: 'Pedido Pendiente' },
        };
        const config = styles[status as keyof typeof styles] || { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500', label: status };

        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                {config.label}
            </span>
        );
    };

    const getPaymentBadge = (payment?: OrderPayment) => {
        if (!payment) return <span className="text-gray-400 text-xs">-</span>;

        const styles = {
            'CASH': { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: Banknote, label: 'Efectivo' },
            'CARD': { bg: 'bg-blue-100', text: 'text-blue-700', icon: CreditCard, label: 'Tarjeta' },
            'YAPE': { bg: 'bg-purple-100', text: 'text-purple-700', icon: QrCode, label: 'Yape' },
            'PLIN': { bg: 'bg-cyan-100', text: 'text-cyan-700', icon: QrCode, label: 'Plin' },
            'TRANSFER': { bg: 'bg-orange-100', text: 'text-orange-700', icon: ArrowRightLeft, label: 'Transferencia' },
            'OTHER': { bg: 'bg-gray-100', text: 'text-gray-700', icon: HelpCircle, label: 'Otro' },
        };

        const config = styles[payment.paymentMethod as keyof typeof styles] || styles['OTHER'];
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                <Icon size={14} />
                {config.label}
            </span>
        );
    };

    return (
        <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Historial de Ventas</h1>
                    <p className="text-gray-500 text-sm mt-1">Gestione y verifique las transacciones recientes.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 shadow-sm transition-all text-sm font-medium">
                        <Download size={18} />
                        <span>Exportar</span>
                    </button>
                    <button
                        onClick={() => navigate('/pos')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-all text-sm font-medium"
                    >
                        <Plus size={18} />
                        <span>Nueva Venta</span>
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-2 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por cliente o ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-blue-500/20 text-sm outline-none"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <DateRangePicker
                        startDate={startDate}
                        endDate={endDate}
                        onChange={(update) => {
                            setDateRange(update);
                            setCurrentPage(1); // Reset to page 1 on date change
                        }}
                    />

                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="appearance-none pl-9 pr-8 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-600 focus:outline-none cursor-pointer min-w-[180px]"
                        >
                            <option value="ALL">Todos los Métodos</option>
                            <option value={OrderStatus.COMPLETED}>Completados</option>
                            <option value={OrderStatus.CANCELLED}>Cancelados</option>
                        </select>
                        <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                    </div>

                    <button
                        onClick={() => setIsFilterPanelOpen(true)}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-600 transition-colors"
                    >
                        <SlidersHorizontal size={16} />
                        <span>Más Filtros</span>
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID Venta</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Cliente</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Método de Pago</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        <RefreshCw size={24} className="animate-spin mx-auto mb-2 opacity-20" />
                                        <span className="text-sm">Cargando transacciones...</span>
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        No se encontraron ventas recientes.
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => {
                                    const clientName = order.partner?.companyName || `${order.partner?.firstName || ''} ${order.partner?.lastName || ''}`.trim() || 'Cliente General';
                                    const initials = clientName.slice(0, 2).toUpperCase();
                                    const payment = order.OrderPayment && order.OrderPayment.length > 0 ? order.OrderPayment[0] : undefined;

                                    return (
                                        <tr key={order.id} className="hover:bg-gray-50/80 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                #{order.orderCode}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {order.createdAt ? format(new Date(order.createdAt), 'dd MMM, hh:mm a', { locale: es }) : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">
                                                        {initials}
                                                    </div>
                                                    <span className="text-sm text-gray-700 font-medium">{clientName}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                {order.currency?.symbol} {Number(order.totalAmount).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getPaymentBadge(payment)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(order.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => handleViewDetails(order)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Ver Detalle"
                                                    >
                                                        <FileText size={18} />
                                                    </button>
                                                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
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

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50/50">
                    <span className="text-sm text-gray-500">Mostrando <span className="font-medium">{orders.length > 0 ? ((currentPage - 1) * pageLimit) + 1 : 0}-{Math.min(currentPage * pageLimit, totalOrders)}</span> de <span className="font-medium">{totalOrders}</span> ventas</span>
                    <div className="flex gap-2">
                        <button
                            disabled={!hasPrevPage || isLoading}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            className="px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm transition-all"
                        >
                            Anterior
                        </button>
                        <span className="text-sm text-gray-600 min-w-[100px] text-center flex items-center justify-center">
                            Página {currentPage} de {totalPages}
                        </span>
                        <button
                            disabled={!hasNextPage || isLoading}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm transition-all"
                        >
                            Siguiente
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
        </div>
    );
}
