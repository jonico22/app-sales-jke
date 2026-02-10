import { useState, useEffect } from 'react';
import { X, Calendar, User, ShoppingBag, FileText, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Order } from '@/services/order.service';
import { useSocietyStore } from '@/store/society.store';
import { orderItemService, type OrderItem } from '@/services/order-item.service';

interface SalesHistoryResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: Order | null;
}

export function SalesHistoryResultModal({ isOpen, onClose, order }: SalesHistoryResultModalProps) {
    const society = useSocietyStore(state => state.society);
    const [items, setItems] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && order) {
            fetchItems();
        } else {
            setItems([]);
        }
    }, [isOpen, order]);

    const fetchItems = async () => {
        if (!order) return;
        setLoading(true);
        try {
            const response = await orderItemService.getAll({ orderId: order.id });
            if (response.success && response.data) {
                // Handle response structure (response.data.data or simplified array if API changes)
                // The service interface says response.data.data
                setItems(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching order items:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !order) return null;

    const clientName = order.partner?.companyName || `${order.partner?.firstName || ''} ${order.partner?.lastName || ''}`.trim() || 'Cliente General';
    const currencySymbol = order.currency?.symbol || society?.mainCurrency?.symbol || 'S/';

    const subtotal = Number(order.subtotal) || 0;
    const tax = Number(order.taxAmount) || 0;
    const total = Number(order.totalAmount) || 0;
    const discount = Number(order.discount) || 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                            <FileText size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">Detalle de Venta</h2>
                            <p className="text-xs text-slate-500 font-mono">#{order.orderCode}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* Meta Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                <Calendar size={14} />
                                <span>Fecha y Hora</span>
                            </div>
                            <p className="text-sm font-semibold text-slate-700">
                                {order.createdAt ? format(new Date(order.createdAt), 'dd MMMM yyyy, hh:mm a', { locale: es }) : '-'}
                            </p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                <User size={14} />
                                <span>Cliente</span>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-700">{clientName}</p>
                                {order.partner?.documentNumber && <p className="text-xs text-slate-500">{order.partner.documentType}: {order.partner.documentNumber}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Products Table */}
                    <div className="border border-slate-100 rounded-xl overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50/80 border-b border-slate-100">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Producto</th>
                                    <th className="px-4 py-3 text-center font-semibold text-slate-600">Cant.</th>
                                    <th className="px-4 py-3 text-right font-semibold text-slate-600">P. Unit</th>
                                    <th className="px-4 py-3 text-right font-semibold text-slate-600">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                                <span className="text-xs">Cargando detalles...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    items.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-slate-700">{item.product?.name || `Producto #${item.productId}`}</div>
                                                <div className="text-xs text-slate-400 font-mono">{item.product?.code || item.id.slice(0, 8)}</div>
                                            </td>
                                            <td className="px-4 py-3 text-center text-slate-600">{item.quantity}</td>
                                            <td className="px-4 py-3 text-right text-slate-600">
                                                {currencySymbol} {Number(item.unitPrice).toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 text-right font-semibold text-slate-700">
                                                {currencySymbol} {Number(item.total).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                                {!loading && items.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-slate-400 italic">
                                            No hay items registrados o no se cargaron detalles.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals Section */}
                    <div className="flex justify-end">
                        <div className="w-full md:w-1/2 bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                            <div className="flex justify-between text-sm text-slate-500">
                                <span>Subtotal</span>
                                <span>{currencySymbol} {subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-slate-500">
                                <span>IGV (18%)</span>
                                <span>{currencySymbol} {tax.toFixed(2)}</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-sm text-emerald-600 font-medium">
                                    <span>Descuento</span>
                                    <span>- {currencySymbol} {discount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-2 border-t border-slate-200 mt-2">
                                <span className="font-bold text-slate-800">Total Pagado</span>
                                <span className="text-xl font-black text-slate-800">{currencySymbol} {total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        Cerrar
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                        <Printer size={18} />
                        <span>Re-imprimir Ticket</span>
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20">
                        <ShoppingBag size={18} />
                        <span>Reenviar a WhatsApp</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
