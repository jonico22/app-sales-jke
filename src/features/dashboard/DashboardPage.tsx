import { Rocket, FileDown, Plus, BarChart3, Shapes, Star, MoreVertical } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subValue: string;
  subText: string;
  colorClass: string;
  textColorClass: string;
}

function StatCard({ title, value, subValue, subText, colorClass, textColorClass }: StatCardProps) {
  return (
    <div className={`p-6 rounded-2xl ${colorClass} min-h-[140px] flex flex-col justify-between`}>
      <h3 className={`text-xs font-bold uppercase tracking-wider ${textColorClass}`}>{title}</h3>
      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-slate-800">{value}</span>
          <span className="text-xs font-medium text-slate-500 px-1.5 py-0.5 bg-white/50 rounded-full">{subValue}</span>
        </div>
        <p className={`text-[10px] font-medium mt-1 uppercase ${textColorClass} opacity-70`}>{subText}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* 1. Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Valor Total de Stock"
          value="$0.00"
          subValue="— 0%"
          subText="Sin datos previos"
          colorClass="bg-[#E0F7FA]" // Cyan-ish light
          textColorClass="text-[#006064]"
        />
        <StatCard 
          title="Productos Bajo Stock"
          value="0 Items"
          subValue=""
          subText="Sin alertas"
          colorClass="bg-[#FFF3E0]" // Orange-ish light
          textColorClass="text-[#E65100]"
        />
        <StatCard 
          title="Ventas del Mes"
          value="$0.00"
          subValue="— 0%"
          subText="Sin actividad reciente"
          colorClass="bg-[#E8EAF6]" // Indigo-ish light
          textColorClass="text-[#283593]"
        />
        <StatCard 
          title="Nuevos Productos"
          value="0 Items"
          subValue="+ New"
          subText="Inventario Vacío"
          colorClass="bg-[#F5F5F5]" // Grey-ish light
          textColorClass="text-[#424242]"
        />
      </div>

      {/* 2. Welcome Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="bg-cyan-50 p-3 rounded-full flex-shrink-0">
            <Rocket className="h-6 w-6 text-cyan-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-1">Primeros Pasos</h2>
            <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
              Bienvenido a JKE Solutions. Tu dashboard está listo. Comienza importando tus productos o creando tu primera transacción para ver tus estadísticas cobrar vida.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <button className="flex-1 lg:flex-none items-center justify-center gap-2 bg-[#0ea5e9] hover:bg-[#0284c7] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex">
            <FileDown className="h-4 w-4" /> IMPORTAR PRODUCTOS
          </button>
          <button className="flex-1 lg:flex-none items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex">
            <Plus className="h-4 w-4" /> CREAR VENTA
          </button>
        </div>
      </div>

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
