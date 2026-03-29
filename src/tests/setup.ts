import '@testing-library/jest-dom';
import '@/index.css'; // Soporte para Tailwind 4 en tests
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { act } from 'react';

// 1. Configuración de MSW para tus APIs (Ventas/Inventario)
// Aquí puedes importar tus handlers específicos
export const server = setupServer(); // Expandir con handlers conforme se necesiten

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
  
  // 2. Limpieza de Zustand (Reset automático entre tests)
  // Reseteamos los estados de los stores principales
  resetAllStores();
});
afterAll(() => server.close());

// 3. Utilidad para resetear todos los stores de Zustand
// Importamos los hooks de los stores para acceder a su API interna (.getState().reset() o similar)
import { useAuthStore } from '@/store/auth.store';
import { useSocietyStore } from '@/store/society.store';
import { useBranchStore } from '@/store/branch.store';
import { useCartStore } from '@/store/cart.store';

const resetAllStores = () => {
  act(() => {
    // Para stores con persistencia, a veces es necesario limpiar el storage manual
    localStorage.clear();
    
    // Reseteamos el estado interno de cada store (si tienen un método específico o manualmente)
    // Nota: Como Zustand guarda el estado fuera de React, usamos .setState() con el estado inicial
    
    // Auth Store reset
    useAuthStore.setState({
      token: null,
      user: null,
      role: null,
      subscription: null,
      modulePermissions: null,
      isAuthenticated: false
    });

    // Society Store reset
    useSocietyStore.setState({
      society: null
    });

    // Branch Store reset
    useBranchStore.setState({
      branches: [],
      selectedBranch: null
    });

    // Cart Store reset
    useCartStore.setState({
      items: [],
      currentOrderId: null,
      currentOrderCode: null,
      currentOrderTotal: 0,
      discount: 0,
      orderNotes: ''
    });
  });
};

// 4. Mocks de navegador globales para JSDOM
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock de ResizeObserver
vi.stubGlobal('ResizeObserver', vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})));
