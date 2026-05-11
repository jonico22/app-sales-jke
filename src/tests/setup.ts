import '@testing-library/jest-dom';
import '@/index.css'; // Soporte para Tailwind 4 en tests
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { act } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useSocietyStore } from '@/store/society.store';
import { useBranchStore } from '@/store/branch.store';
import { useCartStore } from '@/store/cart.store';

export const server = setupServer(); // Expandir con handlers conforme se necesiten

const STATIC_ASSET_PATTERN = /\.(css|less|scss|sass|png|jpg|jpeg|gif|svg|webp|ico|woff2?|ttf|otf)$/i;

const isIgnoredUnhandledRequest = (url: URL) => {
  if (url.protocol === 'data:' || url.protocol === 'blob:') return true;
  if (STATIC_ASSET_PATTERN.test(url.pathname)) return true;
  if (url.hostname === '127.0.0.1' || url.hostname === 'localhost') return true;
  if (url.hostname.includes('dicebear.com')) return true;
  return false;
};

beforeAll(() =>
  server.listen({
    onUnhandledRequest(request) {
      const url = new URL(request.url);

      if (isIgnoredUnhandledRequest(url)) {
        return;
      }

      throw new Error(
        `Unhandled ${request.method} request in tests: ${url.toString()}. Add an MSW handler or mock the service explicitly.`,
      );
    },
  }),
);
afterEach(() => {
  cleanup();
  server.resetHandlers();
  
  // 2. Limpieza de Zustand (Reset automático entre tests)
  // Reseteamos los estados de los stores principales
  resetAllStores();
});
afterAll(() => server.close());

const resetAllStores = () => {
  act(() => {
    localStorage.clear();

    useAuthStore.setState({
      token: null,
      user: null,
      role: null,
      subscription: null,
      modulePermissions: null,
      isAuthenticated: false,
      isAuthResolved: false,
    });

    useSocietyStore.setState({
      society: null
    });

    useBranchStore.setState({
      branches: [],
      selectedBranch: null
    });

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

vi.stubGlobal('ResizeObserver', vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})));
