import { Check } from 'lucide-react';
import { Button } from '@/components/ui';

interface BulkUploadSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: () => void;
    stats: {
        processed: number;
        success: number;
        failed: number;
    };
}

export function BulkUploadSuccessModal({
    isOpen,
    onClose,
    onNavigate,
    stats
}: BulkUploadSuccessModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm flex flex-col items-center overflow-hidden p-6 text-center relative animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>

                {/* Icon Container */}
                <div className="relative mb-5">
                    <div className="bg-primary/10 rounded-full p-5 animate-ping absolute inset-0 opacity-20"></div>
                    <div className="bg-primary/10 rounded-full p-3 relative z-10 border border-primary/20">
                        <div className="bg-primary rounded-full p-2 shadow-lg shadow-primary/20">
                            <Check className="h-5 w-5 text-primary-foreground stroke-[3]" />
                        </div>
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-foreground mb-1 uppercase tracking-tight">¡Importación Exitosa!</h3>

                {/* Subtitle */}
                <p className="text-[11px] text-muted-foreground mb-6 max-w-[240px] leading-relaxed font-medium">
                    Se han cargado correctamente <span className="font-bold text-foreground">{stats.success} categorías</span> al sistema.
                </p>

                {/* Stats List */}
                <div className="w-full space-y-2 mb-6 px-1">
                    <div className="flex justify-between items-center py-2 border-b border-border/50 px-2 rounded-lg transition-colors bg-muted/5">
                        <span className="text-[9px] font-bold text-muted-foreground/70 uppercase tracking-widest">Total Procesados</span>
                        <span className="text-xs font-bold text-foreground">{stats.processed}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50 px-2 rounded-lg transition-colors bg-muted/5">
                        <span className="text-[9px] font-bold text-muted-foreground/70 uppercase tracking-widest">Exitosos</span>
                        <span className="text-xs font-bold text-green-500">{stats.success}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 px-2 rounded-lg transition-colors bg-muted/5">
                        <span className="text-[9px] font-bold text-muted-foreground/70 uppercase tracking-widest">Omitidos</span>
                        <span className="text-xs font-bold text-destructive">{stats.failed}</span>
                    </div>
                </div>

                {/* Action Button */}
                <Button
                    onClick={onNavigate}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-[10px] uppercase tracking-wider shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                >
                    Finalizar y Ver Categorías
                </Button>

            </div>
        </div>
    );
}
