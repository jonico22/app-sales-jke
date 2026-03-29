import { useEffect, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSocietyStore } from '@/store/society.store';
import { societyService } from '@/services/society.service';
import { subscriptionService, type SubscriptionDetails } from '@/services/subscription.service';
import { AlertCircle } from 'lucide-react';

import { BillingHeader } from './components/BillingHeader';
import { PlanDetailsCard } from './components/PlanDetailsCard';
import { PlanUsageMetrics } from './components/PlanUsageMetrics';
import { AutoRenewPanel } from './components/AutoRenewPanel';
import { SubscriptionActionButtons } from './components/SubscriptionActionButtons';
import { PaymentMethodCard } from './components/PaymentMethodCard';
import { BillingHistoryTabs } from './components/BillingHistoryTabs';
import { SubscriptionHistoryList } from './components/SubscriptionHistoryList';
import { BillingHistoryList } from './components/BillingHistoryList';
import { CancelSubscriptionModal } from './components/CancelSubscriptionModal';
import { RenewSubscriptionModal } from './components/RenewSubscriptionModal';
import { SuccessSubmissionModal } from './components/SuccessSubmissionModal';
import { Card } from '@/components/ui/card';

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

    useEffect(() => {
        const fetchSubscription = async () => {
            if (!society?.subscriptionId) return;
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
        } finally {
            setUpdatingRenew(false);
        }
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
                setSubscription({ ...subscription, hasPendingPayment: true });
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

    const usageMetrics = useMemo(() => {
        const currentUsers = society?.totalUsers || 0;
        const currentProducts = society?.totalProducts || 0;
        const currentStorageBytes = society?.usedStorage || 0;
        
        const userPercent = Math.min(100, (Number(currentUsers) / (society?.maxUsers || subscription?.plan.maxUsers || 1)) * 100) || 0;
        const productPercent = Math.min(100, (Number(currentProducts) / (society?.maxProducts || subscription?.plan.maxProducts || 1)) * 100) || 0;
        
        const planStorageBytes = (subscription?.plan.storage || 1) * 1024 * 1024 * 1024;
        const storagePercent = Math.min(100, Math.max(0, (Number(currentStorageBytes) / planStorageBytes) * 100)) || 0;
        
        const formatSize = (bytes: any) => {
            const numBytes = Number(bytes);
            if (isNaN(numBytes) || numBytes <= 0) return '0 MB';
            return parseFloat((numBytes / (1024 * 1024)).toFixed(2)) + ' MB';
        };

        return {
            currentUsers,
            maxUsers: society?.maxUsers || subscription?.plan.maxUsers || 0,
            userPercent,
            currentProducts,
            maxProducts: society?.maxProducts || subscription?.plan.maxProducts || 0,
            productPercent,
            currentStorageStr: formatSize(currentStorageBytes),
            maxStorageMB: subscription?.plan.storage || 0,
            storagePercent
        };
    }, [society, subscription]);

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
    const mostrarBotonRenovacion = subscription.isNearingExpiration && !subscription.hasPendingPayment && !isBeta;

    return (
        <div className="flex-1 w-full bg-background min-h-[calc(100vh-4rem)] md:p-8 space-y-6">
            <BillingHeader isBeta={isBeta} />

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <PlanDetailsCard subscription={subscription} isBeta={isBeta} isFree={isFree}>
                        <PlanUsageMetrics {...usageMetrics} />
                        <AutoRenewPanel 
                            autoRenew={subscription.autoRenew}
                            isActive={subscription.isActive}
                            isFree={isFree}
                            updatingRenew={updatingRenew}
                            onToggle={handleToggleAutoRenew}
                        />
                        <SubscriptionActionButtons 
                            status={subscription.status}
                            isActive={subscription.isActive}
                            autoRenew={subscription.autoRenew}
                            hasPendingPayment={subscription.hasPendingPayment}
                            isReactivating={isReactivating}
                            mostrarBotonRenovacion={mostrarBotonRenovacion}
                            endDate={subscription.endDate}
                            onReactivate={handleReactivateSubscription}
                            onRenew={() => setIsRenewModalOpen(true)}
                            onCancel={() => setIsCancelModalOpen(true)}
                        />
                    </PlanDetailsCard>
                </div>
                <PaymentMethodCard />
            </div>

            <div className="max-w-6xl mx-auto pt-4">
                <Card className="border-border shadow-sm overflow-hidden">
                    <BillingHistoryTabs activeTab={activeTab} onTabChange={setActiveTab} />
                    <div className="p-0">
                        {activeTab === 'history' ? (
                            <SubscriptionHistoryList history={history} loading={loadingHistory} />
                        ) : (
                            <BillingHistoryList billingHistory={billingHistory} loading={loadingBilling} />
                        )}
                    </div>
                </Card>
            </div>

            <CancelSubscriptionModal 
                isOpen={isCancelModalOpen}
                onOpenChange={setIsCancelModalOpen}
                planName={subscription.plan.name}
                isBeta={isBeta}
                cancelReason={cancelReason}
                onCancelReasonChange={setCancelReason}
                onConfirm={handleCancelSubscription}
                isCancelling={isCancelling}
            />

            <RenewSubscriptionModal 
                isOpen={isRenewModalOpen}
                onOpenChange={setIsRenewModalOpen}
                subscription={subscription}
                isFreeSub={isFree}
                isBetaSub={isBeta}
                paymentMethod={renewPaymentMethod}
                onPaymentMethodChange={setRenewPaymentMethod}
                referenceCode={renewReferenceCode}
                onReferenceCodeChange={setRenewReferenceCode}
                file={renewFile}
                onFileChange={setRenewFile}
                onConfirm={confirmRenewSubscription}
                isRenewing={isRenewing}
            />

            <SuccessSubmissionModal 
                isOpen={isSuccessModalOpen}
                onOpenChange={setIsSuccessModalOpen}
                referenceCode={submittedReferenceCode}
            />
        </div>
    );
}
