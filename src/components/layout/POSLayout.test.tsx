import { act, fireEvent, render, screen } from '@/tests/test-utils';
import POSLayout from './POSLayout';
import { vi, describe, it, expect, beforeEach } from 'vitest';

const listeners: Record<string, EventListener> = {};

vi.mock('@/hooks/useSessionValidator', () => ({
  useSessionValidator: vi.fn(() => ({
    isSessionExpired: false,
    handleRedirect: vi.fn(),
  })),
}));

vi.mock('./DashboardSidebar', () => ({
  default: ({ isOpen, isCollapsed, toggleCollapse }: { isOpen: boolean; isCollapsed: boolean; toggleCollapse: () => void }) => (
    <div>
      <span>pos-sidebar:{String(isOpen)}:{String(isCollapsed)}</span>
      <button onClick={toggleCollapse}>collapse-pos</button>
    </div>
  ),
}));

vi.mock('./POSHeader', () => ({
  POSHeader: ({ title, onMenuClick }: { title: string; onMenuClick: () => void }) => (
    <div>
      <span>{title}</span>
      <button onClick={onMenuClick}>toggle-pos-menu</button>
    </div>
  ),
}));

vi.mock('@/components/shared/SessionExpiredModal', () => ({
  SessionExpiredModal: ({ isOpen, onLogin }: { isOpen: boolean; onLogin: () => void }) => (
    <button onClick={onLogin}>pos-session-modal:{String(isOpen)}</button>
  ),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    Outlet: () => <div>pos outlet</div>,
  };
});

describe('POSLayout', () => {
  beforeEach(() => {
    vi.spyOn(window, 'addEventListener').mockImplementation((type, listener) => {
      listeners[type] = listener as EventListener;
    });
    vi.spyOn(window, 'removeEventListener').mockImplementation((type) => {
      delete listeners[type];
    });
  });

  it('renders title, outlet and toggles sidebar state', () => {
    render(<POSLayout title="Caja" />);

    expect(screen.getByText('Caja')).toBeInTheDocument();
    expect(screen.getByText('pos outlet')).toBeInTheDocument();
    expect(screen.getByText('pos-sidebar:false:false')).toBeInTheDocument();

    fireEvent.click(screen.getByText('toggle-pos-menu'));
    expect(screen.getByText('pos-sidebar:true:false')).toBeInTheDocument();

    fireEvent.click(screen.getByText('collapse-pos'));
    expect(screen.getByText('pos-sidebar:true:true')).toBeInTheDocument();
  });

  it('responds to resize events for collapse behavior', () => {
    render(<POSLayout />);

    act(() => {
      Object.defineProperty(window, 'innerWidth', { value: 800, configurable: true });
      listeners.resize?.(new Event('resize'));
    });

    expect(screen.getByText('pos-sidebar:false:true')).toBeInTheDocument();
  });
});
