import { useState, useEffect } from 'react';
import { ArrowLeft, User, ShoppingBag, FileText, Printer, Mail, Clock, Package } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Order } from '@/services/order.service';
import { useSocietyStore } from '@/store/society.store';
import { orderItemService, type OrderItem } from '@/services/order-item.service';
import { orderService } from '@/services/order.service';
import { Badge } from '@/components/ui/badge';

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
                <p className="text-muted-foreground text-sm">Cargando detalles de la venta...</p>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-6">
                <div className="bg-red-50 p-4 rounded-full mb-4">
                    <FileText className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Error al cargar</h3>
                <p className="text-muted-foreground mb-6 text-sm">{error || "No se encontró la venta solicitada."}</p>
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-6 py-2.5 bg-card border border-border text-foreground font-medium rounded-xl hover:bg-muted transition-colors"
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

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <div className="max-w-[1000px] mx-auto space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-10">
            {/* Header / Nav */}
            <div className="flex items-center justify-between px-2 sm:px-0">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
                >
                    <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
                    <span className="font-bold text-xs sm:text-sm uppercase tracking-wider">Volver</span>
                </button>
                <div className="flex gap-2">
                    <button className="flex items-center justify-center h-10 w-10 sm:w-auto sm:px-4 bg-card border border-border text-foreground rounded-xl hover:bg-muted transition-colors shadow-sm">
                        <Printer size={18} />
                        <span className="hidden sm:inline sm:ml-2 font-bold text-xs uppercase tracking-wider">Imprimir</span>
                    </button>
                    <button className="flex items-center justify-center h-10 w-10 sm:w-auto sm:px-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-600/20">
                        <ShoppingBag size={18} />
                        <span className="hidden sm:inline sm:ml-2 font-bold text-xs uppercase tracking-wider">WhatsApp</span>
                    </button>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-card rounded-2xl sm:rounded-3xl shadow-sm border border-border overflow-hidden mx-2 sm:mx-0">
                {/* Order Status Banner */}
                <div className="bg-muted/30 border-b border-border px-4 sm:px-8 py-4 sm:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 sm:gap-4 font-black">
                        <div className="h-12 w-12 sm:h-14 sm:w-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20 shrink-0">
                            <FileText size={24} className="sm:w-7 sm:h-7" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-lg sm:text-xl font-black text-foreground uppercase tracking-tight truncate">Venta #{order.orderCode}</h1>
                            <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground font-bold uppercase tracking-widest mt-0.5">
                                <Clock size={12} className="sm:w-14 sm:h-14 shrink-0" />
                                <span className="truncate">{order.createdAt ? format(new Date(order.createdAt), 'dd MMMM yyyy, hh:mm a', { locale: es }) : '-'}</span>
                            </div>
                        </div>
                    </div>

                    <Badge variant={order.status === 'COMPLETED' ? 'success' : order.status === 'CANCELLED' ? 'destructive' : 'warning'} className="w-fit h-7 sm:h-8 px-4 text-[10px] sm:text-xs font-black uppercase tracking-widest border border-current/20">
                        {order.status === 'COMPLETED' ? 'Completado' : order.status === 'CANCELLED' ? 'Anulado' : order.status}
                    </Badge>
                </div>

                <div className="p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-10">
                    {/* Left Column: Details */}
                    <div className="lg:col-span-2 space-y-6 sm:space-y-10">

                        {/* Items Section */}
                        <div className="space-y-4">
                            <h3 className="font-black text-foreground flex items-center gap-2 text-xs sm:text-sm uppercase tracking-widest">
                                <Package size={18} className="text-primary/40" />
                                Detalle de Productos
                            </h3>

                            {/* Desktop Table View */}
                            <div className="hidden md:block border border-border/60 rounded-2xl overflow-hidden shadow-sm shadow-slate-200/50">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50 border-b border-border/60">
                                        <tr className="h-10 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                                            <th className="px-6 py-3 text-left">Descripción</th>
                                            <th className="px-4 py-3 text-center">Cant.</th>
                                            <th className="px-4 py-3 text-right">P. Unit</th>
                                            <th className="px-6 py-3 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/40">
                                        {items.map((item, index) => (
                                            <tr key={index} className="hover:bg-muted/10 transition-colors h-14">
                                                <td className="px-6 py-3">
                                                    <div className="font-bold text-foreground text-xs">{item.product?.name || `Producto #${item.productId}`}</div>
                                                    <div className="text-[9px] text-muted-foreground font-bold tracking-wider mt-0.5">CODE: {item.product?.code}</div>
                                                </td>
                                                <td className="px-4 py-3 text-center text-foreground font-black text-xs">{item.quantity}</td>
                                                <td className="px-4 py-3 text-right text-muted-foreground font-bold text-[11px]">
                                                    {currencySymbol} {formatCurrency(Number(item.unitPrice))}
                                                </td>
                                                <td className="px-6 py-3 text-right font-black text-foreground text-xs">
                                                    {currencySymbol} {formatCurrency(Number(item.total))}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card List View */}
                            <div className="md:hidden space-y-3">
                                {items.map((item, index) => (
                                    <div key={index} className="bg-muted/20 p-4 rounded-xl border border-border/80 relative overflow-hidden group">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1 pr-4">
                                                <h4 className="font-black text-[11px] sm:text-xs text-foreground uppercase tracking-tight">{item.product?.name || `Producto #${item.productId}`}</h4>
                                                <p className="text-[9px] font-bold text-muted-foreground tracking-widest mt-0.5">{item.product?.code}</p>
                                            </div>
                                            <div className="bg-primary/5 border border-primary/20 px-2 py-1 rounded-lg">
                                                <span className="text-[10px] font-black text-primary">x{item.quantity}</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-end pt-3 border-t border-border/40">
                                            <div>
                                                <p className="text-[8px] font-black text-muted-foreground uppercase opacity-60">Precio Unitario</p>
                                                <p className="text-[11px] font-bold text-foreground">{currencySymbol} {formatCurrency(Number(item.unitPrice))}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[8px] font-black text-primary uppercase">Subtotal Item</p>
                                                <p className="text-xs font-black text-foreground">{currencySymbol} {formatCurrency(Number(item.total))}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Payment Info */}
                        {order.OrderPayment && order.OrderPayment.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="font-black text-foreground flex items-center gap-2 text-xs sm:text-sm uppercase tracking-widest">
                                    <FileText size={18} className="text-primary/40" />
                                    Historial de Pagos
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    {order.OrderPayment.map((payment, idx) => (
                                        <div key={idx} className="bg-muted/10 p-4 rounded-2xl border border-border group hover:border-primary/20 transition-all">
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="text-[9px] font-black text-primary uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-md border border-primary/10">
                                                    {payment.paymentMethod}
                                                </span>
                                                <span className="text-[9px] font-bold text-muted-foreground/60">{payment.createdAt ? format(new Date(payment.createdAt), 'dd/MM/yy HH:mm') : '-'}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase">Monto</span>
                                                <p className="font-black text-foreground text-sm">{currencySymbol} {formatCurrency(Number(payment.amount))}</p>
                                            </div>
                                            {payment.referenceCode && (
                                                <div className="mt-2 pt-2 border-t border-border/50 text-[10px] font-bold text-muted-foreground tracking-tight">
                                                    REF: {payment.referenceCode}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Summary & Client */}
                    <div className="space-y-6 sm:space-y-8">
                        {/* Client Card */}
                        <div className="bg-muted/10 p-5 sm:p-6 rounded-2xl border border-border">
                            <h3 className="font-black text-foreground mb-4 flex items-center gap-2 text-xs sm:text-[13px] uppercase tracking-widest">
                                <User size={18} className="text-primary/30" />
                                Ficha del Cliente
                            </h3>
                            <div className="space-y-3">
                                <div className="bg-background p-3 rounded-xl border border-border/60">
                                    <p className="font-black text-foreground text-xs uppercase tracking-tight leading-tight">{clientName}</p>
                                    {order.partner?.documentNumber && (
                                        <div className="flex items-center gap-2 mt-1.5 opacity-60">
                                            <Badge variant="secondary" className="text-[8px] h-4 font-black px-1.5 uppercase">{order.partner.documentType}</Badge>
                                            <span className="text-[10px] text-foreground font-mono font-bold tracking-tighter">{order.partner.documentNumber}</span>
                                        </div>
                                    )}
                                </div>

                                {order.partner?.email && (
                                    <div className="flex items-center gap-2.5 text-xs text-muted-foreground font-bold px-1 truncate">
                                        <Mail size={14} className="text-primary/40" />
                                        <span className="truncate">{order.partner.email}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="bg-card p-6 sm:p-7 rounded-2xl border border-primary/20 shadow-lg shadow-slate-200/50">
                            <h3 className="font-black text-foreground mb-6 text-xs sm:text-[13px] uppercase tracking-widest text-center border-b border-border pb-3">Resumen de Venta</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">
                                    <span>Base Imponible</span>
                                    <span className="text-foreground">{currencySymbol} {formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">
                                    <span>IGV (18%)</span>
                                    <span className="text-foreground">{currencySymbol} {formatCurrency(tax)}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between items-center text-[11px] text-emerald-600 font-black uppercase tracking-wider bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                                        <span>Descuento</span>
                                        <span>- {currencySymbol} {formatCurrency(discount)}</span>
                                    </div>
                                )}

                                <div className="pt-5 mt-5 border-t-2 border-dashed border-border">
                                    <div className="flex flex-col items-center">
                                        <span className="font-black text-primary text-[10px] uppercase tracking-[0.2em] mb-1">Total a Pagar</span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-sm font-bold text-foreground/40">{currencySymbol}</span>
                                            <span className="text-3xl font-black text-foreground tabular-nums tracking-tighter">{formatCurrency(total)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {order.notes && (
                            <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-200 text-amber-900 shadow-sm shadow-amber-100">
                                <p className="font-black text-[10px] uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                    Notas de Venta
                                </p>
                                <p className="text-xs font-medium leading-relaxed italic">{order.notes}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
