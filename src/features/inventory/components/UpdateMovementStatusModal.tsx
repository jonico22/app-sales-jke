import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { DialogContent } from '@/components/ui/dialog';
import { DialogHeader } from '@/components/ui/dialog';
import { DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { MovementStatus, type BranchMovement } from '@/services/branch-movement.service';
import { cn } from '@/lib/utils';

interface UpdateMovementStatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (status: MovementStatus, reason?: string) => Promise<void>;
    movement: BranchMovement | null;
    isLoading: boolean;
}

export function UpdateMovementStatusModal({
    isOpen,
    onClose,
    onConfirm,
    movement,
    isLoading
}: UpdateMovementStatusModalProps) {
    const [selectedStatus, setSelectedStatus] = useState<MovementStatus | null>(null);
    const [reason, setReason] = useState('');

    // Reset state when modal closes/opens via onOpenChange or parent
    const handleClose = () => {
        if (!isLoading) {
            setSelectedStatus(null);
            setReason('');
            onClose();
        }
    };

    const handleConfirm = () => {
        if (selectedStatus) {
            onConfirm(selectedStatus, selectedStatus === 'CANCELLED' ? reason : undefined);
        }
    };

    if (!movement) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-[1.5rem] bg-card">
                <DialogHeader className="p-6 bg-muted/20 border-b border-border/40">
                    <DialogTitle className="text-lg font-black text-foreground uppercase tracking-tight flex items-center gap-2">
                        Actualizar Estado del Movimiento
                    </DialogTitle>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                        Referencia: {movement.referenceCode || movement.id.slice(0, 8).toUpperCase()}
                    </p>
                </DialogHeader>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => setSelectedStatus(MovementStatus.COMPLETED)}
                            disabled={isLoading}
                            className={cn(
                                "flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all gap-3",
                                selectedStatus === MovementStatus.COMPLETED
                                    ? "bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/20"
                                    : "bg-muted/30 border-border hover:bg-muted/50"
                            )}
                        >
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                                selectedStatus === MovementStatus.COMPLETED ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
                            )}>
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <span className={cn(
                                "text-xs font-black uppercase tracking-wider",
                                selectedStatus === MovementStatus.COMPLETED ? "text-emerald-600" : "text-muted-foreground"
                            )}>
                                Completar
                            </span>
                        </button>

                        <button
                            onClick={() => setSelectedStatus(MovementStatus.CANCELLED)}
                            disabled={isLoading}
                            className={cn(
                                "flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all gap-3",
                                selectedStatus === MovementStatus.CANCELLED
                                    ? "bg-rose-500/10 border-rose-500 ring-2 ring-rose-500/20"
                                    : "bg-muted/30 border-border hover:bg-muted/50"
                            )}
                        >
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                                selectedStatus === MovementStatus.CANCELLED ? "bg-rose-500 text-white" : "bg-muted text-muted-foreground"
                            )}>
                                <XCircle className="w-5 h-5" />
                            </div>
                            <span className={cn(
                                "text-xs font-black uppercase tracking-wider",
                                selectedStatus === MovementStatus.CANCELLED ? "text-rose-600" : "text-muted-foreground"
                            )}>
                                Cancelar
                            </span>
                        </button>
                    </div>

                    {selectedStatus === MovementStatus.CANCELLED && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                <AlertCircle className="w-3 h-3" />
                                Motivo de Cancelación
                            </Label>
                            <Textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Escribe el motivo detallado..."
                                className="min-h-[100px] bg-muted/20 border-border rounded-xl text-xs font-medium focus:bg-background transition-colors placeholder:text-muted-foreground/40"
                            />
                        </div>
                    )}
                </div>

                <div className="p-6 bg-muted/10 border-t border-border/40 flex items-center gap-3">
                    <Button
                        variant="ghost"
                        onClick={handleClose}
                        disabled={isLoading}
                        className="flex-1 h-11 text-[11px] font-black uppercase tracking-widest text-muted-foreground rounded-xl"
                    >
                        Volver
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={isLoading || !selectedStatus || (selectedStatus === 'CANCELLED' && !reason.trim())}
                        className={cn(
                            "flex-1 h-11 text-[11px] font-black uppercase tracking-widest rounded-xl shadow-lg transition-all",
                            selectedStatus === 'CANCELLED' ? "bg-rose-500 hover:bg-rose-600 shadow-rose-500/20" : "bg-primary hover:bg-primary/90 shadow-primary/20"
                        )}
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            'Confirmar Cambio'
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
