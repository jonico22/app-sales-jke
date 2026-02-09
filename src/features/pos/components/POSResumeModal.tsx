import { AlertCircle, Copy, Play } from 'lucide-react';

interface POSResumeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isProcessing: boolean;
    orderCode?: string;
}

export function POSResumeModal({
    isOpen,
    onClose,
    onConfirm,
    isProcessing,
    orderCode
}: POSResumeModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header with Icon */}
                <div className="flex flex-col items-center pt-8 pb-4 px-6 text-center">
                    <div className="w-16 h-16 bg-sky-50 rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-500">
                        <Copy className="w-8 h-8 text-sky-500" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">
                        Retomar y Clonar Pedido
                    </h2>
                    {orderCode && (
                        <span className="text-sm font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md mb-2">
                            #{orderCode}
                        </span>
                    )}
                    <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
                        Se procederá a <span className="font-bold text-slate-700">clonar los productos</span> de este pedido en una nueva orden de venta.
                    </p>
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700 flex gap-2 items-start text-left">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <p>
                            El pedido actual <strong>será cancelado automáticamente</strong> para mantener el registro histórico y evitar duplicados.
                        </p>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                        Mantener
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isProcessing}
                        className="flex-[1.5] py-3 text-sm font-bold text-white bg-sky-500 hover:bg-sky-600 rounded-xl shadow-lg shadow-sky-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isProcessing ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Play className="w-4 h-4 fill-current" />
                                Proceder
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
