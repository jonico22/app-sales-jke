import { useState } from 'react';
import { Wallet, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui';
import { CashOpeningModal } from './CashOpeningModal';

interface CashOpeningBannerProps {
    onOpenCash?: () => void;
    isLoading?: boolean;
    refreshShift?: () => void;
}

export function CashOpeningBanner({ onOpenCash, isLoading, refreshShift }: CashOpeningBannerProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenClick = () => {
        if (onOpenCash) {
            onOpenCash();
        } else {
            setIsModalOpen(true);
        }
    };

    if (isLoading) {
        return (
            <div className="h-[62px] w-full rounded-2xl bg-muted/30 animate-pulse border border-border/50 flex items-center px-6">
                <div className="flex items-center gap-4 w-full">
                    <div className="w-9 h-9 rounded-lg bg-muted shrink-0" />
                    <div className="flex-1 space-y-2">
                        <div className="h-3 bg-muted rounded w-1/4" />
                        <div className="h-2 bg-muted rounded w-1/2" />
                    </div>
                    <div className="w-24 h-9 rounded-lg bg-muted" />
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="relative group overflow-hidden rounded-2xl bg-sky-50 shadow-sm border border-sky-100/50">
                {/* Subtle highlight */}
                <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-white/40 to-transparent pointer-events-none" />

                <div className="relative px-6 py-3 flex flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        {/* Icon Container - Minimalist Light */}
                        <div className="w-9 h-9 rounded-lg bg-sky-100 flex items-center justify-center shrink-0">
                            <Wallet className="w-4.5 h-4.5 text-sky-600" />
                        </div>

                        {/* Text Content - Horizontal & Inline */}
                        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
                            <h2 className="text-[13px] font-black text-sky-900 uppercase tracking-tight leading-none">
                                Apertura de Caja Chica
                            </h2>
                            <div className="hidden md:block w-1 h-1 rounded-full bg-sky-300" />
                            <p className="text-sky-700/70 text-[10px] font-bold uppercase tracking-wider">
                                Comienza tu turno realizando la apertura de caja.
                            </p>
                        </div>
                    </div>

                    {/* Action Button - Compact Sidebar Button Style */}
                    <Button
                        onClick={handleOpenClick}
                        className="h-9 px-5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-600/10 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98] group/btn border-none"
                    >
                        Abrir Caja
                        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Button>
                </div>
            </div>

            <CashOpeningModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    refreshShift?.();
                }}
            />
        </>
    );
}
