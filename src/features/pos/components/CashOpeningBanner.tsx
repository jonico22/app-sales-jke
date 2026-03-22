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
            <div className="relative group overflow-hidden rounded-[20px] bg-sky-50 shadow-sm border border-sky-100/50">
                {/* Subtle highlight */}
                <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-white/40 to-transparent pointer-events-none" />

                <div className="relative px-4 py-3 sm:px-6 sm:py-3 flex items-center justify-between gap-3 sm:gap-6">
                    <div className="flex items-center gap-3 w-full sm:w-auto overflow-hidden">
                        {/* Icon Container - Minimalist Light */}
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full sm:rounded-lg bg-sky-100 flex items-center justify-center shrink-0">
                            <Wallet className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#4096d8]" />
                        </div>

                        {/* Text Content */}
                        <div className="flex flex-col min-w-0">
                            <h2 className="text-[12px] sm:text-[13px] font-black text-sky-900 uppercase tracking-tight leading-tight truncate">
                                Apertura de Caja <span className="hidden sm:inline">Chica</span>
                            </h2>
                            <p className="hidden sm:block text-sky-700/70 text-[10px] font-bold uppercase tracking-wider mt-0.5">
                                Comienza tu turno realizando la apertura de caja.
                            </p>
                            {/* Mobile short sub-text instead of subtitle to give context without taking space */}
                            <p className="sm:hidden text-sky-700/70 text-[9px] font-bold uppercase tracking-wider truncate">
                                Turno Pendiente
                            </p>
                        </div>
                    </div>

                    {/* Action Button - Compact Mode on Mobile */}
                    <div className="shrink-0 flex justify-end">
                        <Button
                            onClick={handleOpenClick}
                            className="h-8 sm:h-9 px-4 sm:px-6 rounded-[10px] sm:rounded-lg bg-[#5fa5d9] hover:bg-[#4096d8] text-white shadow-md shadow-[#4096d8]/10 flex items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-[10px] font-black uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98] group/btn border-none"
                        >
                            <span className="hidden sm:inline">Abrir Caja</span>
                            <span className="sm:hidden">Abrir</span>
                            <ArrowRight className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                        </Button>
                    </div>
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
