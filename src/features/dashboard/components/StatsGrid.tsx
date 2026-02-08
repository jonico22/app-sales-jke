import { type ReactNode } from 'react';
import { Monitor, AlertTriangle, TrendingUp, Sparkles } from 'lucide-react';

interface StatCardProps {
  icon: ReactNode;
  iconBgClass: string;
  badge: string;
  badgeColorClass: string;
  title: string;
  value: string;
  subtitle: string;
  subtitleColorClass?: string;
}

function StatCard({
  icon,
  iconBgClass,
  badge,
  badgeColorClass,
  title,
  value,
  subtitle,
  subtitleColorClass = 'text-slate-400',
}: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm min-h-[160px] flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl ${iconBgClass}`}>
          {icon}
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wider ${badgeColorClass}`}>
          {badge}
        </span>
      </div>

      {/* Content */}
      <div className="mt-4">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">{title}</p>
        <p className="text-3xl font-bold text-slate-800">{value}</p>
        <p className={`text-xs mt-1 ${subtitleColorClass}`}>{subtitle}</p>
      </div>
    </div>
  );
}

export function StatsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Valor Total Stock */}
      <StatCard
        icon={<Monitor className="h-5 w-5 text-cyan-600" />}
        iconBgClass="bg-cyan-50"
        badge="Global"
        badgeColorClass="text-slate-400"
        title="Valor Total Stock"
        value="S/ 0.00"
        subtitle="Esperando datos..."
      />

      {/* Bajo Stock */}
      <StatCard
        icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
        iconBgClass="bg-red-50"
        badge="Alerta"
        badgeColorClass="text-red-500"
        title="Bajo Stock"
        value="0 Items"
        subtitle="Todo al día"
        subtitleColorClass="text-emerald-500"
      />

      {/* Ventas Netas */}
      <StatCard
        icon={<TrendingUp className="h-5 w-5 text-violet-600" />}
        iconBgClass="bg-violet-50"
        badge="Este Mes"
        badgeColorClass="text-slate-400"
        title="Ventas Netas"
        value="S/ 0.00"
        subtitle="Sin transacciones"
      />

      {/* Productos Nuevos */}
      <StatCard
        icon={<Sparkles className="h-5 w-5 text-fuchsia-500" />}
        iconBgClass="bg-fuchsia-50"
        badge="Nuevos"
        badgeColorClass="text-slate-400"
        title="Productos Nuevos"
        value="0 Items"
        subtitle="Catálogo vacío"
      />
    </div>
  );
}
