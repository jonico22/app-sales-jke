import { Store, BadgeCheck, Hash, Coins, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { useSocietyStore } from '@/store/society.store';
import { Button } from '@/components/ui/button';

export function BusinessHeader() {
  const navigate = useNavigate();
  const society = useSocietyStore((state) => state.society);
  const role = useAuthStore((state) => state.role);

  if (!society) {
    return null;
  }

  // Get the first tax (usually IGV)
  const mainTax = society.taxes?.[0];

  return (
    <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Left: Logo and Info */}
        <div className="flex items-center gap-4">
          {/* Logo/Icon */}
          <div className="p-2 rounded-2xl flex-shrink-0 border border-border bg-muted/30">
            {society.logo ? (
              <img
                src={society.logo.path}
                alt={society.name}
                className="h-10 w-10 object-contain"
              />
            ) : (
              <Store className="h-8 w-8 text-primary" />
            )}
          </div>

          {/* Business Info */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-lg font-bold text-foreground">{society.name}</h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-primary text-[10px] font-bold uppercase tracking-wide rounded-full bg-primary/10">
                <BadgeCheck className="h-3 w-3" />
                Verificada
              </span>
            </div>

            {/* Details */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              {society.legalEntity?.documentNumber && (
                <div className="flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5 text-muted-foreground/50" />
                  <span>RUC: <strong className="text-foreground font-semibold">{society.legalEntity.documentNumber}</strong></span>
                </div>
              )}

              {society.mainCurrency && (
                <div className="flex items-center gap-1.5">
                  <Coins className="h-3.5 w-3.5 text-muted-foreground/50" />
                  <span>Moneda: <strong className="text-foreground font-semibold">{society.mainCurrency.name} ({society.mainCurrency.code})</strong></span>
                </div>
              )}

              {mainTax && (
                <div className="flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground/50" />
                  <span>Impuesto: <strong className="text-foreground font-semibold">{mainTax.code} {mainTax.value}%</strong></span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Action Button */}
        {role?.name?.toLowerCase() === 'titular' && (
          <Button
            variant="outline"
            className="h-9 px-4 text-[11px] font-bold uppercase tracking-wider border-border text-muted-foreground hover:text-primary hover:border-primary/30 bg-card transition-all"
            onClick={() => navigate('/settings')}
          >
            Editar Perfil
          </Button>
        )}
      </div>
    </div>
  );
}
