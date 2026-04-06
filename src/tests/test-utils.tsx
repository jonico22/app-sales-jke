import React from 'react';
import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * Crea un QueryClient fresco para cada test para asegurar el aislamiento.
 */
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Desactivar reintentos para tests más rápidos cuando fallan
        gcTime: 0,    // Limpiar caché inmediatamente
      },
      mutations: {
        retry: false,
      },
    },
  });

/**
 * Wrapper personalizado para tests que requieren proveedores (React Query, etc.)
 */
interface AllTheProvidersProps {
  children: React.ReactNode;
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  const testQueryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={testQueryClient}>
      {children}
    </QueryClientProvider>
  );
};

const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-exportar todo de testing-library
export * from '@testing-library/react';

// Sobrescribir el render de testing-library
export { renderWithProviders as render };
