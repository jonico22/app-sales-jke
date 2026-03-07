import { useState } from 'react';
import { Rocket, Plus, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'dashboard_welcome_dismissed';

export function WelcomeBanner() {
  const [isDismissed, setIsDismissed] = useState(() => {
    return sessionStorage.getItem(STORAGE_KEY) === 'true';
  });

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem(STORAGE_KEY, 'true');
  };

  if (isDismissed) {
    return null;
  }

  return (
    <div className="bg-card rounded-2xl p-5 lg:pr-12 border border-border shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6 relative overflow-hidden">
      {/* Dismiss Button */}
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors z-10"
        aria-label="Cerrar"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <div className="flex items-start gap-4">
        <div className="bg-primary/10 p-2.5 rounded-full flex-shrink-0 border border-primary/20">
          <Rocket className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xs font-bold text-foreground uppercase tracking-wider mb-0.5">¡Bienvenido a JKE Solutions!</h2>
          <p className="text-[11px] text-muted-foreground max-w-2xl leading-relaxed">
            Tu dashboard administrativo está configurado. El siguiente paso es poblar tu inventario para que podamos procesar tus métricas en tiempo real.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full lg:w-auto">
        <Link
          to="/inventory/new"
          className="flex-1 lg:flex-none items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all shadow-sm shadow-primary/20 flex active:scale-95"
        >
          <Plus className="h-4 w-4" /> NUEVO PRODUCTO
        </Link>
      </div>
    </div>
  );
}
