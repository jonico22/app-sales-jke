import { renderHook, act } from '@testing-library/react';
import { useMediaQuery } from './useMediaQuery';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('useMediaQuery hook', () => {
    const mockMatchMedia = (matches: boolean) => {
        const query = {
            matches,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        };
        return vi.fn().mockReturnValue(query);
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return true if media query matches', () => {
        window.matchMedia = mockMatchMedia(true);
        const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
        expect(result.current).toBe(true);
    });

    it('should return false if media query does not match', () => {
        window.matchMedia = mockMatchMedia(false);
        const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'));
        expect(result.current).toBe(false);
    });

    it('should update state when media query change event occurs', () => {
        let listener: any;
        const queryResult = {
            matches: false,
            addEventListener: vi.fn((event, callback) => {
                if (event === 'change') listener = callback;
            }),
            removeEventListener: vi.fn(),
        };
        window.matchMedia = vi.fn().mockReturnValue(queryResult);

        const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
        expect(result.current).toBe(false);

        // Simulate change event
        act(() => {
            queryResult.matches = true;
            listener();
        });

        expect(result.current).toBe(true);
    });

    it('should cleanup listener on unmount', () => {
        const queryResult = {
            matches: false,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        };
        window.matchMedia = vi.fn().mockReturnValue(queryResult);

        const { unmount } = renderHook(() => useMediaQuery('(min-width: 768px)'));
        unmount();

        expect(queryResult.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });
});
