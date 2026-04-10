import { fireEvent, render, screen, waitFor } from '@/tests/test-utils';
import ForgotPasswordPage from './ForgotPasswordPage';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { toastErrorMock } = vi.hoisted(() => ({
  toastErrorMock: vi.fn(),
}));

vi.mock('axios', async () => {
  const actual = await vi.importActual<typeof import('axios')>('axios');
  return {
    ...actual,
    isAxiosError: (error: unknown) => Boolean((error as { isAxiosError?: boolean })?.isAxiosError),
  };
});

vi.mock('sonner', () => ({
  toast: {
    error: toastErrorMock,
  },
}));

vi.mock('@/services/auth.service', () => ({
  authService: {
    forgotPassword: vi.fn(),
  },
}));

vi.mock('./components/AuthTurnstile', () => ({
  AuthTurnstile: ({ onTokenChange }: { onTokenChange: (token: string) => void }) => {
    React.useEffect(() => {
      onTokenChange('turnstile-token');
    }, [onTokenChange]);
    return <div>turnstile</div>;
  },
}));

vi.mock('./components/AuthHeader', () => ({
  AuthHeader: ({ title }: { title: string }) => <div>{title}</div>,
}));

vi.mock('./components/SuccessModal', () => ({
  SuccessModal: ({ isOpen, email }: { isOpen: boolean; email: string }) => (
    isOpen ? <div>success:{email}</div> : null
  ),
}));

import { authService } from '@/services/auth.service';
import React from 'react';

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('validates the email field before submit', async () => {
    render(<ForgotPasswordPage />);

    const emailInput = screen.getByLabelText(/correo electrónico/i) as HTMLInputElement;
    fireEvent.input(emailInput, { target: { value: 'invalid' } });
    expect(emailInput.value).toBe('invalid');
    fireEvent.submit(screen.getByRole('button', { name: /enviar instrucciones/i }).closest('form')!);

    expect(await screen.findByText(/correo válido/i)).toBeInTheDocument();
    expect(authService.forgotPassword).not.toHaveBeenCalled();
  });

  it('shows success modal after a successful submit', async () => {
    vi.mocked(authService.forgotPassword).mockResolvedValue({ success: true } as never);

    render(<ForgotPasswordPage />);

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'ana@test.com' } });
    fireEvent.click(screen.getByRole('button', { name: /enviar instrucciones/i }));

    await waitFor(() => expect(authService.forgotPassword).toHaveBeenCalledWith({ email: 'ana@test.com', turnstileToken: 'turnstile-token' }));
    expect(screen.getByText('success:ana@test.com')).toBeInTheDocument();
  });

  it('shows backend errors when submit fails', async () => {
    vi.mocked(authService.forgotPassword).mockRejectedValue({
      isAxiosError: true,
      response: { data: { message: 'No se pudo enviar' } },
    });

    render(<ForgotPasswordPage />);

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'ana@test.com' } });
    fireEvent.click(screen.getByRole('button', { name: /enviar instrucciones/i }));

    await waitFor(() => expect(toastErrorMock).toHaveBeenCalledWith('No se pudo enviar'));
  });
});
