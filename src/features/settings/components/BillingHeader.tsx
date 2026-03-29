interface BillingHeaderProps {
  isBeta: boolean;
}

export function BillingHeader({ isBeta }: BillingHeaderProps) {
  return (
    <div className="max-w-6xl mx-auto space-y-1">
      <h1 className="text-lg font-bold text-foreground tracking-tight uppercase">Suscripción y Facturación</h1>
      {isBeta && (
        <p className="text-muted-foreground text-xs">
          Acceso exclusivo durante la fase de Public Preview.
        </p>
      )}
    </div>
  );
}
