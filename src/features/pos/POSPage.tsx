import { useState } from 'react';
import { Search, User, UserPlus, ChevronDown, LayoutGrid, History, Command, HelpCircle, ChevronRight } from 'lucide-react';
import { Button, Input } from '@/components/ui';

export default function POSPage() {
  const selectedClient = 'Público General';
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-50 rounded-2xl mb-4">
          <svg className="w-8 h-8 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Iniciar Nueva Venta</h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Selecciona un cliente y escanea un producto para comenzar a registrar la venta.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
        {/* Client Selector */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block">
            Cliente
          </label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <User className="h-5 w-5 text-slate-400" />
              </div>
              <button
                className="w-full h-12 pl-10 pr-10 text-left bg-white border border-slate-200 rounded-xl text-slate-700 font-medium hover:border-slate-300 transition-colors"
                onClick={() => {/* Open client selector modal */}}
              >
                {selectedClient}
              </button>
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <ChevronDown className="h-5 w-5 text-slate-400" />
              </div>
            </div>
            <Button
              variant="primary"
              size="icon"
              className="h-12 w-12 bg-cyan-500 hover:bg-cyan-600 rounded-xl"
              title="Nuevo Cliente"
            >
              <UserPlus className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Product Search */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Búsqueda de Producto
            </label>
            <button className="text-xs font-semibold text-cyan-600 hover:text-cyan-700 flex items-center gap-1">
              Búsqueda Avanzada
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <Input
              type="text"
              placeholder="Escanea o busca un producto para iniciar la venta"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 pl-12 pr-20 text-base border-2 border-cyan-200 bg-cyan-50/30 rounded-xl focus:border-cyan-400 focus:bg-white"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium bg-slate-100 px-2 py-1 rounded">F3</span>
              <button className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 mt-3">
            <button className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
              Más vendidos
            </button>
            <button className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
              Promociones
            </button>
            <button className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
              Últimos agregados
            </button>
          </div>
        </div>

        {/* View Catalog Button */}
        <button className="w-full flex items-center justify-between p-4 bg-cyan-50 hover:bg-cyan-100 rounded-xl border border-cyan-100 transition-colors group">
          <div className="flex items-center gap-3">
            <LayoutGrid className="h-5 w-5 text-cyan-600" />
            <div className="text-left">
              <p className="text-sm font-bold text-cyan-700 uppercase tracking-wide">Ver Catálogo Completo</p>
              <p className="text-xs text-cyan-600/70">Ideal para pedidos grandes y navegación visual</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-cyan-600 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center justify-center gap-8 pt-4">
        <button className="flex flex-col items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
            <History className="h-5 w-5" />
          </div>
          <span className="text-xs font-medium">Últimas Ventas</span>
        </button>
        <button className="flex flex-col items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
            <Command className="h-5 w-5" />
          </div>
          <span className="text-xs font-medium">Atajos</span>
        </button>
        <button className="flex flex-col items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
            <HelpCircle className="h-5 w-5 text-orange-500" />
          </div>
          <span className="text-xs font-medium">Ayuda</span>
        </button>
      </div>
    </div>
  );
}
