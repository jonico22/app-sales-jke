import { XCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';

interface POSAlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message: string;
    type?: 'error' | 'warning' | 'info' | 'success';
}

export function POSAlertModal({
    isOpen,
    onClose,
    title,
    message,
    type = 'error'
}: POSAlertModalProps) {
    if (!isOpen) return null;

    const config = {
        error: {
            icon: XCircle,
            color: 'text-destructive',
            bg: 'bg-destructive/10',
            title: title || 'Error'
        },
        warning: {
            icon: AlertTriangle,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
            title: title || 'Advertencia'
        },
        info: {
            icon: Info,
            color: 'text-primary',
            bg: 'bg-primary/10',
            title: title || 'Información'
        },
        success: {
            icon: CheckCircle,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
            title: title || 'Éxito'
        }
    }[type];

    const Icon = config.icon;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card rounded-2xl sm:rounded-3xl w-full max-w-sm shadow-xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex flex-col items-center pt-5 sm:pt-8 pb-3 sm:pb-4 px-4 sm:px-6 text-center">
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 ${config.bg} rounded-full flex items-center justify-center mb-3 sm:mb-4 animate-in zoom-in duration-500`}>
                        <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${config.color}`} />
                    </div>
                    <h2 className="text-base sm:text-xl font-semibold text-foreground mb-2">
                        {config.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {message}
                    </p>
                </div>

                <div className="p-4 sm:p-6 bg-muted/50 border-t border-border">
                    <button
                        onClick={onClose}
                        className="w-full py-2.5 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl transition-colors shadow-lg shadow-primary/20"
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
}
