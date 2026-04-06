import { AlertTriangle, CheckCircle2, Lock, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface ValidationItem {
    ok: boolean;
    msg: string;
}

interface CashClosingFooterProps {
    observations: string;
    setObservations: (val: string) => void;
    validations: ValidationItem[];
    isSubmitting: boolean;
    onConfirmClose: () => void;
}

export function CashClosingFooter({
    observations,
    setObservations,
    validations,
    isSubmitting,
    onConfirmClose
}: CashClosingFooterProps) {
    const navigate = useNavigate();

    return (
        <>
            <div className="grid md:grid-cols-2 gap-4">
                {/* Observations */}
                <div className="bg-card border border-border rounded-2xl p-5 space-y-3 shadow-sm">
                    <h3 className="text-[11px] font-black text-foreground uppercase tracking-wider">
                        Observaciones del Cierre
                    </h3>
                    <textarea
                        value={observations}
                        onChange={(e) => setObservations(e.target.value)}
                        rows={5}
                        placeholder="Ingrese cualquier discrepancia, nota sobre billetes falsos, o gastos extraordinarios..."
                        className="w-full resize-none bg-muted/50 border border-border rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>

                {/* Validation Summary */}
                <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-5 space-y-3 shadow-sm">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        <h3 className="text-[11px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                            Resumen de Validación
                        </h3>
                    </div>
                    <ul className="space-y-2.5">
                        {validations.map((v, i) => (
                            <li key={i} className="flex items-start gap-2.5">
                                {v.ok ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-px" />
                                ) : (
                                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-px" />
                                )}
                                <span className={`text-xs font-semibold ${v.ok ? 'text-foreground' : 'text-amber-600 dark:text-amber-400'}`}>
                                    {v.msg}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                    onClick={() => navigate('/pos')}
                    className="flex-1 sm:flex-none sm:w-44 h-12 rounded-xl border border-border bg-card text-foreground text-[11px] font-black uppercase tracking-wider hover:bg-muted transition-all active:scale-95"
                >
                    Cancelar y Revisar
                </button>
                <button
                    onClick={onConfirmClose}
                    disabled={isSubmitting}
                    className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Procesando...
                        </>
                    ) : (
                        <>
                            <Lock className="w-4 h-4" />
                            Confirmar Arqueo y Cerrar Caja
                        </>
                    )}
                </button>
            </div>
        </>
    );
}
