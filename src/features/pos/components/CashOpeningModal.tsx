import { useState, useEffect } from 'react';
import { Wallet, Calendar, Clock, Rocket } from 'lucide-react';
import { Modal, Button, Label } from '@/components/ui';
import { useBranchStore } from '@/store/branch.store';
import { useAuthStore } from '@/store/auth.store';
import { useSocietyStore } from '@/store/society.store';
import { cashShiftService } from '@/services/cash-shift.service';
import { toast } from 'sonner';

interface CashOpeningModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function CashOpeningModal({ isOpen, onClose, onSuccess }: CashOpeningModalProps) {
    const user = useAuthStore(state => state.user);
    const society = useSocietyStore(state => state.society);
    const { branches, selectedBranch } = useBranchStore();
    
    const [branchId, setBranchId] = useState(selectedBranch?.id || '');
    const [initialAmount, setInitialAmount] = useState<string>('0.00');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Sync with selected branch when modal opens
    useEffect(() => {
        if (isOpen && selectedBranch) {
            setBranchId(selectedBranch.id);
        }
    }, [isOpen, selectedBranch]);

    const handleOpenShift = async () => {
        if (!user?.id || !society?.id || !branchId) {
            toast.error('Faltan datos para abrir la caja');
            return;
        }

        const amount = parseFloat(initialAmount);
        if (isNaN(amount) || amount < 0) {
            toast.error('El monto inicial debe ser un número válido');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await cashShiftService.open({
                userId: user.id,
                societyId: society.id,
                branchId: branchId,
                initialAmount: amount
            });

            if (response.success) {
                toast.success('Caja abierta exitosamente');
                onSuccess?.();
                onClose();
            } else {
                toast.error(response.message || 'Error al abrir la caja');
            }
        } catch (error: any) {
            console.error('[CashOpeningModal] Error opening shift:', error);
            const message = error.response?.data?.message || 'Error al conectar con el servidor';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const today = new Date();
    const formattedDate = today.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
    const formattedTime = today.toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title=""
            hideHeader
            size="sm"
            contentClassName="p-0 overflow-hidden"
        >
            <div className="p-8 space-y-8">
                {/* Header Style from Image */}
                <div className="flex gap-4 items-start">
                    <div className="bg-sky-500 rounded-lg p-2 shrink-0">
                        <Wallet className="h-6 w-6 text-white" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-xl font-bold text-slate-800">Apertura de Caja Chica</h2>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Registre el monto inicial para comenzar las operaciones del dia.
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Sucursal Selector */}
                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-600">Sucursal</Label>
                        <div className="relative">
                            <select
                                value={branchId}
                                onChange={(e) => setBranchId(e.target.value)}
                                className="w-full h-14 pl-4 pr-10 bg-slate-50/50 border border-slate-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-700 font-medium"
                            >
                                <option value="" disabled>Seleccionar sucursal</option>
                                {branches.map((branch) => (
                                    <option key={branch.id} value={branch.id}>
                                        {branch.name}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Monto Inicial */}
                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-600">Monto Inicial</Label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                                $
                            </div>
                            <input
                                type="text"
                                value={initialAmount}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (/^\d*\.?\d*$/.test(val)) setInitialAmount(val);
                                }}
                                onBlur={() => {
                                    const num = parseFloat(initialAmount) || 0;
                                    setInitialAmount(num.toFixed(2));
                                }}
                                placeholder="0.00"
                                className="w-full h-14 pl-10 pr-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-lg font-bold text-slate-700"
                            />
                        </div>
                    </div>

                    {/* Meta Info: Date & Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50/80 rounded-xl p-4 space-y-1 border border-slate-100/50">
                            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Fecha de apertura</span>
                            <div className="flex items-center gap-2 text-slate-700">
                                <Calendar className="h-4 w-4 text-slate-400" />
                                <span className="text-sm font-bold">{formattedDate}</span>
                            </div>
                        </div>
                        <div className="bg-slate-50/80 rounded-xl p-4 space-y-1 border border-slate-100/50">
                            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Hora de apertura</span>
                            <div className="flex items-center gap-2 text-slate-700">
                                <Clock className="h-4 w-4 text-slate-400" />
                                <span className="text-sm font-bold">{formattedTime}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-4 pt-2">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 h-14 rounded-xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleOpenShift}
                        disabled={isSubmitting}
                        className="flex-1 h-14 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                        {isSubmitting ? (
                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Rocket className="h-5 w-5" />
                                Confirmar y Abrir
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
