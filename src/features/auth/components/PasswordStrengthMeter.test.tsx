import { render, screen } from '@/tests/test-utils';
import { describe, expect, it } from 'vitest';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';

describe('PasswordStrengthMeter', () => {
  it('renders empty state for no password', () => {
    render(<PasswordStrengthMeter password="" />);

    expect(screen.getByText(/fortaleza de la contraseña/i)).toBeInTheDocument();
    expect(screen.queryByText(/débil|media|fuerte/i)).not.toBeInTheDocument();
  });

  it('renders weak strength for short passwords', () => {
    render(<PasswordStrengthMeter password="abcdefgh" />);

    expect(screen.getByText(/débil/i)).toBeInTheDocument();
  });

  it('renders medium and strong strengths for stronger passwords', () => {
    const { rerender } = render(<PasswordStrengthMeter password="Password1" />);
    expect(screen.getByText(/media/i)).toBeInTheDocument();

    rerender(<PasswordStrengthMeter password="Password1!" />);
    expect(screen.getByText(/fuerte/i)).toBeInTheDocument();
  });
});
