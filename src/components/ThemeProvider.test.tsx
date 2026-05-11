import { render, screen } from '@/tests/test-utils';
import { ThemeProvider } from './ThemeProvider';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@/store/theme.store', () => ({
  useThemeStore: vi.fn(),
}));

import { useThemeStore } from '@/store/theme.store';

describe('ThemeProvider', () => {
  beforeEach(() => {
    document.documentElement.className = '';
  });

  it('applies explicit dark theme to the document root', () => {
    (useThemeStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (state: { theme: string }) => unknown) =>
      selector({ theme: 'dark' })
    );

    render(
      <ThemeProvider>
        <div>child</div>
      </ThemeProvider>
    );

    expect(screen.getByText('child')).toBeInTheDocument();
    expect(document.documentElement).toHaveClass('dark');
  });

  it('uses system theme when configured', () => {
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();
    vi.mocked(window.matchMedia).mockReturnValue({
      matches: true,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener,
      removeEventListener,
      dispatchEvent: vi.fn(),
    });
    (useThemeStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (state: { theme: string }) => unknown) =>
      selector({ theme: 'system' })
    );

    const { unmount } = render(
      <ThemeProvider>
        <div>system child</div>
      </ThemeProvider>
    );

    expect(document.documentElement).toHaveClass('dark');
    expect(addEventListener).toHaveBeenCalledWith('change', expect.any(Function));

    unmount();
    expect(removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });
});
