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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col items-center overflow-hidden p-6 text-center relative animate-in zoom-in-95 duration-300 max-h-[90vh]" onClick={(e) => e.stopPropagation()}>

                {/* Icon Container */}
                <div className="relative mb-4">
                    <div className="bg-sky-50 rounded-full p-6 animate-ping absolute inset-0 opacity-75"></div>
                    <div className="bg-sky-50 rounded-full p-4 relative z-10">
                        <div className="bg-[#0ea5e9] rounded-full p-2 shadow-lg shadow-sky-200">
                            <Check className="h-6 w-6 text-white stroke-[3.5]" />
                        </div>
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-slate-800 mb-2">¡Importación Completada!</h3>

                {/* Subtitle */}
                <p className="text-xs text-slate-500 mb-6 max-w-[240px] leading-relaxed">
                    Se han cargado correctamente <span className="font-bold text-slate-700">{stats.success} productos</span> al sistema.
                </p>

                {/* Stats List */}
                <div className="w-full space-y-3 mb-6 px-2">
                    <div className="flex justify-between items-center py-2 border-b border-slate-50 group hover:bg-slate-50/50 px-2 rounded-lg transition-colors">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Procesados</span>
                        <span className="text-sm font-bold text-slate-700">{stats.processed}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-50 group hover:bg-slate-50/50 px-2 rounded-lg transition-colors">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Exitosos</span>
                        <span className="text-sm font-bold text-green-600">{stats.success}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 group hover:bg-slate-50/50 px-2 rounded-lg transition-colors">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Omitidos (Con Errores)</span>
                        <span className="text-sm font-bold text-red-500">{stats.failed}</span>
                    </div>
                </div>

                {/* Error List */}
                {errors.length > 0 && (
                    <div className="w-full mb-6 text-left">
                        <div className="bg-red-50 rounded-lg p-3 border border-red-100 max-h-32 overflow-y-auto">
                            <p className="text-[10px] font-bold text-red-700 mb-2 uppercase tracking-wide sticky top-0 bg-red-50">
                                Detalle de Errores ({errors.length}):
                            </p>
                            <ul className="space-y-1">
                                {errors.map((error, index) => (
                                    <li key={index} className="text-[10px] text-red-600 flex items-start gap-1.5 leading-tight">
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
                    className="w-full bg-[#0ea5e9] hover:bg-sky-600 text-white font-bold h-11 text-xs uppercase tracking-wide shadow-lg shadow-sky-100 transition-all hover:shadow-sky-200 active:scale-[0.98] shrink-0"
                >
                    Finalizar y Ver Inventario
                </Button>

            </div>
        </div>
    );
}
