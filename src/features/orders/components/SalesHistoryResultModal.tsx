import { useState, useEffect, useCallback } from 'react';
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

    const fetchItems = useCallback(async () => {
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
    }, [order]);

    useEffect(() => {
        if (isOpen && order) {
            fetchItems();
        } else {
            setItems([]);
        }
    }, [isOpen, order, fetchItems]);

    if (!isOpen || !order) return null;

    const clientName = order.partner?.companyName || `${order.partner?.firstName || ''} ${order.partner?.lastName || ''}`.trim() || 'Cliente General';
    const currencySymbol = order.currency?.symbol || society?.mainCurrency?.symbol || 'S/';

    const subtotal = Number(order.subtotal) || 0;
    const tax = Number(order.taxAmount) || 0;
    const total = Number(order.totalAmount) || 0;
    const discount = Number(order.discount) || 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card border border-border rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border bg-muted/30">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-2xl text-primary ring-1 ring-primary/20">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-foreground tracking-tight uppercase">Detalle de Venta</h2>
                            <p className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded mt-1 inline-block">#{order.orderCode}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all active:scale-95"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

                    {/* Meta Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-muted/20 p-5 rounded-2xl border border-border space-y-3">
                            <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                <Calendar size={14} className="text-primary" />
                                <span>Fecha y Hora</span>
                            </div>
                            <p className="text-sm font-bold text-foreground">
                                {order.createdAt ? format(new Date(order.createdAt), 'dd MMMM yyyy, hh:mm a', { locale: es }) : '-'}
                            </p>
                        </div>
                        <div className="bg-muted/20 p-5 rounded-2xl border border-border space-y-3">
                            <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                <User size={14} className="text-primary" />
                                <span>Cliente</span>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-foreground">{clientName}</p>
                                {order.partner?.documentNumber && <p className="text-xs text-muted-foreground mt-0.5">{order.partner.documentType}: {order.partner.documentNumber}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Products Table */}
                    <div className="border border-border rounded-2xl overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/30 border-b border-border">
                                <tr>
                                    <th className="px-5 py-4 text-left font-black text-xs text-muted-foreground uppercase tracking-widest">Producto</th>
                                    <th className="px-5 py-4 text-center font-black text-xs text-muted-foreground uppercase tracking-widest">Cant.</th>
                                    <th className="px-5 py-4 text-right font-black text-xs text-muted-foreground uppercase tracking-widest">P. Unit</th>
                                    <th className="px-5 py-4 text-right font-black text-xs text-muted-foreground uppercase tracking-widest">Desc.</th>
                                    <th className="px-5 py-4 text-right font-black text-xs text-muted-foreground uppercase tracking-widest">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-10 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                                <span className="text-xs font-bold uppercase tracking-widest">Cargando detalles...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    items.map((item, index) => (
                                        <tr key={index} className="hover:bg-muted/10 transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="font-bold text-foreground">{item.product?.name || `Producto #${item.productId}`}</div>
                                                <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{item.product?.code || item.id.slice(0, 8)}</div>
                                            </td>
                                            <td className="px-5 py-4 text-center text-foreground font-medium">{item.quantity}</td>
                                            <td className="px-5 py-4 text-right text-muted-foreground">
                                                {currencySymbol} {Number(item.unitPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-5 py-4 text-right text-emerald-600 font-bold">
                                                {Number(item.discount) > 0 ? `- ${currencySymbol} ${Number(item.discount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                                            </td>
                                            <td className="px-5 py-4 text-right font-black text-foreground">
                                                {currencySymbol} {Number(item.total).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))
                                )}
                                {!loading && items.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-10 text-center text-muted-foreground italic font-medium">
                                            No hay items registrados o no se cargaron detalles.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals Section */}
                    <div className="flex justify-end">
                        <div className="w-full md:w-3/5 bg-muted/20 p-5 rounded-2xl border border-border space-y-3">
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span className="font-medium">Subtotal</span>
                                <span className="font-bold text-foreground">{currencySymbol} {subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span className="font-medium">IGV (18%)</span>
                                <span className="font-bold text-foreground">{currencySymbol} {tax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-sm text-emerald-500 font-bold border-t border-emerald-500/10 pt-2">
                                    <span>Descuento</span>
                                    <span>- {currencySymbol} {discount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-3 border-t-2 border-border mt-3">
                                <span className="font-black text-foreground uppercase tracking-tight text-base">Total Pagado</span>
                                <span className="text-2xl font-black text-foreground tracking-tighter">{currencySymbol} {total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-border bg-muted/20 flex flex-col sm:flex-row justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-card border border-border text-foreground font-bold rounded-xl hover:bg-muted transition-all active:scale-95 shadow-sm"
                    >
                        Cerrar
                    </button>
                    <button className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-black rounded-xl hover:bg-primary-hover transition-all active:scale-95 shadow-lg shadow-primary/20 uppercase text-xs tracking-widest">
                        <Printer size={18} />
                        <span>Re-imprimir Ticket</span>
                    </button>
                    <button className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-600/20 uppercase text-xs tracking-widest">
                        <ShoppingBag size={18} />
                        <span>WhatsApp</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
