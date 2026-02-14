import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, User, ShoppingBag, FileText, Printer, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Order } from '@/services/order.service';
import { useSocietyStore } from '@/store/society.store';
import { orderItemService, type OrderItem } from '@/services/order-item.service';
import { orderService } from '@/services/order.service';

interface SalesOrderDetailViewProps {
    orderId: string;
    initialOrder?: Order | null;
    onBack: () => void;
}

export function SalesOrderDetailView({ orderId, initialOrder, onBack }: SalesOrderDetailViewProps) {
    const society = useSocietyStore(state => state.society);
    const [order, setOrder] = useState<Order | null>(initialOrder || null);
    const [items, setItems] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // Fetch order if not provided or if ID mismatches (though unlikely with current usage)
                let currentOrder = order;
                if (!currentOrder || currentOrder.id !== orderId) {
                    const orderRes = await orderService.getById(orderId);
                    if (orderRes.success && orderRes.data) {
                        currentOrder = orderRes.data;
                        setOrder(currentOrder);
                    } else {
                        setError("No se pudo cargar la información de la venta.");
                        return;
                    }
                }

                // Fetch items
                const itemsRes = await orderItemService.getAll({ orderId });
                if (itemsRes.success && itemsRes.data) {
                    setItems(itemsRes.data.data || []);
                }
            } catch (err) {
                console.error("Error loading order details:", err);
                setError("Ocurrió un error al cargar los detalles.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [orderId]);

    if (loading && !order) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-slate-500">Cargando detalles de la venta...</p>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <div className="bg-red-50 p-4 rounded-full mb-4">
                    <FileText className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Error al cargar</h3>
                <p className="text-slate-500 mb-6">{error || "No se encontró la venta solicitada."}</p>
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
                >
                    <ArrowLeft size={18} />
                    <span>Volver al historial</span>
                </button>
            </div>
        );
    }

    const clientName = order.partner?.companyName || `${order.partner?.firstName || ''} ${order.partner?.lastName || ''}`.trim() || 'Cliente General';
    const currencySymbol = order.currency?.symbol || society?.mainCurrency?.symbol || 'S/';

    const subtotal = Number(order.subtotal) || 0;
    const tax = Number(order.taxAmount) || 0;
    const total = Number(order.totalAmount) || 0;
    const discount = Number(order.discount) || 0;

    return (
        <div className="max-w-[1000px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Header / Nav */}
            <div className="flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg transition-all"
                >
                    <ArrowLeft size={20} />
                    <span className="font-medium">Volver</span>
                </button>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
                        <Printer size={18} />
                        <span className="hidden sm:inline">Imprimir</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-600/20">
                        <ShoppingBag size={18} />
                        <span className="hidden sm:inline">WhatsApp</span>
                    </button>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Order Status Banner */}
                <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Venta #{order.orderCode}</h1>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Clock size={14} />
                                <span>{order.createdAt ? format(new Date(order.createdAt), 'dd MMMM yyyy, hh:mm a', { locale: es }) : '-'}</span>
                            </div>
                        </div>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-sm font-bold border ${order.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            order.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-100' :
                                'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                        {order.status === 'COMPLETED' ? 'COMPLETADO' :
                            order.status === 'CANCELLED' ? 'ANULADO' : order.status}
                    </div>
                </div>

                <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Details */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Items Table */}
                        <div>
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <ShoppingBag size={18} className="text-slate-400" />
                                Productos
                            </h3>
                            <div className="border border-slate-100 rounded-xl overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50/80 border-b border-slate-100">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-semibold text-slate-600">Descripción</th>
                                            <th className="px-4 py-3 text-center font-semibold text-slate-600">Cant.</th>
                                            <th className="px-4 py-3 text-right font-semibold text-slate-600">P. Unit</th>
                                            <th className="px-4 py-3 text-right font-semibold text-slate-600">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {items.map((item, index) => (
                                            <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-slate-700">{item.product?.name || `Producto #${item.productId}`}</div>
                                                    <div className="text-xs text-slate-400 font-mono">{item.product?.code}</div>
                                                </td>
                                                <td className="px-4 py-3 text-center text-slate-600">{item.quantity}</td>
                                                <td className="px-4 py-3 text-right text-slate-600">
                                                    {currencySymbol} {Number(item.unitPrice).toFixed(2)}
                                                </td>
                                                <td className="px-4 py-3 text-right font-semibold text-slate-700">
                                                    {currencySymbol} {Number(item.total).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Payment Info */}
                        {order.OrderPayment && order.OrderPayment.length > 0 && (
                            <div>
                                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <FileText size={18} className="text-slate-400" />
                                    Información de Pago
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {order.OrderPayment.map((payment, idx) => (
                                        <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Método</span>
                                                <span className="text-xs font-mono text-slate-400">{payment.createdAt ? format(new Date(payment.createdAt), 'dd/MM/yyyy HH:mm') : '-'}</span>
                                            </div>
                                            <p className="font-bold text-slate-700 mb-1">{payment.paymentMethod}</p>
                                            <p className="text-sm text-slate-600">Monto: {currencySymbol} {Number(payment.amount).toFixed(2)}</p>
                                            {payment.referenceCode && (
                                                <p className="text-xs text-slate-500 mt-1">Ref: {payment.referenceCode}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Summary & Client */}
                    <div className="space-y-6">
                        {/* Client Card */}
                        <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <User size={18} className="text-slate-400" />
                                Cliente
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="font-semibold text-slate-700">{clientName}</p>
                                    {order.partner?.documentNumber && (
                                        <p className="text-xs text-slate-500">{order.partner.documentType}: {order.partner.documentNumber}</p>
                                    )}
                                </div>
                                {order.partner?.email && (
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Mail size={14} className="text-slate-400" />
                                        <span>{order.partner.email}</span>
                                    </div>
                                )}
                                {/* Assuming phone might be available or added later */}
                                {/* <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Phone size={14} className="text-slate-400" />
                                    <span>-</span>
                                </div> */}
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                            <h3 className="font-bold text-slate-800 mb-4">Resumen</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm text-slate-600">
                                    <span>Subtotal</span>
                                    <span>{currencySymbol} {subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-slate-600">
                                    <span>IGV (18%)</span>
                                    <span>{currencySymbol} {tax.toFixed(2)}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-sm text-emerald-600 font-medium">
                                        <span>Descuento</span>
                                        <span>- {currencySymbol} {discount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="pt-3 mt-3 border-t border-slate-200 flex justify-between items-center">
                                    <span className="font-bold text-slate-800">Total</span>
                                    <span className="text-2xl font-black text-slate-900">{currencySymbol} {total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {order.notes && (
                            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-amber-800 text-sm">
                                <p className="font-bold mb-1">Notas:</p>
                                <p>{order.notes}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
