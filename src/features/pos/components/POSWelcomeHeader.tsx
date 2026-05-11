import { PageHeader } from '@/components/shared/PageHeader';

export function POSWelcomeHeader() {
  return (
    <PageHeader
      title="Iniciar Nueva Venta"
      subtitle="Selecciona un cliente y escanea un producto para comenzar a registrar la venta."
      className="justify-center"
      contentClassName="items-center"
      headingClassName="flex-col items-center gap-4"
      textBlockClassName="max-w-md text-center"
      titleClassName="normal-case text-lg md:text-2xl"
      leading={(
        <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-xl md:rounded-2xl">
          <svg className="w-6 h-6 md:w-8 md:h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
        </div>
      )}
    />
  );
}
