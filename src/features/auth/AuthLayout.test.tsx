import { render, screen } from '@/tests/test-utils';
import AuthLayout from './AuthLayout';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/store/theme.store', () => ({
  useThemeStore: vi.fn(() => ({ theme: 'dark' })),
}));

vi.mock('@/assets/logo.webp', () => ({
  default: '/logo.webp',
}));

describe('AuthLayout', () => {
  it('renders children, footer and dark-logo treatment', () => {
    render(
      <AuthLayout>
        <div>auth content</div>
      </AuthLayout>
    );

    expect(screen.getByText('auth content')).toBeInTheDocument();
    expect(screen.getByAltText(/jke solutions logo/i)).toHaveClass('brightness-0', 'invert');
    expect(screen.getByText(new RegExp(`${new Date().getFullYear()}`))).toBeInTheDocument();
  });
});
