import { fireEvent, render, screen } from '@/tests/test-utils';
import { describe, expect, it } from 'vitest';
import { PasswordInput } from './PasswordInput';

describe('PasswordInput', () => {
  it('toggles password visibility', () => {
    render(<PasswordInput id="password" label="Contraseña" />);

    const input = screen.getByLabelText('Contraseña');
    expect(input).toHaveAttribute('type', 'password');

    fireEvent.click(screen.getByRole('button', { name: /mostrar contraseña/i }));
    expect(input).toHaveAttribute('type', 'text');

    fireEvent.click(screen.getByRole('button', { name: /ocultar contraseña/i }));
    expect(input).toHaveAttribute('type', 'password');
  });

  it('renders string and object errors', () => {
    const { rerender } = render(
      <PasswordInput id="password" label="Contraseña" error="Error simple" />
    );

    expect(screen.getByText('Error simple')).toBeInTheDocument();

    rerender(
      <PasswordInput id="password" label="Contraseña" error={{ message: 'Error objeto' }} />
    );

    expect(screen.getByText('Error objeto')).toBeInTheDocument();
  });
});
