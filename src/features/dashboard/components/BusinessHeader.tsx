import { Store, BadgeCheck, Hash, Coins, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSocietyStore } from '@/store/society.store';
import { Button } from '@/components/ui';

export function BusinessHeader() {
  const navigate = useNavigate();
  const society = useSocietyStore((state) => state.society);

  if (!society) {
    return null;
  }

  // Get the first tax (usually IGV)
  const mainTax = society.taxes?.[0];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Left: Logo and Info */}
        <div className="flex items-center gap-4">
          {/* Logo/Icon */}
          <div className="p-2 rounded-2xl flex-shrink-0 border border-slate-100">
            {society.logo ? (
              <img
                src={society.logo.path}
                alt={society.name}
                className="h-10 w-10 object-contain"
              />
            ) : (
              <Store className="h-8 w-8 text-cyan-500" />
            )}
          </div>

          {/* Business Info */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-xl font-bold text-slate-800">{society.name}</h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-cyan-700 text-[10px] font-bold uppercase tracking-wide rounded-full">
                <BadgeCheck className="h-3 w-3" />
                Verificada
              </span>
            </div>

            {/* Details */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
              {society.legalEntity?.documentNumber && (
                <div className="flex items-center gap-1.5">
                  <Hash className="h-4 w-4 text-slate-400" />
                  <span>RUC: <strong className="text-slate-700">{society.legalEntity.documentNumber}</strong></span>
                </div>
              )}

              {society.mainCurrency && (
                <div className="flex items-center gap-1.5">
                  <Coins className="h-4 w-4 text-slate-400" />
                  <span>Moneda: <strong className="text-slate-700">{society.mainCurrency.name} ({society.mainCurrency.code})</strong></span>
                </div>
              )}

              {mainTax && (
                <div className="flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-slate-400" />
                  <span>Impuesto: <strong className="text-slate-700">{mainTax.code} {mainTax.value}%</strong></span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Action Button */}
        <Button
          variant="outline"
          className="border-slate-200 text-slate-600 hover:text-primary hover:border-primary/30"
          onClick={() => navigate('/settings')}
        >
          Editar Perfil
        </Button>
      </div>
    </div>
  );
}
