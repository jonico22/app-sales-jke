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
            color: 'text-red-500',
            bg: 'bg-red-50',
            title: title || 'Error'
        },
        warning: {
            icon: AlertTriangle,
            color: 'text-amber-500',
            bg: 'bg-amber-50',
            title: title || 'Advertencia'
        },
        info: {
            icon: Info,
            color: 'text-sky-500',
            bg: 'bg-sky-50',
            title: title || 'Información'
        },
        success: {
            icon: CheckCircle,
            color: 'text-emerald-500',
            bg: 'bg-emerald-50',
            title: title || 'Éxito'
        }
    }[type];

    const Icon = config.icon;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex flex-col items-center pt-8 pb-4 px-6 text-center">
                    <div className={`w-16 h-16 ${config.bg} rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-500`}>
                        <Icon className={`w-8 h-8 ${config.color}`} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">
                        {config.title}
                    </h2>
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {message}
                    </p>
                </div>

                <div className="p-6 bg-slate-50/50">
                    <button
                        onClick={onClose}
                        className="w-full py-3 text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-xl transition-colors shadow-lg shadow-slate-800/20"
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
}
