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
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6 relative">
      {/* Dismiss Button */}
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        aria-label="Cerrar"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-4 pr-8">
        <div className="bg-cyan-50 p-3 rounded-full flex-shrink-0">
          <Rocket className="h-6 w-6 text-cyan-500" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-1">¡Bienvenido a JKE Solutions!</h2>
          <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
            Tu dashboard administrativo está configurado. El siguiente paso es poblar tu inventario para que podamos procesar tus métricas en tiempo real.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full lg:w-auto">
        <Link
          to="/inventory/new"
          className="flex-1 lg:flex-none items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex"
        >
          <Plus className="h-4 w-4" /> NUEVO PRODUCTO
        </Link>
      </div>
    </div>
  );
}
