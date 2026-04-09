import { XCircle, Building2, QrCode, Copy, UploadCloud } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { type SubscriptionDetails } from '@/services/subscription.service';

interface RenewSubscriptionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  subscription: SubscriptionDetails;
  isFreeSub: boolean;
  isBetaSub: boolean;
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
  referenceCode: string;
  onReferenceCodeChange: (code: string) => void;
  file: File | null;
  onFileChange: (file: File | null) => void;
  onConfirm: () => void;
  isRenewing: boolean;
}

export function RenewSubscriptionModal({
  isOpen,
  onOpenChange,
  subscription,
  isFreeSub,
  isBetaSub,
  paymentMethod,
  onPaymentMethodChange,
  referenceCode,
  onReferenceCodeChange,
  file,
  onFileChange,
  onConfirm,
  isRenewing
}: RenewSubscriptionModalProps) {
  const accountInfo = {
    bank: 'BCP (Banco de Crédito)',
    accountNumber: '193-98765432-0-12',
    cci: '002-1939876543201245',
    owner: 'JKE Solutions S.A.C.',
    yapeNumber: '999 888 777'
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl p-0 border-0 shadow-2xl !rounded-xl overflow-hidden [&>button]:hidden">
        {/* Header */}
        <div className="flex justify-between items-center gap-3 px-4 py-3.5 sm:p-6 border-b border-border bg-card">
          <h3 className="text-base sm:text-lg font-semibold text-foreground">Renovar Suscripción</h3>
          <button
            onClick={() => onOpenChange(false)}
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            <XCircle className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[85vh] bg-card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
            {/* Left Column */}
            <div className="space-y-8">
              {/* Resumen */}
              <div>
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Resumen de Renovación</h4>
                <div className="bg-muted/20 rounded-xl p-5 border border-border">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs text-muted-foreground">Plan</span>
                    <span className="text-xs font-bold text-foreground">{subscription.plan.name}</span>
                  </div>
                  <div className="flex justify-between items-center mb-5">
                    <span className="text-xs text-muted-foreground">Periodo</span>
                    <span className="text-xs font-medium text-foreground">
                      {new Date(subscription.endDate).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })} - {new Date(new Date(subscription.endDate).setMonth(new Date(subscription.endDate).getMonth() + 1)).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="pt-4 border-t border-border/60 flex justify-between items-end">
                    <span className="text-sm font-bold text-foreground">Total</span>
                    <div className="text-right">
                      <span className="text-xl font-bold text-sky-500">
                        {isFreeSub ? 'S/ 0.00' : `$${subscription.plan.price.toFixed(2)}`}
                      </span>
                      {isBetaSub && <p className="text-[10px] text-sky-500 font-medium">(Fase Public Preview)</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Opciones de pago */}
              <div>
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Seleccionar Método de Pago</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => onPaymentMethodChange('TRANSFER')}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${paymentMethod === 'TRANSFER' ? 'border-primary bg-primary/5 text-primary shadow-sm' : 'border-border bg-card text-muted-foreground hover:border-border/80'}`}
                  >
                    <Building2 className={`h-6 w-6 ${paymentMethod === 'TRANSFER' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="text-xs font-bold uppercase">Transferencia</span>
                  </button>
                  <button
                    onClick={() => onPaymentMethodChange('YAPE')}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${paymentMethod === 'YAPE' ? 'border-primary bg-primary/5 text-primary shadow-sm' : 'border-border bg-card text-muted-foreground hover:border-border/80'}`}
                  >
                    <QrCode className={`h-6 w-6 ${paymentMethod === 'YAPE' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="text-xs font-bold uppercase">Yape / Plin</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div>
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Datos de Depósito</h4>
              <div className="border border-border bg-card rounded-xl p-6 shadow-sm h-full min-h-[250px] flex flex-col justify-center">
                {paymentMethod === 'TRANSFER' ? (
                  <div className="space-y-6">
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Banco</span>
                      <p className="text-xs font-bold text-foreground">{accountInfo.bank}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Número de Cuenta</span>
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-foreground font-mono">{accountInfo.accountNumber}</p>
                        <button
                          onClick={() => handleCopy(accountInfo.accountNumber)}
                          className="text-sky-500 hover:text-sky-600 p-1 rounded hover:bg-sky-50 transition-colors"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">CCI (Interbancario)</span>
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-foreground font-mono">{accountInfo.cci}</p>
                        <button
                          onClick={() => handleCopy(accountInfo.cci)}
                          className="text-sky-500 hover:text-sky-600 p-1 rounded hover:bg-sky-50 transition-colors"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Titular</span>
                      <p className="text-xs font-medium text-foreground">{accountInfo.owner}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full space-y-5">
                    <div className="h-32 w-32 bg-card border border-border shadow-sm rounded-xl flex items-center justify-center p-2">
                      <QrCode className="h-full w-full text-muted-foreground/20" strokeWidth={1} />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-foreground uppercase">Yape / Plin</p>
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <p className="text-lg font-mono font-bold text-sky-600">{accountInfo.yapeNumber}</p>
                        <button
                          onClick={() => handleCopy(accountInfo.yapeNumber.replace(/\s/g, ''))}
                          className="text-sky-500 hover:text-sky-600 p-1 rounded hover:bg-sky-50 transition-colors"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{accountInfo.owner}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-slate-100 pt-6">
            <h4 className="text-sm font-bold text-foreground uppercase tracking-tight mb-5">Cargar Comprobante de Pago</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                  N° de Operación / Referencia
                </label>
                <input
                  type="text"
                  value={referenceCode}
                  onChange={(e) => onReferenceCodeChange(e.target.value)}
                  placeholder="Ej. 12345678"
                  className="w-full border border-border rounded-lg px-4 py-2.5 text-xs bg-muted/30 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                  Subir comprobante de pago (PDF/Image)
                </label>
                <div className="border border-dashed border-border rounded-lg px-4 py-0 bg-muted/30 flex items-center gap-3 cursor-pointer hover:bg-muted transition-colors relative w-full h-[42px]">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => onFileChange(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <UploadCloud className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                  <span className="text-xs text-muted-foreground truncate flex-1">
                    {file ? file.name : 'Seleccionar archivo...'}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed max-w-2xl">
              Nota: Su renovación será procesada una vez que nuestro equipo valide el comprobante enviado (generalmente en menos de 24h).
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-border bg-card">
          <button
            onClick={() => onOpenChange(false)}
            disabled={isRenewing}
            className="w-full sm:w-auto px-5 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            className={`w-full sm:w-auto px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 sm:min-w-[180px] ${isRenewing || !file || !referenceCode ? 'opacity-70 cursor-not-allowed' : ''}`}
            onClick={onConfirm}
            disabled={isRenewing || !file || !referenceCode}
          >
            {isRenewing ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Enviando...</span>
              </>
            ) : (
              <span>Enviar Comprobante</span>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
