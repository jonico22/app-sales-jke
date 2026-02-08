import { BarChart3, Shapes, Star, MoreVertical } from 'lucide-react';
import { WelcomeBanner } from './components/WelcomeBanner';
import { StatsGrid } from './components/StatsGrid';
import { BusinessHeader } from './components/BusinessHeader';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* 0. Business Header */}
      <BusinessHeader />

      {/* 1. Stats Grid */}
      <StatsGrid />

      {/* 2. Welcome Section */}
      <WelcomeBanner />

      {/* 3. Main Chart Placeholder */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm min-h-[400px]">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3 border-l-4 border-[#0ea5e9] pl-3 h-6">
            <span className="font-bold text-slate-700 uppercase tracking-wide text-xs">Ventas vs Compras</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span className="cursor-pointer hover:text-slate-600">Semana</span>
            <span className="cursor-pointer hover:text-slate-600">Mes</span>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
          <div className="bg-white p-4 rounded-full shadow-sm mb-4">
            <BarChart3 className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-slate-600 font-semibold mb-1">Aún no hay transacciones para mostrar</h3>
          <p className="text-xs text-slate-400">Tus gráficos de ventas y compras aparecerán aquí.</p>
        </div>
      </div>

      {/* 4. Bottom Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Categories */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
           <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col border-l-4 border-[#0ea5e9] pl-3">
              <span className="font-bold text-slate-700 uppercase tracking-wide text-xs">Stock por Categoría</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Total: 0 Items</span>
            </div>
            <button className="text-slate-400 hover:text-slate-600"><MoreVertical className="h-4 w-4" /></button>
          </div>
          
          <div className="flex flex-col items-center justify-center h-64 border border-dashed border-slate-100 rounded-xl">
             <div className="bg-slate-50 p-3 rounded-full mb-3">
                <Shapes className="h-6 w-6 text-slate-300" />
             </div>
             <p className="text-xs font-bold text-slate-600 text-center max-w-[200px] mb-4">
               AGREGAR TUS PRIMEROS PRODUCTOS PARA VER ESTADÍSTICAS
             </p>
             <button className="text-[10px] font-bold text-[#0ea5e9] hover:underline uppercase tracking-wide">
               Ir a Inventario →
             </button>
          </div>
        </div>

        {/* Best Sellers */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
           <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col border-l-4 border-[#0ea5e9] pl-3">
              <span className="font-bold text-slate-700 uppercase tracking-wide text-xs">Productos más Vendidos</span>
            </div>
            <button className="text-slate-400 hover:text-slate-600"><MoreVertical className="h-4 w-4" /></button>
          </div>
          
           <div className="flex flex-col items-center justify-center h-64 border border-dashed border-slate-100 rounded-xl">
             <div className="bg-slate-50 p-3 rounded-full mb-3">
                <Star className="h-6 w-6 text-slate-300" />
             </div>
             <p className="text-xs font-bold text-slate-600 text-center max-w-[200px] mb-2">
               AGREGAR TUS PRIMEROS PRODUCTOS PARA VER ESTADÍSTICAS
             </p>
             <p className="text-[10px] text-slate-400">Identifica tus items estrella rápidamente.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
