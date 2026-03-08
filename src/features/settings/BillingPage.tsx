import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSocietyStore } from '@/store/society.store';
import { societyService } from '@/services/society.service';
import { subscriptionService, type SubscriptionDetails } from '@/services/subscription.service';
import {
    CreditCard,
    RefreshCw,
    XCircle,
    Rocket,
    AlertCircle,
    CalendarDays,
    AlertTriangle,
    RotateCcw,
    UploadCloud,
    Clock,
    Building2,
    QrCode,
    Copy,
    Home,
    ClipboardCheck
} from 'lucide-react';
import { Card } from '@/components/ui';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

export default function BillingPage() {
    const { society } = useSocietyStore();
    const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [updatingRenew, setUpdatingRenew] = useState(false);
    const [isRenewing, setIsRenewing] = useState(false);
    const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
    const [renewPaymentMethod, setRenewPaymentMethod] = useState('TRANSFER');
    const [renewReferenceCode, setRenewReferenceCode] = useState('');
    const [renewFile, setRenewFile] = useState<File | null>(null);

    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [submittedReferenceCode, setSubmittedReferenceCode] = useState('');

    const [isReactivating, setIsReactivating] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [error, setError] = useState<string | null>(null);

    const [activeTab, setActiveTab] = useState<'history' | 'billing'>('history');

    // React Query for History
    const { data: history = [], isLoading: loadingHistory } = useQuery({
        queryKey: ['subscriptionHistory', society?.subscriptionId],
        queryFn: () => subscriptionService.getSubscriptionHistory(society!.subscriptionId!),
        enabled: !!society?.subscriptionId && !!subscription,
    });

    // React Query for Billing (Lazy loaded when activeTab === 'billing')
    const { data: billingHistory = [], isLoading: loadingBilling } = useQuery({
        queryKey: ['subscriptionBilling', society?.subscriptionId],
        queryFn: () => subscriptionService.getSubscriptionBilling(society!.subscriptionId!),
        enabled: !!society?.subscriptionId && !!subscription && activeTab === 'billing',
    });

    const currentUsers = society?.totalUsers || 0;
    const currentProducts = society?.totalProducts || 0;
    const currentStorageBytes = society?.usedStorage || 0;

    const formatSize = (bytes: any) => {
        const numBytes = Number(bytes);
        if (isNaN(numBytes) || numBytes <= 0) return '0 GB';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.max(0, Math.floor(Math.log(numBytes) / Math.log(k)));
        const safeIndex = Math.min(i, sizes.length - 1);
        return parseFloat((numBytes / Math.pow(k, safeIndex)).toFixed(2)) + ' ' + sizes[safeIndex];
    };

    const currentStorageStr = formatSize(currentStorageBytes);

    useEffect(() => {
        const fetchSubscription = async () => {
            if (!society?.subscriptionId) return; // Don't fetch if no ID is available

            try {
                setLoading(true);
                const response = await subscriptionService.getSubscriptionDetails(society.subscriptionId);
                if (response && response.id) {
                    setSubscription(response);
                } else {
                    setError('No se pudo cargar la información de la suscripción.');
                }
            } catch (err: any) {
                setError(err.message || 'Error al cargar la suscripción.');
            } finally {
                setLoading(false);
            }
        };

        fetchSubscription();
    }, [society?.subscriptionId]);

    // Fetch current society on mount to ensure usage metrics (totalUsers, totalProducts, usedStorage) are up to date
    useEffect(() => {
        societyService.getCurrent().catch((err) => {
            console.error('Error fetching latest society usage data:', err);
        });
    }, []);

    const handleToggleAutoRenew = async () => {
        if (!subscription || !society?.subscriptionId) return;
        try {
            setUpdatingRenew(true);
            const newStatus = !subscription.autoRenew;
            const updated = await subscriptionService.updateAutoRenew(society.subscriptionId, newStatus);
            setSubscription({ ...subscription, autoRenew: updated.autoRenew });
        } catch (err: any) {
            console.error('Error al actualizar la renovación automática:', err);
            // Optional: Mostrar algún toast de error aquí si el equipo maneja notificaciones globales
        } finally {
            setUpdatingRenew(false);
        }
    };

    const handleRenewSubscription = () => {
        setIsRenewModalOpen(true);
    };

    const confirmRenewSubscription = async () => {
        if (!subscription || !society?.subscriptionId || !renewFile || !renewReferenceCode) return;
        try {
            setIsRenewing(true);
            const response = await subscriptionService.renewSubscription(society.subscriptionId, {
                paymentMethod: renewPaymentMethod,
                referenceCode: renewReferenceCode,
                file: renewFile
            });
            if (response && response.status === 'PENDING') {
                setSubscription({
                    ...subscription,
                    hasPendingPayment: true
                });
                setSubmittedReferenceCode(renewReferenceCode);
                setIsRenewModalOpen(false);
                setIsSuccessModalOpen(true);
                setRenewFile(null);
                setRenewReferenceCode('');
            }
        } catch (err: any) {
            console.error('Error al renovar la suscripción:', err);
        } finally {
            setIsRenewing(false);
        }
    };

    const handleReactivateSubscription = async () => {
        if (!subscription || !society?.subscriptionId) return;
        try {
            setIsReactivating(true);
            const response = await subscriptionService.reactivateSubscription(society.subscriptionId);
            if (response && response.status) {
                setSubscription({
                    ...subscription,
                    status: response.status,
                    isActive: response.isActive,
                    autoRenew: response.autoRenew,
                    endDate: response.endDate
                });
            }
        } catch (err: any) {
            console.error('Error al reactivar la suscripción:', err);
        } finally {
            setIsReactivating(false);
        }
    };

    const handleCancelSubscription = async () => {
        if (!subscription || !society?.subscriptionId) return;
        try {
            setIsCancelling(true);
            const response = await subscriptionService.cancelSubscription(society.subscriptionId, cancelReason);
            // According to user, returns { id, status: 'INACTIVE', isActive: false, endDate }
            if (response) {
                setSubscription({
                    ...subscription,
                    status: response.status,
                    isActive: response.isActive,
                    endDate: response.endDate
                });
                setIsCancelModalOpen(false);
                setCancelReason('');
            }
        } catch (err: any) {
            console.error('Error al cancelar la suscripción:', err);
        } finally {
            setIsCancelling(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-full min-h-[60vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
            </div>
        );
    }

    if (error || !subscription) {
        return (
            <div className="p-8 max-w-5xl mx-auto flex flex-col items-center justify-center text-center">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <h2 className="text-lg font-bold text-foreground mb-2">Error</h2>
                <p className="text-muted-foreground text-sm">{error || 'No se encontró una suscripción activa.'}</p>
            </div>
        );
    }

    const isFree = subscription.plan.price === 0;
    const isBeta = subscription.isPublicReview;
    const mostrarBotonRenovacion =
        subscription.isNearingExpiration &&
        !subscription.hasPendingPayment &&
        !isBeta;

    const userPercent = Math.min(100, (Number(currentUsers) / (society?.maxUsers || subscription.plan.maxUsers || 1)) * 100) || 0;
    const productPercent = Math.min(100, (Number(currentProducts) / (society?.maxProducts || subscription.plan.maxProducts || 1)) * 100) || 0;

    const planStorageBytes = (subscription.plan.storage || 1) * 1024 * 1024 * 1024;
    const storagePercent = Math.min(100, Math.max(0, (Number(currentStorageBytes) / planStorageBytes) * 100)) || 0;

    return (
        <div className="flex-1 w-full bg-background min-h-[calc(100vh-4rem)] p-4 md:p-8 space-y-6">
            {/* Header */}
            <div className="max-w-6xl mx-auto space-y-1">
                <h1 className="text-lg font-bold text-foreground tracking-tight uppercase">Suscripción y Facturación</h1>
                {isBeta && (
                    <p className="text-muted-foreground text-xs">
                        Acceso exclusivo durante la fase de Public Preview.
                    </p>
                )}
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Plan Card */}
                <div className="lg:col-span-2">
                    <Card className="border-border shadow-sm h-full overflow-hidden">
                        <div className="p-6 space-y-8">
                            {/* Card Header & Badge */}
                            <div className="flex justify-between items-start">
                                <h2 className="text-sm font-bold text-foreground tracking-tight uppercase">Plan Actual</h2>
                                <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-100">
                                    {subscription.plan.name} {isBeta && '(PUBLIC PREVIEW)'}
                                </div>
                            </div>

                            {/* Price & Status */}
                            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
                                <div className="space-y-1">
                                    <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Costo Mensual</span>
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-4xl font-extrabold text-foreground">
                                            {isFree ? 'Gratis' : `$${subscription.plan.price} `}
                                        </span>
                                        {isBeta && (
                                            <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-xs font-semibold">
                                                Precio Beta
                                            </span>
                                        )}
                                    </div>
                                    {isBeta && (
                                        <p className="text-xs text-slate-500 mt-2">
                                            Costo por definir tras el lanzamiento comercial.
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1 md:text-right">
                                    <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground block mb-1">Estado</span>
                                    {!subscription.isActive || subscription.status === 'INACTIVE' ? (
                                        <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1 rounded-full border border-amber-100 font-medium text-sm">
                                            <div className="h-2 w-2 rounded-full bg-amber-500" />
                                            Acceso disponible hasta el {new Date(subscription.endDate).toLocaleDateString()}
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100 font-medium text-sm">
                                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                            {isBeta ? 'Fase Beta Activa' : 'Activa'}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Usage Progress */}
                            <div className="flex flex-col gap-5 pt-6 border-t border-border">
                                {/* Users Progress */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <span className="font-bold text-foreground text-xs uppercase tracking-wider">Usuarios</span>
                                        <div className="text-right">
                                            <span className="text-sm font-bold text-foreground">{currentUsers}</span>
                                            <span className="text-xs font-medium text-muted-foreground ml-1">
                                                / {society?.maxUsers || subscription.plan.maxUsers}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-sky-500 rounded-full transition-all duration-500"
                                            style={{ width: `${userPercent}%` }}
                                        />
                                    </div>
                                    <p className="text-[11px] text-muted-foreground italic">
                                        {(society?.maxUsers || subscription.plan.maxUsers) - currentUsers} espacios disponibles
                                    </p>
                                </div>

                                {/* Products Progress */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <span className="font-bold text-foreground text-xs uppercase tracking-wider">Productos</span>
                                        <div className="text-right">
                                            <span className="text-sm font-bold text-foreground">{currentProducts.toLocaleString()}</span>
                                            <span className="text-xs font-medium text-muted-foreground ml-1">
                                                / {(society?.maxProducts || subscription.plan.maxProducts).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-sky-500 rounded-full transition-all duration-500"
                                            style={{ width: `${productPercent}%` }}
                                        />
                                    </div>
                                    <p className="text-[11px] text-muted-foreground italic">
                                        {Math.round(productPercent)}% de la capacidad utilizada
                                    </p>
                                </div>

                                {/* Storage Progress */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <span className="font-bold text-foreground text-xs uppercase tracking-wider">Almacenamiento</span>
                                        <div className="text-right">
                                            <span className="text-sm font-bold text-foreground">{currentStorageStr}</span>
                                            <span className="text-xs font-medium text-muted-foreground ml-1">
                                                / {subscription.plan.storage} GB
                                            </span>
                                        </div>
                                    </div>
                                    <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-sky-500 rounded-full transition-all duration-500"
                                            style={{ width: `${storagePercent}%` }}
                                        />
                                    </div>
                                    <p className="text-[11px] text-muted-foreground italic">
                                        {storagePercent > 0 && storagePercent < 1 ? '< 1' : Math.round(storagePercent)}% del espacio total utilizado
                                    </p>
                                </div>
                            </div>

                            {/* Auto Renew Panel */}
                            <div className="bg-muted/20 rounded-xl p-4 flex items-center justify-between border border-border">
                                <div className="flex gap-4 items-center">
                                    <div className="p-2 bg-card rounded-lg shadow-sm border border-border text-muted-foreground">
                                        <RefreshCw className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-bold text-foreground uppercase">Renovación automática</h3>
                                        <p className="text-[10px] text-muted-foreground mt-1 max-w-[90%]">
                                            {(!subscription.isActive || subscription.status === 'INACTIVE')
                                                ? 'Desactivada tras la cancelación'
                                                : (subscription.autoRenew
                                                    ? (isFree ? 'Renueva automáticamente tu acceso gratuito mes a mes' : 'Tu tarjeta será cargada al final del ciclo')
                                                    : 'Cobro automático desactivado. Deberá renovar manualmente al finalizar el periodo.'
                                                )
                                            }
                                        </p>
                                    </div>
                                </div>
                                {/* Custom Toggle Switch for design */}
                                <label className={`relative inline-flex items-center ${updatingRenew || !subscription.isActive ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={subscription.autoRenew && subscription.isActive}
                                        onChange={handleToggleAutoRenew}
                                        disabled={updatingRenew || !subscription.isActive}
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                                </label>
                            </div>

                            {/* Action Buttons */}
                            {subscription.status === 'INACTIVE' ? (
                                <div className="flex flex-col sm:flex-row items-center gap-4 pt-5 border-t border-border">
                                    <button
                                        className={`flex items-center gap-2 px-6 py-2.5 border border-sky-200 text-sky-600 hover:bg-sky-50 rounded-lg text-sm font-semibold transition-colors w-full sm:w-auto justify-center whitespace-nowrap ${isReactivating ? 'opacity-70 cursor-not-allowed' : ''}`}
                                        onClick={handleReactivateSubscription}
                                        disabled={isReactivating}
                                    >
                                        {isReactivating ? (
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-600 border-t-transparent" />
                                        ) : (
                                            <RotateCcw className="h-4 w-4" />
                                        )}
                                        {isReactivating ? 'Reactivando...' : 'Reactivar suscripción'}
                                    </button>
                                    <div className="text-xs text-muted-foreground italic text-center sm:text-left leading-relaxed">
                                        Tu suscripción ha sido cancelada o ha estado inactiva por más de 7 días. Reactívala para mantener tu información.
                                    </div>
                                </div>
                            ) : subscription.status === 'EXPIRED' ? (
                                <div className="flex flex-col sm:flex-row items-center gap-4 pt-5 border-t border-border">
                                    {subscription.hasPendingPayment ? (
                                        <button
                                            disabled
                                            className="flex items-center gap-2 px-6 py-2.5 bg-amber-100 text-amber-700 rounded-lg text-sm font-semibold transition-colors w-full sm:w-auto justify-center whitespace-nowrap cursor-not-allowed"
                                        >
                                            <Clock className="h-4 w-4" />
                                            Renovación en progreso
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleRenewSubscription}
                                            className="flex items-center gap-2 px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-colors w-full sm:w-auto justify-center whitespace-nowrap shadow-md animate-pulse"
                                        >
                                            <AlertTriangle className="h-4 w-4" />
                                            Renovar Ahora
                                        </button>
                                    )}
                                    <div className="text-xs text-red-500 font-medium text-center sm:text-left leading-relaxed">
                                        {subscription.hasPendingPayment
                                            ? 'Su comprobante de pago está siendo validado. Su cuenta permanecerá bloqueada hasta su aprobación.'
                                            : 'Su suscripción ha expirado. Por favor, realice su pago y suba el comprobante para desbloquear su cuenta.'
                                        }
                                    </div>
                                </div>
                            ) : subscription.autoRenew ? (
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-border">
                                    <button
                                        onClick={() => setIsCancelModalOpen(true)}
                                        className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors w-full sm:w-auto justify-center"
                                    >
                                        <XCircle className="h-4 w-4" />
                                        Cancelar suscripción
                                    </button>
                                    <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
                                        <span className="text-xs text-muted-foreground italic hidden sm:inline-block">Nuevos planes llegarán pronto</span>
                                        <button className="flex items-center gap-2 px-6 py-2 border border-border text-muted-foreground hover:bg-muted rounded-lg text-sm font-medium transition-colors w-full sm:w-auto justify-center" disabled>
                                            <Rocket className="h-4 w-4" />
                                            Próximamente
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col sm:flex-row items-center gap-4 pt-5 border-t border-border">
                                    {subscription.hasPendingPayment && (
                                        <button
                                            disabled
                                            className="flex items-center gap-2 px-6 py-2.5 bg-amber-100 text-amber-700 rounded-lg text-sm font-semibold transition-colors w-full sm:w-auto justify-center whitespace-nowrap cursor-not-allowed"
                                        >
                                            <Clock className="h-4 w-4" />
                                            Renovación en progreso
                                        </button>
                                    )}
                                    {mostrarBotonRenovacion && (
                                        <button
                                            onClick={handleRenewSubscription}
                                            className="flex items-center gap-2 px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-sm font-semibold transition-colors w-full sm:w-auto justify-center whitespace-nowrap"
                                        >
                                            <CalendarDays className="h-4 w-4" />
                                            Renovar suscripción
                                        </button>
                                    )}
                                    <div className="text-xs text-muted-foreground italic text-center sm:text-left leading-relaxed">
                                        {subscription.hasPendingPayment
                                            ? 'Su comprobante de pago está siendo validado por los administradores.'
                                            : `Su acceso continuará hasta el ${new Date(subscription.endDate).toLocaleDateString()}. Puede renovar su plan en cualquier momento para evitar interrupciones.`
                                        }
                                    </div>
                                </div>
                            )}

                        </div>
                    </Card>
                </div>

                {/* Payment Method Card */}
                <div>
                    <Card className="border-border shadow-sm flex flex-col overflow-hidden h-fit">
                        <div className="p-6 pb-3 border-b border-border">
                            <h3 className="text-sm font-bold text-foreground tracking-tight uppercase">Método de Pago</h3>
                        </div>
                        <div className="p-6">
                            <div className="w-full border-2 border-dashed border-border rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4">
                                <div className="h-12 w-12 bg-muted/50 rounded-full flex items-center justify-center text-muted-foreground">
                                    <CreditCard className="h-6 w-6" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-foreground text-[11px] uppercase tracking-wider">Sin pagos requeridos</h3>
                                    <p className="text-[11px] text-muted-foreground max-w-[180px] leading-relaxed italic">
                                        Disfruta de la plataforma sin cargos durante la fase beta pública.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Tabs Section for History */}
            <div className="max-w-6xl mx-auto pt-4">
                <Card className="border-border shadow-sm overflow-hidden">
                    {/* Custom Tabs Header */}
                    <div className="flex border-b border-border px-6 pt-2">
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`px-4 py-3 text-xs font-bold inline-flex items-center gap-2 uppercase tracking-wider ${activeTab === 'history' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground transition-colors'}`}
                        >
                            Historial de Suscripciones
                        </button>
                        <button
                            onClick={() => setActiveTab('billing')}
                            className={`px-4 py-3 text-xs font-bold inline-flex items-center gap-2 uppercase tracking-wider ${activeTab === 'billing' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground transition-colors'}`}
                        >
                            Historial de Facturación
                        </button>
                    </div>

                    <div className="p-0 overflow-x-auto">
                        {activeTab === 'history' ? (
                            <table className="w-full text-sm text-left">
                                <thead className="text-[10px] text-muted-foreground uppercase bg-muted/30">
                                    <tr>
                                        <th className="px-6 py-4 font-bold tracking-wider">Plan</th>
                                        <th className="px-6 py-4 font-bold tracking-wider">Fecha de Inicio</th>
                                        <th className="px-6 py-4 font-bold tracking-wider">Fecha de Fin</th>
                                        <th className="px-6 py-4 font-bold tracking-wider text-right">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {loadingHistory ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                                                <div className="flex justify-center items-center gap-2">
                                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
                                                    Cargando historial...
                                                </div>
                                            </td>
                                        </tr>
                                    ) : history.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                                                No hay movimientos registrados.
                                            </td>
                                        </tr>
                                    ) : (
                                        history.map((movement) => (
                                            <tr key={movement.id} className="hover:bg-muted/20 transition-colors">
                                                <td className="px-6 py-4 font-bold text-foreground text-xs">
                                                    {movement.newPlan?.name || 'Desconocido'} {movement.newPlan?.code === 'PRO' && '(Public Preview)'}
                                                </td>
                                                <td className="px-6 py-4 text-muted-foreground text-xs capitalize">
                                                    {new Date(movement.movementDate).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                                                </td>
                                                <td className="px-6 py-4 text-muted-foreground text-xs">
                                                    {movement.newEndDate ? new Date(movement.newEndDate).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }) : '-'}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {movement.movementType === 'SUBSCRIBED' && <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md text-xs font-medium">Suscrito</span>}
                                                    {movement.movementType === 'RENEWAL' && <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-medium">Renovación</span>}
                                                    {movement.movementType === 'REACTIVATED' && <span className="inline-flex items-center gap-1.5 bg-sky-50 text-sky-700 px-2.5 py-1 rounded-md text-xs font-medium">Reactivado</span>}
                                                    {movement.movementType === 'CANCELED' && <span className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-700 px-2.5 py-1 rounded-md text-xs font-medium">Cancelado</span>}
                                                    {movement.movementType === 'UPGRADE' && <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md text-xs font-medium">Upgrade</span>}
                                                    {movement.movementType === 'DOWNGRADE' && <span className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-700 px-2.5 py-1 rounded-md text-xs font-medium">Downgrade</span>}
                                                    {!['SUBSCRIBED', 'RENEWAL', 'REACTIVATED', 'CANCELED', 'UPGRADE', 'DOWNGRADE'].includes(movement.movementType) && (
                                                        <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-xs font-medium">{movement.movementType}</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        ) : (
                            <table className="w-full text-sm text-left">
                                <thead className="text-[10px] text-muted-foreground uppercase bg-muted/30">
                                    <tr>
                                        <th className="px-6 py-4 font-bold tracking-wider">Descripción</th>
                                        <th className="px-6 py-4 font-bold tracking-wider">Fecha</th>
                                        <th className="px-6 py-4 font-bold tracking-wider">Método</th>
                                        <th className="px-6 py-4 font-bold tracking-wider text-right">Monto</th>
                                        <th className="px-6 py-4 font-bold tracking-wider text-right">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {loadingBilling ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                                <div className="flex justify-center items-center gap-2">
                                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
                                                    Cargando facturación...
                                                </div>
                                            </td>
                                        </tr>
                                    ) : billingHistory.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                                No hay pagos registrados.
                                            </td>
                                        </tr>
                                    ) : (
                                        billingHistory.map((billing) => (
                                            <tr key={billing.id} className="hover:bg-muted/20 transition-colors">
                                                <td className="px-6 py-4 font-bold text-foreground text-xs">
                                                    {billing.description}
                                                    {billing.subscriptionMovement && (
                                                        <span className="ml-2 text-[10px] text-muted-foreground">
                                                            ({billing.subscriptionMovement.newPlan?.name})
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-muted-foreground text-xs capitalize">
                                                    {new Date(billing.paymentDate).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </td>
                                                <td className="px-6 py-4 text-muted-foreground">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-muted text-foreground">
                                                        <CreditCard className="h-3 w-3" />
                                                        {billing.paymentMethod}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-foreground text-xs">
                                                    ${billing.amount.toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {billing.status === 'COMPLETED' ? (
                                                        <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md text-xs font-medium">Pagado</span>
                                                    ) : billing.status === 'PENDING' ? (
                                                        <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-md text-xs font-medium">Pendiente</span>
                                                    ) : billing.status === 'FAILED' ? (
                                                        <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 px-2.5 py-1 rounded-md text-xs font-medium">Fallido</span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-xs font-medium">{billing.status}</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </Card>
            </div>

            {/* Cancel Subscription Modal */}
            <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
                <DialogContent className="sm:max-w-md p-6 text-center border-0 shadow-2xl !rounded-xl [&>button]:hidden">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 mb-4 mt-2">
                        <AlertTriangle className="h-6 w-6 text-[#E5534B]" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-3">
                        ¿Estás seguro de que deseas cancelar?
                    </h3>
                    <p className="text-xs text-muted-foreground mb-6 leading-relaxed px-2">
                        Al cancelar, perderás el acceso a las funcionalidades del plan {subscription?.plan?.name} {isBeta && '(Public Preview)'} al finalizar tu ciclo actual. No te preocupes, tus datos de inventario se mantendrán guardados.
                    </p>
                    <div className="text-left mb-6">
                        <label className="text-xs font-bold text-foreground mb-2 block">
                            Motivo de la cancelación (Opcional)
                        </label>
                        <Textarea
                            placeholder="Cuéntanos por qué te vas..."
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            className="resize-none"
                            rows={3}
                        />
                    </div>
                    <div className="flex flex-col gap-3 mb-2">
                        <button
                            className={`w-full bg-[#E5534B] hover:bg-[#D6453E] text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 ${isCancelling ? 'opacity-70 cursor-not-allowed' : ''}`}
                            onClick={handleCancelSubscription}
                            disabled={isCancelling}
                        >
                            {isCancelling && <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                            Confirmar Cancelación
                        </button>
                        <button
                            onClick={() => setIsCancelModalOpen(false)}
                            disabled={isCancelling}
                            className="w-full border border-border text-muted-foreground font-bold py-2.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-50 text-xs uppercase"
                        >
                            Mantener mi plan
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
            {/* Renew Subscription Modal */}
            <Dialog open={isRenewModalOpen} onOpenChange={setIsRenewModalOpen}>
                <DialogContent className="sm:max-w-3xl p-0 border-0 shadow-2xl !rounded-xl overflow-hidden [&>button]:hidden">
                    {/* Header */}
                    <div className="flex justify-between items-center p-6 border-b border-border bg-card">
                        <h3 className="text-lg font-bold text-foreground">Renovar Suscripción</h3>
                        <button
                            onClick={() => setIsRenewModalOpen(false)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <XCircle className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 overflow-y-auto max-h-[85vh] bg-card">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            {/* Left Column */}
                            <div className="space-y-8">
                                {/* Resumen */}
                                <div>
                                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Resumen de Renovación</h4>
                                    <div className="bg-muted/20 rounded-xl p-5 border border-border">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-xs text-muted-foreground">Plan</span>
                                            <span className="text-xs font-bold text-foreground">{subscription?.plan?.name}</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-5">
                                            <span className="text-xs text-muted-foreground">Periodo</span>
                                            <span className="text-xs font-medium text-foreground">
                                                {subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''} - {subscription?.endDate ? new Date(new Date(subscription.endDate).setMonth(new Date(subscription.endDate).getMonth() + 1)).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}
                                            </span>
                                        </div>
                                        <div className="pt-4 border-t border-border/60 flex justify-between items-end">
                                            <span className="text-sm font-bold text-foreground">Total</span>
                                            <div className="text-right">
                                                <span className="text-xl font-bold text-sky-500">
                                                    {isFree ? 'S/ 0.00' : `$${subscription?.plan?.price?.toFixed(2) || '0.00'}`}
                                                </span>
                                                {isBeta && <p className="text-[10px] text-sky-500 font-medium">(Fase Public Preview)</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Opciones de pago */}
                                <div>
                                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Seleccionar Método de Pago</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setRenewPaymentMethod('TRANSFER')}
                                            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${renewPaymentMethod === 'TRANSFER' ? 'border-primary bg-primary/5 text-primary shadow-sm' : 'border-border bg-card text-muted-foreground hover:border-border/80'}`}
                                        >
                                            <Building2 className={`h-6 w-6 ${renewPaymentMethod === 'TRANSFER' ? 'text-primary' : 'text-muted-foreground'}`} />
                                            <span className="text-xs font-bold uppercase">Transferencia</span>
                                        </button>
                                        <button
                                            onClick={() => setRenewPaymentMethod('YAPE')}
                                            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${renewPaymentMethod === 'YAPE' ? 'border-primary bg-primary/5 text-primary shadow-sm' : 'border-border bg-card text-muted-foreground hover:border-border/80'}`}
                                        >
                                            <QrCode className={`h-6 w-6 ${renewPaymentMethod === 'YAPE' ? 'text-primary' : 'text-muted-foreground'}`} />
                                            <span className="text-xs font-bold uppercase">Yape / Plin</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div>
                                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Datos de Depósito</h4>
                                <div className="border border-border bg-card rounded-xl p-6 shadow-sm h-full min-h-[250px] flex flex-col justify-center">
                                    {renewPaymentMethod === 'TRANSFER' ? (
                                        <div className="space-y-6">
                                            <div>
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Banco</span>
                                                <p className="text-xs font-bold text-foreground">BCP (Banco de Crédito)</p>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Número de Cuenta</span>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs font-medium text-foreground font-mono">193-98765432-0-12</p>
                                                    <button
                                                        onClick={() => navigator.clipboard.writeText('193-98765432-0-12')}
                                                        className="text-sky-500 hover:text-sky-600 p-1 rounded hover:bg-sky-50 transition-colors"
                                                        title="Copiar número de cuenta"
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">CCI (Interbancario)</span>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs font-medium text-foreground font-mono">002-1939876543201245</p>
                                                    <button
                                                        onClick={() => navigator.clipboard.writeText('002-1939876543201245')}
                                                        className="text-sky-500 hover:text-sky-600 p-1 rounded hover:bg-sky-50 transition-colors"
                                                        title="Copiar CCI"
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Titular</span>
                                                <p className="text-xs font-medium text-foreground">JKE Solutions S.A.C.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full space-y-5">
                                            <div className="h-32 w-32 bg-card border border-border shadow-sm rounded-xl flex items-center justify-center p-2">
                                                {/* Placeholder for real QR code image */}
                                                <QrCode className="h-full w-full text-muted-foreground/20" strokeWidth={1} />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs font-bold text-foreground uppercase">Yape / Plin</p>
                                                <div className="flex items-center justify-center gap-2 mt-1">
                                                    <p className="text-lg font-mono font-bold text-sky-600">999 888 777</p>
                                                    <button
                                                        onClick={() => navigator.clipboard.writeText('999888777')}
                                                        className="text-sky-500 hover:text-sky-600 p-1 rounded hover:bg-sky-50 transition-colors"
                                                        title="Copiar número"
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1">JKE Solutions S.A.C.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Bottom Section */}
                        <div className="border-t border-slate-100 pt-6">
                            <h4 className="text-sm font-bold text-foreground uppercase tracking-tight mb-5">Cargar Comprobante de Pago</h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
                                <div>
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                                        N° de Operación / Referencia
                                    </label>
                                    <input
                                        type="text"
                                        value={renewReferenceCode}
                                        onChange={(e) => setRenewReferenceCode(e.target.value)}
                                        placeholder="Ej. 12345678"
                                        className="w-full border border-border rounded-lg px-4 py-2.5 text-xs bg-muted/30 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                                        Subir comprobante de pago (PDF/Image)
                                    </label>
                                    <div className="border border-dashed border-border rounded-lg px-4 py-0 bg-muted/30 flex items-center gap-3 cursor-pointer hover:bg-muted transition-colors relative w-full h-[42px]">
                                        <input
                                            type="file"
                                            accept="image/*,.pdf"
                                            onChange={(e) => setRenewFile(e.target.files?.[0] || null)}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <UploadCloud className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                                        <span className="text-xs text-muted-foreground truncate flex-1">
                                            {renewFile ? renewFile.name : 'Seleccionar archivo...'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-[10px] text-muted-foreground leading-relaxed max-w-2xl">
                                Nota: Su renovación será procesada una vez que nuestro equipo valide el comprobante enviado (generalmente en menos de 24h).
                            </p>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-3 p-6 border-t border-border bg-card">
                        <button
                            onClick={() => setIsRenewModalOpen(false)}
                            disabled={isRenewing}
                            className="px-6 py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 uppercase tracking-wider"
                        >
                            Cancelar
                        </button>
                        <button
                            className={`px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 min-w-[180px] ${isRenewing || !renewFile || !renewReferenceCode ? 'opacity-70 cursor-not-allowed' : ''}`}
                            onClick={confirmRenewSubscription}
                            disabled={isRenewing || !renewFile || !renewReferenceCode}
                        >
                            {isRenewing ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    <span>Enviando...</span>
                                </>
                            ) : (
                                <span>Enviar Comprobante</span>
                            )}
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Success Submission Modal */}
            <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
                <DialogContent className="sm:max-w-md p-10 border-0 shadow-2xl !rounded-2xl text-center [&>button]:hidden">
                    <div className="flex flex-col items-center justify-center mb-2 mt-4">
                        <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center relative mb-6">
                            <ClipboardCheck className="h-10 w-10 text-primary" strokeWidth={2} />
                            {/* We simulate the clock/check overlapping badge from design */}
                            <div className="absolute bottom-1 right-1 bg-card rounded-full p-0.5 shadow-sm">
                                <div className="bg-sky-500 text-white rounded-full p-1">
                                    <Clock className="h-4 w-4" strokeWidth={3} />
                                </div>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-4">
                            ¡Comprobante Enviado!
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-6 max-w-sm mx-auto">
                            Hemos recibido tu comprobante de pago. Nuestro equipo validará la información en un plazo máximo de <strong>24 horas hábiles</strong>. Te notificaremos vía email cuando tu suscripción sea activada correctamente.
                        </p>

                        <div className="bg-muted/20 border border-border rounded-xl py-4 px-6 w-full mb-8">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Referencia del envío</p>
                            <p className="text-xs font-bold text-foreground font-mono">Nº de Operación: {submittedReferenceCode}</p>
                        </div>

                        <button
                            onClick={() => setIsSuccessModalOpen(false)}
                            className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm mb-4"
                        >
                            <Home className="h-5 w-5" />
                            Volver al Inicio
                        </button>

                        <button
                            onClick={() => setIsSuccessModalOpen(false)}
                            className="text-[10px] text-muted-foreground hover:text-foreground font-bold transition-colors uppercase tracking-wider"
                        >
                            Ver estado de mi solicitud
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
}
