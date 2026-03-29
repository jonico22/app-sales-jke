import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/auth.store';
import { useSocietyStore } from '@/store/society.store';
import { cashShiftService, PaymentMethodOrder, ShiftStatus } from '@/services/cash-shift.service';
import type { CashShiftSelectItem } from '@/services/cash-shift.service';
import { toast } from 'sonner';

// Default PEN currency — adjust if you have a currencies endpoint
// Default fallback if society is not loaded (should ideally be a UUID)
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
    /** If provided, the shift selector is hidden and this shiftId is used */
    shiftId?: string;
    shiftName?: string;
}

export function AddMovementModal({ isOpen, onClose, onSuccess, shiftId: fixedShiftId }: AddMovementModalProps) {
    const user = useAuthStore(state => state.user);

    // Open shifts for the selector (only loaded when no fixed shiftId)
    const [openShifts, setOpenShifts] = useState<CashShiftSelectItem[]>([]);
    const [shiftsLoading, setShiftsLoading] = useState(false);

    // Form state
    const [selectedShiftId, setSelectedShiftId] = useState(fixedShiftId ?? '');
    const [movementType, setMovementType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
    const [amount, setAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<string>(PaymentMethodOrder.CASH);
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    // Load open shifts only when no fixed shiftId
    const loadOpenShifts = useCallback(async () => {
        if (fixedShiftId) return;
        setShiftsLoading(true);
        try {
            const res = await cashShiftService.getForSelect({ status: ShiftStatus.OPEN });
            if (res.success && res.data) {
                setOpenShifts(res.data);
            }
        } catch {
            /* silent */
        } finally {
            setShiftsLoading(false);
        }
    }, [fixedShiftId]);

    useEffect(() => {
        if (isOpen && !fixedShiftId) {
            loadOpenShifts();
        }
    }, [isOpen, fixedShiftId, loadOpenShifts]);

    const handleSubmit = async () => {
        const shiftId = fixedShiftId || selectedShiftId;

        if (!shiftId) {
            toast.error('Selecciona un turno de caja');
            return;
        }
        if (!user?.id) {
            toast.error('No se pudo identificar al usuario');
            return;
        }
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            toast.error('Ingresa un monto válido mayor a 0');
            return;
        }
        if (!description.trim()) {
            toast.error('La descripción / motivo es requerida');
            return;
        }

        const society = useSocietyStore.getState().society;
        const currencyId = society?.mainCurrency?.id || DEFAULT_CURRENCY_ID;

        setIsSubmitting(true);
        try {
            const res = await cashShiftService.addMovement({
                shiftId,
                type: movementType as any,
                amount: parsedAmount,
                description: description.trim(),
                currencyId,
                paymentMethod: paymentMethod as any,
                userId: user.id,
            });

            if (res.success) {
                toast.success(
                    movementType === 'INCOME'
                        ? 'Ingreso registrado exitosamente'
                        : 'Egreso registrado exitosamente'
                );
                onSuccess?.();
                onClose();
            } else {
                toast.error((res as any).message || 'No se pudo registrar el movimiento');
            }
        } catch (err: any) {
            const msg = err?.response?.data?.message || 'Error al registrar el movimiento';
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Registrar Movimiento Manual">
            {/* Body */}
            <div className="space-y-6">

                {/* Shift selector (only when no fixed shiftId) */}
                {!fixedShiftId && (
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.05em] text-muted-foreground/60">
                            Caja / Turno Abierto
                        </Label>
                        <div className="relative">
                            <select
                                value={selectedShiftId}
                                onChange={(e) => setSelectedShiftId(e.target.value)}
                                disabled={shiftsLoading}
                                className="w-full appearance-none pl-3 pr-8 py-2.5 bg-muted/40 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary cursor-pointer font-medium transition-colors disabled:opacity-60"
                            >
                                <option value="">
                                    {shiftsLoading ? 'Cargando turnos...' : 'Seleccionar caja o turno abierto...'}
                                </option>
                                {openShifts.map((s) => {
                                    return (
                                        <option key={s.id} value={s.id}>
                                            {s.branch?.name ?? 'S/N'} — #{s.id.slice(0, 8).toUpperCase()}
                                        </option>
                                    );
                                })}
                            </select>
                            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-muted-foreground/50">
                                ▾
                            </div>
                        </div>
                    </div>
                )}

                {/* Type + Currency row */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.05em] text-muted-foreground/60">
                            Tipo de Movimiento
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setMovementType('INCOME')}
                                className={`flex items-center justify-center gap-2 py-2.5 rounded-full border text-[10px] font-black uppercase tracking-wider transition-all shadow-sm ${movementType === 'INCOME'
                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 ring-4 ring-emerald-500/10'
                                        : 'bg-muted/40 border-border text-muted-foreground/50 hover:bg-muted'
                                    }`}
                            >
                                <ArrowDownCircle size={14} />
                                Ingreso
                            </button>
                            <button
                                type="button"
                                onClick={() => setMovementType('EXPENSE')}
                                className={`flex items-center justify-center gap-2 py-2.5 rounded-full border text-[10px] font-black uppercase tracking-wider transition-all shadow-sm ${movementType === 'EXPENSE'
                                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400 ring-4 ring-rose-500/10'
                                        : 'bg-muted/40 border-border text-muted-foreground/50 hover:bg-muted'
                                    }`}
                            >
                                <ArrowUpCircle size={14} />
                                Egreso
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.05em] text-muted-foreground/60">
                            Moneda
                        </Label>
                        <select
                            disabled
                            className="w-full appearance-none pl-3 pr-8 py-2.5 bg-muted/40 border border-border rounded-xl text-sm text-foreground font-medium opacity-70 cursor-not-allowed"
                        >
                            <option>
                                {useSocietyStore.getState().society?.mainCurrency?.name 
                                    ? `${useSocietyStore.getState().society?.mainCurrency?.name} (${useSocietyStore.getState().society?.mainCurrency?.symbol})`
                                    : 'Soles (S/)'}
                            </option>
                        </select>
                    </div>
                </div>

                {/* Amount */}
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.05em] text-muted-foreground/60">
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
                            className="w-full pl-9 pr-4 py-2.5 bg-muted/40 border border-border rounded-xl text-sm font-bold text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                        />
                    </div>
                </div>

                {/* Payment method */}
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.05em] text-muted-foreground/60">
                        Método de Pago
                    </Label>
                    <div className="relative">
                        <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-full appearance-none pl-3 pr-8 py-2.5 bg-muted/40 border border-border rounded-xl text-sm text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary cursor-pointer transition-colors"
                        >
                            {PAYMENT_METHODS.map((pm) => (
                                <option key={pm.value} value={pm.value}>{pm.label}</option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-muted-foreground/50">▾</div>
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.05em] text-muted-foreground/60">
                        Descripción / Motivo
                    </Label>
                    <textarea
                        rows={3}
                        placeholder="Ej. Pago de limpieza del local"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full resize-none bg-muted/40 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                    />
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 px-6 py-4 border-t border-border bg-muted/20">
                <Button
                    variant="outline"
                    className="flex-1"
                    onClick={onClose}
                    disabled={isSubmitting}
                >
                    Cancelar
                </Button>
                <Button
                    className="flex-1"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <RefreshCw size={14} className="animate-spin mr-2" />
                            Guardando...
                        </>
                    ) : (
                        'Guardar Movimiento'
                    )}
                </Button>
            </div>
        </Modal>
    );
}
