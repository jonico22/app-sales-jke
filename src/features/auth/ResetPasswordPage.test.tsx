import { fireEvent, render, screen, waitFor } from '@/tests/test-utils';
import ResetPasswordPage from './ResetPasswordPage';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  toastSuccessMock,
  toastErrorMock,
  assignMock,
} = vi.hoisted(() => ({
  toastSuccessMock: vi.fn(),
  toastErrorMock: vi.fn(),
  assignMock: vi.fn(),
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
    success: toastSuccessMock,
    error: toastErrorMock,
  },
}));

vi.mock('@/services/auth.service', () => ({
  authService: {
    resetPassword: vi.fn(),
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

vi.mock('./components/PasswordInput', () => ({
  PasswordInput: ({
    label,
    error,
    ...props
  }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: { message?: string } }) => (
    <div>
      <label htmlFor={String(props.id)}>{label}</label>
      <input {...props} />
      {error?.message ? <span>{error.message}</span> : null}
    </div>
  ),
}));

vi.mock('./components/PasswordStrengthMeter', () => ({
  PasswordStrengthMeter: ({ password }: { password: string }) => <div>strength:{password}</div>,
}));

import { authService } from '@/services/auth.service';
import React from 'react';

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete (window as unknown as { location?: Location }).location;
    Object.assign(window, {
      location: { assign: assignMock, search: '?token=abc123' },
    });
  });

  it('validates password rules before submit', async () => {
    render(<ResetPasswordPage />);

    fireEvent.input(screen.getByLabelText('Nueva Contraseña'), { target: { value: '123' } });
    fireEvent.input(screen.getByLabelText('Confirmar Nueva Contraseña'), { target: { value: '123' } });
    fireEvent.submit(screen.getByRole('button', { name: /actualizar contraseña/i }).closest('form')!);

    expect(await screen.findByText(/símbolo especial/i)).toBeInTheDocument();
    expect(authService.resetPassword).not.toHaveBeenCalled();
  });

  it('submits a valid password reset and redirects to login', async () => {
    vi.mocked(authService.resetPassword).mockResolvedValue({ success: true } as never);

    render(<ResetPasswordPage />);

    fireEvent.change(screen.getByLabelText('Nueva Contraseña'), { target: { value: 'Password1!' } });
    fireEvent.change(screen.getByLabelText('Confirmar Nueva Contraseña'), { target: { value: 'Password1!' } });
    fireEvent.click(screen.getByRole('button', { name: /actualizar contraseña/i }));

    await waitFor(() => expect(authService.resetPassword).toHaveBeenCalledWith({
      token: 'abc123',
      newPassword: 'Password1!',
      turnstileToken: 'turnstile-token',
    }));
    expect(toastSuccessMock).toHaveBeenCalled();
    expect(assignMock).toHaveBeenCalledWith('/auth/login');
  });

  it('shows a token error before calling the API', async () => {
    delete (window as unknown as { location?: Location }).location;
    Object.assign(window, {
      location: { assign: assignMock, search: '' },
    });

    render(<ResetPasswordPage />);

    fireEvent.change(screen.getByLabelText('Nueva Contraseña'), { target: { value: 'Password1!' } });
    fireEvent.change(screen.getByLabelText('Confirmar Nueva Contraseña'), { target: { value: 'Password1!' } });
    fireEvent.click(screen.getByRole('button', { name: /actualizar contraseña/i }));

    await waitFor(() => expect(toastErrorMock).toHaveBeenCalledWith('Token inválido o faltante.'));
    expect(authService.resetPassword).not.toHaveBeenCalled();
  });
});
