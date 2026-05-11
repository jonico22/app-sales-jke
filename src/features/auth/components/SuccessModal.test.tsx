import { fireEvent, render, screen } from '@/tests/test-utils';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { SuccessModal } from './SuccessModal';

const assignMock = vi.fn();

vi.mock('@/components/ui/Modal', () => ({
  Modal: ({ isOpen, title, children }: { isOpen: boolean; title: string; children: React.ReactNode }) => (
    isOpen ? <div><span>{title}</span>{children}</div> : null
  ),
}));

describe('SuccessModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete (window as unknown as { location?: Location }).location;
    Object.assign(window, {
      location: { assign: assignMock },
    });
  });

  it('renders the submitted email and navigates back to login', () => {
    render(<SuccessModal isOpen={true} onClose={vi.fn()} email="ana@test.com" />);

    expect(screen.getByText(/correo enviado/i)).toBeInTheDocument();
    expect(screen.getByText(/ana@test.com/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /volver al inicio de sesión/i }));
    expect(assignMock).toHaveBeenCalledWith('/auth/login');
  });

  it('does not render when closed', () => {
    render(<SuccessModal isOpen={false} onClose={vi.fn()} email="ana@test.com" />);

    expect(screen.queryByText(/correo enviado/i)).not.toBeInTheDocument();
  });
});
