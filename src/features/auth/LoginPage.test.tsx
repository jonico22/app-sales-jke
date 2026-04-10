import { fireEvent, render, screen, waitFor } from '@/tests/test-utils';
import LoginPage from './LoginPage';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  loginMock,
  removeQueriesMock,
  toastSuccessMock,
  toastErrorMock,
  assignMock,
} = vi.hoisted(() => ({
  loginMock: vi.fn(),
  removeQueriesMock: vi.fn(),
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
    login: vi.fn(),
  },
}));

vi.mock('@/services/society.service', () => ({
  societyService: {
    getCurrent: vi.fn(),
  },
}));

vi.mock('@/store/auth.store', () => ({
  useAuthStore: vi.fn((selector: (state: { login: typeof loginMock }) => unknown) =>
    selector({ login: loginMock })
  ),
}));

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual<typeof import('@tanstack/react-query')>('@tanstack/react-query');
  return {
    ...actual,
    useQueryClient: () => ({
      removeQueries: removeQueriesMock,
    }),
  };
});

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

import { authService } from '@/services/auth.service';
import { societyService } from '@/services/society.service';
import React from 'react';

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    delete (window as unknown as { location?: Location }).location;
    Object.assign(window, {
      location: { assign: assignMock, search: '' },
    });
  });

  it('shows validation errors for invalid credentials', async () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/correo electrónico/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/contraseña/i) as HTMLInputElement;
    fireEvent.input(emailInput, { target: { value: 'invalid' } });
    fireEvent.input(passwordInput, { target: { value: '123' } });
    expect(emailInput.value).toBe('invalid');
    expect(passwordInput.value).toBe('123');

    fireEvent.submit(screen.getByRole('button', { name: /ingresar/i }).closest('form')!);

    expect(await screen.findByText(/correo válido/i)).toBeInTheDocument();
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('logs in, preloads society data and navigates home', async () => {
    vi.mocked(authService.login).mockResolvedValue({
      data: {
        token: 'jwt',
        user: { mustChangePassword: false },
      },
    } as never);
    vi.mocked(societyService.getCurrent).mockResolvedValue({ success: true } as never);

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'ana@test.com' } });
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByLabelText(/recordar correo/i));
    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));

    await waitFor(() => expect(authService.login).toHaveBeenCalled());

    expect(removeQueriesMock).toHaveBeenCalled();
    expect(societyService.getCurrent).toHaveBeenCalledWith('jwt');
    expect(loginMock).toHaveBeenCalled();
    expect(localStorage.getItem('rememberedEmail')).toBe('ana@test.com');
    expect(toastSuccessMock).toHaveBeenCalled();
    expect(assignMock).toHaveBeenCalledWith('/');
  });

  it('shows backend errors when login fails', async () => {
    vi.mocked(authService.login).mockRejectedValue({
      isAxiosError: true,
      response: { data: { message: 'Credenciales inválidas' } },
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'ana@test.com' } });
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));

    await waitFor(() => expect(toastErrorMock).toHaveBeenCalledWith('Credenciales inválidas'));
  });

  it('redirects to the session return path and clears it after login', async () => {
    sessionStorage.setItem('redirectUrl', '/ventas?tab=pendientes');
    vi.mocked(authService.login).mockResolvedValue({
      data: {
        token: 'jwt',
        user: { mustChangePassword: false },
      },
    } as never);
    vi.mocked(societyService.getCurrent).mockResolvedValue({ success: true } as never);

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'ana@test.com' } });
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));

    await waitFor(() => expect(assignMock).toHaveBeenCalledWith('/ventas?tab=pendientes'));
    expect(sessionStorage.getItem('redirectUrl')).toBeNull();
  });
});
