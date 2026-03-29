interface PlanUsageMetricsProps {
  currentUsers: number;
  maxUsers: number;
  userPercent: number;
  currentProducts: number;
  maxProducts: number;
  productPercent: number;
  currentStorageStr: string;
  maxStorageMB: number;
  storagePercent: number;
}

export function PlanUsageMetrics({
  currentUsers,
  maxUsers,
  userPercent,
  currentProducts,
  maxProducts,
  productPercent,
  currentStorageStr,
  maxStorageMB,
  storagePercent
}: PlanUsageMetricsProps) {
  return (
    <div className="flex flex-col gap-5 pt-6 border-t border-border">
      {/* Users Progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <span className="font-bold text-foreground text-xs uppercase tracking-wider">Usuarios</span>
          <div className="text-right">
            <span className="text-sm font-bold text-foreground">{currentUsers}</span>
            <span className="text-xs font-medium text-muted-foreground ml-1">
              / {maxUsers}
            </span>
          </div>
        </div>
        <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-sky-500 rounded-full transition-all duration-500"
            style={{ width: `${userPercent}%` }}
          />
        </div>
        <p className="text-[11px] text-muted-foreground italic">
          {Math.max(0, maxUsers - currentUsers)} espacios disponibles
        </p>
      </div>

      {/* Products Progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <span className="font-bold text-foreground text-xs uppercase tracking-wider">Productos</span>
          <div className="text-right">
            <span className="text-sm font-bold text-foreground">{currentProducts.toLocaleString()}</span>
            <span className="text-xs font-medium text-muted-foreground ml-1">
              / {maxProducts.toLocaleString()}
            </span>
          </div>
        </div>
        <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-sky-500 rounded-full transition-all duration-500"
            style={{ width: `${productPercent}%` }}
          />
        </div>
        <p className="text-[11px] text-muted-foreground italic">
          {Math.round(productPercent)}% de la capacidad utilizada
        </p>
      </div>

      {/* Storage Progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <span className="font-bold text-foreground text-xs uppercase tracking-wider">Almacenamiento</span>
          <div className="text-right">
            <span className="text-sm font-bold text-foreground">{currentStorageStr}</span>
            <span className="text-xs font-medium text-muted-foreground ml-1">
              / {maxStorageMB} MB
            </span>
          </div>
        </div>
        <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-sky-500 rounded-full transition-all duration-500"
            style={{ width: `${storagePercent}%` }}
          />
        </div>
        <p className="text-[11px] text-muted-foreground italic">
          {storagePercent > 0 && storagePercent < 1 ? '< 1' : Math.round(storagePercent)}% del espacio total utilizado
        </p>
      </div>
    </div>
  );
}
