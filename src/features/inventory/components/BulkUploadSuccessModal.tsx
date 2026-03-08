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
    errors?: string[];
}

export function BulkUploadSuccessModal({
    isOpen,
    onClose,
    onNavigate,
    stats,
    errors = []
}: BulkUploadSuccessModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-card rounded-3xl shadow-2xl w-full max-w-md flex flex-col items-center overflow-hidden p-6 text-center relative animate-in zoom-in-95 duration-300 max-h-[90vh]" onClick={(e) => e.stopPropagation()}>

                {/* Icon Container */}
                <div className="relative mb-4">
                    <div className="bg-primary/20 rounded-full p-6 animate-ping absolute inset-0 opacity-75"></div>
                    <div className="bg-primary/10 rounded-full p-4 relative z-10">
                        <div className="bg-primary rounded-full p-2 shadow-lg shadow-primary/30">
                            <Check className="h-6 w-6 text-primary-foreground stroke-[3.5]" />
                        </div>
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-foreground mb-1 uppercase tracking-tight">¡Importación Exitosa!</h3>

                {/* Subtitle */}
                <p className="text-xs text-muted-foreground mb-6 max-w-[240px] leading-relaxed">
                    Se han cargado correctamente <span className="font-bold text-foreground">{stats.success} productos</span> al sistema.
                </p>

                {/* Stats List */}
                <div className="w-full space-y-3 mb-6 px-2">
                    <div className="flex justify-between items-center py-2 border-b border-border group hover:bg-muted/50 px-2 rounded-lg transition-colors">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Procesados</span>
                        <span className="text-sm font-bold text-foreground">{stats.processed}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border group hover:bg-muted/50 px-2 rounded-lg transition-colors">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Exitosos</span>
                        <span className="text-sm font-bold text-green-600 dark:text-green-500">{stats.success}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 group hover:bg-muted/50 px-2 rounded-lg transition-colors">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Omitidos (Con Errores)</span>
                        <span className="text-sm font-bold text-destructive">{stats.failed}</span>
                    </div>
                </div>

                {/* Error List */}
                {errors.length > 0 && (
                    <div className="w-full mb-6 text-left">
                        <div className="bg-destructive/10 rounded-lg p-3 border border-destructive/20 max-h-32 overflow-y-auto">
                            <p className="text-[10px] font-bold text-destructive mb-2 uppercase tracking-wide sticky top-0 bg-transparent">
                                Detalle de Errores ({errors.length}):
                            </p>
                            <ul className="space-y-1">
                                {errors.map((error, index) => (
                                    <li key={index} className="text-[10px] text-destructive flex items-start gap-1.5 leading-tight">
                                        <span className="mt-0.5">•</span>
                                        <span>{error}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Action Button */}
                <Button
                    onClick={onNavigate}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 text-xs uppercase tracking-wide shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 active:scale-[0.98] shrink-0"
                >
                    Finalizar y Ver Inventario
                </Button>

            </div>
        </div>
    );
}
