import { downloadFileFromUrl } from './download.utils';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('downloadUtils', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should create an anchor element, trigger click and then remove it', () => {
        const mockLink = {
            href: '',
            download: '',
            target: '',
            rel: '',
            click: vi.fn(),
        } as any;

        const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
        const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink);
        const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink);

        const testUrl = 'https://example.com/file.pdf';
        const testFilename = 'test-file.pdf';

        downloadFileFromUrl(testUrl, testFilename);

        expect(createElementSpy).toHaveBeenCalledWith('a');
        expect(mockLink.href).toBe(testUrl);
        expect(mockLink.download).toBe(testFilename);
        expect(mockLink.target).toBe('_blank');
        expect(mockLink.click).toHaveBeenCalled();
        expect(appendChildSpy).toHaveBeenCalledWith(mockLink);
        expect(removeChildSpy).toHaveBeenCalledWith(mockLink);
    });

    it('should work without filename', () => {
        const mockLink = {
            click: vi.fn(),
        } as any;

        vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
        vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink);
        vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink);

        const testUrl = 'https://example.com/file.pdf';
        downloadFileFromUrl(testUrl);

        expect(mockLink.href).toBe(testUrl);
        expect(mockLink.download).toBeUndefined();
    });
});
