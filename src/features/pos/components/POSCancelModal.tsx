import { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface POSCancelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string, additionalComments: string) => void;
    orderCode: string;
    totalAmount: number;
    isProcessing: boolean;
}

const CANCEL_REASONS = [
    { id: 'error_pedido', label: 'Error en el pedido' },
    { id: 'cliente_arrepentido', label: 'Cliente se arrepintió' },
    { id: 'tiempo_espera', label: 'Tiempo de espera' },
    { id: 'duplicado', label: 'Duplicado' },
];

export function POSCancelModal({
    isOpen,
    onClose,
    onConfirm,
    orderCode,
    totalAmount,
    isProcessing
}: POSCancelModalProps) {
    const [selectedReason, setSelectedReason] = useState<string>('');
    const [additionalComments, setAdditionalComments] = useState('');

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (!selectedReason) return;
        onConfirm(selectedReason, additionalComments);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header with Icon */}
                <div className="flex flex-col items-center pt-8 pb-4 px-6 text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-500">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">
                        Confirmar Anulación del Pedido
                    </h2>
                    <p className="text-sm text-slate-500 max-w-xs">
                        Esta acción es irreversible y anulará la orden pendiente actual.
                    </p>
                </div>

                {/* Order Details Card */}
                <div className="px-6 mb-6">
                    <div className="bg-slate-50 rounded-xl p-4 flex justify-between items-center border border-slate-100">
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">TICKET ID</span>
                            <span className="text-sm font-bold text-slate-700">#{orderCode}</span>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">MONTO TOTAL</span>
                            <span className="text-sm font-black text-slate-800">S/ {totalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="px-6 space-y-4 mb-6">
                    {/* Reason Selection */}
                    <div>
                        <label className="text-sm font-semibold text-slate-700 mb-2 block">
                            Motivo de Anulación
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {CANCEL_REASONS.map((reason) => (
                                <button
                                    key={reason.id}
                                    onClick={() => setSelectedReason(reason.label)}
                                    className={`py-2 px-3 text-xs font-medium border rounded-lg transition-all ${selectedReason === reason.label
                                            ? 'bg-red-50 text-red-700 border-red-200 ring-1 ring-red-200'
                                            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                        }`}
                                >
                                    {reason.label}
                                </button>
                            ))}
                        </div>
                        {selectedReason === 'Tiempo de espera' && (
                            <p className="text-xs text-red-500 mt-1 ml-1 animate-in fade-in slide-in-from-top-1">
                                * Se registrará incidencia por demora.
                            </p>
                        )}
                    </div>

                    {/* Additional Comments */}
                    <div>
                        <label className="text-sm font-semibold text-slate-700 mb-2 block">
                            Comentarios Adicionales <span className="text-slate-400 font-normal">(Opcional)</span>
                        </label>
                        <textarea
                            value={additionalComments}
                            onChange={(e) => setAdditionalComments(e.target.value)}
                            placeholder="Escriba detalles adicionales aquí..."
                            className="w-full p-3 text-sm text-slate-700 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all placeholder:text-slate-400 resize-none h-24"
                        />
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                        Mantener Pedido
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!selectedReason || isProcessing}
                        className="flex-[1.5] py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-lg shadow-red-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isProcessing ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Trash2 className="w-4 h-4" />
                                Anular Pedido permanentemente
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
