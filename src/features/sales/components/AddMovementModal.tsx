import { useState, useEffect } from 'react';
import { RefreshCw, ArrowDownCircle, ArrowUpCircle, ChevronDown } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/auth.store';
import { useSocietyStore } from '@/store/society.store';
import { cashShiftService, PaymentMethodOrder, ShiftStatus } from '@/services/cash-shift.service';
import { useAddMovementMutation } from '../hooks/useCashShiftQueries';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

const DEFAULT_CURRENCY_ID = '00000000-0000-0000-0000-000000000000';

const PAYMENT_METHODS = [
    { value: PaymentMethodOrder.CASH, label: 'Efectivo' },
    { value: PaymentMethodOrder.CARD, label: 'Tarjeta' },
    { value: PaymentMethodOrder.YAPE, label: 'Yape' },
    { value: PaymentMethodOrder.PLIN, label: 'Plin' },
    { value: PaymentMethodOrder.TRANSFER, label: 'Transferencia' },
    { value: PaymentMethodOrder.OTHER, label: 'Otro' },
];

interface AddMovementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    shiftId?: string;
    shiftName?: string;
}

export function AddMovementModal({ isOpen, onClose, onSuccess, shiftId: fixedShiftId }: AddMovementModalProps) {
    const user = useAuthStore(state => state.user);
    const society = useSocietyStore(state => state.society);

    // ── Queries & Mutations ────────────────────────────────────────────────
    const { data: shiftsData, isLoading: shiftsLoading } = useQuery({
        queryKey: ['cash-shifts', 'select', 'open'],
        queryFn: () => cashShiftService.getForSelect({ status: ShiftStatus.OPEN }),
        enabled: isOpen && !fixedShiftId,
    });

    const { mutate: addMovement, isPending: isSubmitting } = useAddMovementMutation();

    // ── Form State ──────────────────────────────────────────────────────────
    const [selectedShiftId, setSelectedShiftId] = useState(fixedShiftId ?? '');
    const [movementType, setMovementType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
    const [amount, setAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<string>(PaymentMethodOrder.CASH);
    const [description, setDescription] = useState('');

    const openShifts = shiftsData?.data ?? [];

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedShiftId(fixedShiftId ?? '');
            setMovementType('INCOME');
            setAmount('');
            setPaymentMethod(PaymentMethodOrder.CASH);
            setDescription('');
        }
    }, [isOpen, fixedShiftId]);

    const handleSubmit = () => {
        const shiftId = fixedShiftId || selectedShiftId;

        if (!shiftId) return toast.error('Selecciona un turno de caja');
        if (!user?.id) return toast.error('No se pudo identificar al usuario');
        
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) return toast.error('Ingresa un monto válido mayor a 0');
        if (!description.trim()) return toast.error('La descripción / motivo es requerida');

        const currencyId = society?.mainCurrency?.id || DEFAULT_CURRENCY_ID;

        addMovement({
            shiftId,
            type: movementType as any,
            amount: parsedAmount,
            description: description.trim(),
            currencyId,
            paymentMethod: paymentMethod as any,
            userId: user.id,
        }, {
            onSuccess: () => {
                onSuccess?.();
                onClose();
            }
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Registrar Movimiento Manual">
            <div className="space-y-6">
                {/* Shift selector */}
                {!fixedShiftId && (
                    <div className="space-y-2">
                        <Label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
                            Caja / Turno Abierto
                        </Label>
                        <div className="relative">
                            <select
                                value={selectedShiftId}
                                onChange={(e) => setSelectedShiftId(e.target.value)}
                                disabled={shiftsLoading}
                                className="w-full appearance-none pl-3 pr-12 py-2.5 bg-muted/40 border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary disabled:opacity-60 transition-all cursor-pointer"
                            >
                                <option value="">
                                    {shiftsLoading ? 'Cargando turnos...' : 'Seleccionar caja abierta...'}
                                </option>
                                {openShifts.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.branch?.name ?? 'S/N'} — #{s.id.slice(0, 8).toUpperCase()}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none" />
                        </div>
                    </div>
                )}

                {/* Type + Currency row */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
                            Tipo de Movimiento
                        </Label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setMovementType('INCOME')}
                                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-[10px] font-semibold uppercase tracking-[0.12em] transition-all ${
                                    movementType === 'INCOME'
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/5'
                                    : 'bg-muted/40 border-border text-muted-foreground/50 hover:bg-muted'
                                }`}
                            >
                                <ArrowDownCircle size={14} />
                                Ingreso
                            </button>
                            <button
                                type="button"
                                onClick={() => setMovementType('EXPENSE')}
                                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-[10px] font-semibold uppercase tracking-[0.12em] transition-all ${
                                    movementType === 'EXPENSE'
                                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400 ring-2 ring-rose-500/5'
                                    : 'bg-muted/40 border-border text-muted-foreground/50 hover:bg-muted'
                                }`}
                            >
                                <ArrowUpCircle size={14} />
                                Egreso
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
                            Moneda
                        </Label>
                        <div className="w-full pl-3 pr-4 py-2.5 bg-muted/20 border border-border rounded-xl text-sm font-medium text-muted-foreground opacity-70">
                            {society?.mainCurrency?.name 
                                ? `${society.mainCurrency.name} (${society.mainCurrency.symbol})`
                                : 'Soles (S/)'}
                        </div>
                    </div>
                </div>

                {/* Amount */}
                <div className="space-y-2">
                        <Label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
                        Monto
                    </Label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">S/</span>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            onBlur={() => {
                                const n = parseFloat(amount);
                                if (!isNaN(n)) setAmount(n.toFixed(2));
                            }}
                            className="w-full pl-9 pr-4 py-2.5 bg-muted/40 border border-border rounded-xl text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                        />
                    </div>
                </div>

                {/* Payment method */}
                <div className="space-y-2">
                    <Label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
                        Método de Pago
                    </Label>
                    <div className="relative">
                        <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-full appearance-none pl-3 pr-12 py-2.5 bg-muted/40 border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary cursor-pointer transition-colors"
                        >
                            {PAYMENT_METHODS.map((pm) => (
                                <option key={pm.value} value={pm.value}>{pm.label}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none" />
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <Label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
                        Descripción / Motivo
                    </Label>
                    <textarea
                        rows={3}
                        placeholder="Ej. Pago de limpieza del local"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full resize-none bg-muted/40 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3 px-6 py-4 border-t border-border bg-muted/5 mt-6 -mx-6 -mb-6">
                <Button
                    variant="ghost"
                    className="flex-1 rounded-xl"
                    onClick={onClose}
                    disabled={isSubmitting}
                >
                    Cancelar
                </Button>
                <Button
                    className="flex-1 rounded-xl shadow-lg shadow-primary/20"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <RefreshCw size={14} className="animate-spin" />
                    ) : (
                        'Guardar Movimiento'
                    )}
                </Button>
            </div>
        </Modal>
    );
}
