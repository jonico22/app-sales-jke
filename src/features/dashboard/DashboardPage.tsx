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
      <div className="bg-card rounded-2xl p-6 border border-border shadow-sm min-h-[400px]">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3 border-l-4 border-primary pl-3 h-6">
            <span className="font-bold text-foreground uppercase tracking-wide text-xs">Ventas vs Compras</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            <span className="cursor-pointer hover:text-foreground transition-colors">Semana</span>
            <span className="cursor-pointer hover:text-foreground transition-colors">Mes</span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-border rounded-xl bg-muted/20">
          <div className="bg-muted/50 p-4 rounded-full shadow-sm mb-4 border border-border">
            <BarChart3 className="h-8 w-8 text-muted-foreground/30" />
          </div>
          <h3 className="text-foreground font-semibold mb-1 text-sm">Aún no hay transacciones para mostrar</h3>
          <p className="text-xs text-muted-foreground">Tus gráficos de ventas y compras aparecerán aquí.</p>
        </div>
      </div>

      {/* 4. Bottom Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Categories */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col border-l-4 border-primary pl-3">
              <span className="font-bold text-foreground uppercase tracking-wide text-xs">Stock por Categoría</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">Total: 0 Items</span>
            </div>
            <button className="text-muted-foreground hover:text-foreground transition-colors"><MoreVertical className="h-4 w-4" /></button>
          </div>

          <div className="flex flex-col items-center justify-center h-64 border border-dashed border-border rounded-xl bg-muted/10">
            <div className="bg-muted/50 p-3 rounded-full mb-3 border border-border">
              <Shapes className="h-6 w-6 text-muted-foreground/30" />
            </div>
            <p className="text-[11px] font-bold text-muted-foreground text-center max-w-[200px] mb-4">
              AGREGAR TUS PRIMEROS PRODUCTOS PARA VER ESTADÍSTICAS
            </p>
            <button className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wide">
              Ir a Inventario →
            </button>
          </div>
        </div>

        {/* Best Sellers */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col border-l-4 border-primary pl-3">
              <span className="font-bold text-foreground uppercase tracking-wide text-xs">Productos más Vendidos</span>
            </div>
            <button className="text-muted-foreground hover:text-foreground transition-colors"><MoreVertical className="h-4 w-4" /></button>
          </div>

          <div className="flex flex-col items-center justify-center h-64 border border-dashed border-border rounded-xl bg-muted/10">
            <div className="bg-muted/50 p-3 rounded-full mb-3 border border-border">
              <Star className="h-6 w-6 text-muted-foreground/30" />
            </div>
            <p className="text-[11px] font-bold text-muted-foreground text-center max-w-[200px] mb-2">
              AGREGAR TUS PRIMEROS PRODUCTOS PARA VER ESTADÍSTICAS
            </p>
            <p className="text-[10px] text-muted-foreground">Identifica tus items estrella rápidamente.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
