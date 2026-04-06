import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReportGenerationModalProps {
    isOpen: boolean;
    onClose: () => void;
    message?: string;
}

export function ReportGenerationModal({
    isOpen,
    onClose,
    message = "La generación del reporte ha comenzado. Se le notificará cuando esté listo."
}: ReportGenerationModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm flex flex-col items-center overflow-hidden p-6 text-center relative animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>

                {/* Icon Container using exact styling from BulkUploadSuccessModal for consistency */}
                <div className="relative mb-4">
                    <div className="bg-sky-50 rounded-full p-6 animate-ping absolute inset-0 opacity-75"></div>
                    <div className="bg-sky-50 rounded-full p-4 relative z-10">
                        <div className="bg-[#0ea5e9] rounded-full p-2 shadow-lg shadow-sky-200">
                            <Check className="h-6 w-6 text-white stroke-[3.5]" />
                        </div>
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-slate-800 mb-2">Reporte Generado</h3>

                {/* Message */}
                <p className="text-sm text-slate-500 mb-6 leading-relaxed px-2">
                    {message}
                </p>

                {/* Action Button */}
                <Button
                    onClick={onClose}
                    className="w-full bg-[#0ea5e9] hover:bg-sky-600 text-white font-bold h-11 text-sm rounded-xl shadow-lg shadow-sky-100 transition-all hover:shadow-sky-200 active:scale-[0.98]"
                >
                    Entendido
                </Button>

            </div>
        </div>
    );
}
