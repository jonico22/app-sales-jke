import { fireEvent, render, screen } from '@/tests/test-utils';
import { GlobalErrorBoundary } from './GlobalErrorBoundary';
import { vi, describe, it, expect, beforeEach } from 'vitest';

const useRouteErrorMock = vi.fn();
const hrefAssignMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useRouteError: () => useRouteErrorMock(),
  };
});

describe('GlobalErrorBoundary', () => {
  beforeEach(() => {
    sessionStorage.clear();
    useRouteErrorMock.mockReset();
    hrefAssignMock.mockReset();
    delete (window as unknown as { location?: Location }).location;
    Object.assign(window, {
      location: {
        href: 'http://localhost/test',
      },
    });
  });

  it('renders a generic error state and reload button', () => {
    useRouteErrorMock.mockReturnValue(new Error('boom'));

    render(<GlobalErrorBoundary />);
    fireEvent.click(screen.getByRole('button', { name: /actualizar página/i }));

    expect(screen.getByText(/ha ocurrido un error inesperado/i)).toBeInTheDocument();
    expect(String(window.location.href)).toContain('v=');
  });

  it('handles chunk loading errors with a guarded reload flow', () => {
    useRouteErrorMock.mockReturnValue(new Error('Failed to fetch dynamically imported module'));

    render(<GlobalErrorBoundary />);

    expect(sessionStorage.getItem('global_chunk_reload')).toBe('true');
    expect(screen.getByText(/actualizando aplicación/i)).toBeInTheDocument();
    expect(String(window.location.href)).toContain('v=');
  });
});
