import { lazyRetry } from './lazyRetry';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('lazyRetry utility', () => {
    const originalLocation = window.location;

    beforeEach(() => {
        vi.clearAllMocks();
        sessionStorage.clear();
        
        // Use vi.stubGlobal for a safe and type-safe mock of window.location
        vi.stubGlobal('location', {
            ...originalLocation,
            href: 'http://localhost/test',
            assign: vi.fn(),
            replace: vi.fn(),
            reload: vi.fn(),
        });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('should resolve if the import succeeds', async () => {
        const mockImport = vi.fn().mockResolvedValue({ default: 'MockComponent' });
        
        const result = await lazyRetry(mockImport);
        
        expect(result.default).toBe('MockComponent');
        expect(window.location.href).toBe('http://localhost/test');
    });

    it('should reload the page on first failure', async () => {
        const mockImport = vi.fn().mockRejectedValue(new Error('Failed to fetch'));
        
        // This will not resolve or reject because it reloads (in a real browser)
        // In our test, it updates window.location.href
        lazyRetry(mockImport).catch(() => {});

        // We need to wait for the catch to be executed (it's a promise)
        await new Promise(resolve => setTimeout(resolve, 10));

        expect(sessionStorage.getItem('lazy_reload_done')).toBe('true');
        expect(window.location.href).toContain('v='); // Check that version param is added
    });

    it('should reject and clear session storage on second failure', async () => {
        sessionStorage.setItem('lazy_reload_done', 'true');
        const mockImport = vi.fn().mockRejectedValue(new Error('Still failing'));
        
        const resultPromise = lazyRetry(mockImport);

        await expect(resultPromise).rejects.toThrow('Still failing');
        expect(sessionStorage.getItem('lazy_reload_done')).toBeNull();
    });
});
