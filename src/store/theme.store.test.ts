import { useThemeStore } from './theme.store';
import { describe, it, expect, beforeEach } from 'vitest';

describe('themeStore', () => {
    beforeEach(() => {
        useThemeStore.setState({
            theme: 'system',
        });
    });

    it('should have initial state', () => {
        const state = useThemeStore.getState();
        expect(state.theme).toBe('system');
    });

    it('should set theme', () => {
        useThemeStore.getState().setTheme('dark');

        const state = useThemeStore.getState();
        expect(state.theme).toBe('dark');

        useThemeStore.getState().setTheme('light');
        expect(useThemeStore.getState().theme).toBe('light');
    });
});
