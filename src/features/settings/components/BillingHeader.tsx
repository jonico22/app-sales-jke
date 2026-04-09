import { PageHeader } from '@/components/shared/PageHeader';

interface BillingHeaderProps {
  isBeta: boolean;
}

export function BillingHeader({ isBeta }: BillingHeaderProps) {
  return (
    <PageHeader
      title="Suscripción y Facturación"
      subtitle={isBeta ? 'Acceso exclusivo durante la fase de Public Preview.' : undefined}
      className="max-w-6xl mx-auto"
    />
  );
}
