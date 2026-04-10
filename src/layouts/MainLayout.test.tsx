import { render, screen } from '@/tests/test-utils';
import MainLayout from './MainLayout';
import { vi, describe, it, expect } from 'vitest';

vi.mock('@/components/layout/DashboardHeader', () => ({
  default: () => <div>dashboard header</div>,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    Outlet: () => <div>main outlet</div>,
  };
});

describe('MainLayout', () => {
  it('renders header, outlet and footer', () => {
    render(<MainLayout />);

    expect(screen.getByText('dashboard header')).toBeInTheDocument();
    expect(screen.getByText('main outlet')).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${new Date().getFullYear()}`))).toBeInTheDocument();
  });
});
