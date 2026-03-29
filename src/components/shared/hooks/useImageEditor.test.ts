import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useImageEditor } from './useImageEditor';

describe('useImageEditor hook', () => {
    const mockFile = new File(['test'], 'image.png', { type: 'image/png' });
    const defaultProps = {
        previewUrl: 'mock-url',
        selectedFile: mockFile,
        cropShape: 'square' as const,
    };

    const mockContext = {
        translate: vi.fn(),
        rotate: vi.fn(),
        scale: vi.fn(),
        drawImage: vi.fn(),
        beginPath: vi.fn(),
        arc: vi.fn(),
        clip: vi.fn(),
        fillRect: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        
        // Mock Image using Vitest stubGlobal
        vi.stubGlobal('Image', class {
            onload: () => void = () => {};
            onerror: () => void = () => {};
            src: string = '';
            width: number = 100;
            height: number = 100;
            constructor() {
                setTimeout(() => this.onload(), 0);
            }
        });

        // Mock HTMLCanvasElement prototype methods
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(mockContext as any);
        vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((cb: any) => {
            cb(new Blob(['test-blob'], { type: 'image/png' }));
        });
    });

    it('initializes with default values', () => {
        const { result } = renderHook(() => useImageEditor(defaultProps));
        expect(result.current.rotation).toBe(0);
        expect(result.current.zoom).toBe(1);
        expect(result.current.isCropping).toBe(false);
    });

    it('handles rotation correctly', () => {
        const { result } = renderHook(() => useImageEditor(defaultProps));
        
        act(() => {
            result.current.rotateRight();
        });
        expect(result.current.rotation).toBe(90);

        act(() => {
            result.current.rotateLeft();
        });
        expect(result.current.rotation).toBe(0);

        act(() => {
            result.current.rotateLeft();
        });
        expect(result.current.rotation).toBe(-90);
    });

    it('handles zoom correctly', () => {
        const { result } = renderHook(() => useImageEditor(defaultProps));
        
        act(() => {
            result.current.setZoom(2);
        });
        expect(result.current.zoom).toBe(2);
    });

    it('toggles cropping correctly', () => {
        const { result } = renderHook(() => useImageEditor(defaultProps));
        
        act(() => {
            result.current.toggleCropping();
        });
        expect(result.current.isCropping).toBe(true);
    });

    it('resets editor state', () => {
        const { result } = renderHook(() => useImageEditor(defaultProps));
        
        act(() => {
            result.current.setRotation(180);
            result.current.setZoom(3);
            result.current.toggleCropping();
        });

        act(() => {
            result.current.resetEditor();
        });

        expect(result.current.rotation).toBe(0);
        expect(result.current.zoom).toBe(1);
        expect(result.current.isCropping).toBe(false);
    });

    it('returns original file if no changes made in getCroppedImage', async () => {
        const { result } = renderHook(() => useImageEditor(defaultProps));
        
        const croppedFile = await result.current.getCroppedImage();
        expect(croppedFile).toBe(mockFile);
    });

    it('calls canvas APIs when changes are made in getCroppedImage', async () => {
        const { result } = renderHook(() => useImageEditor(defaultProps));
        
        act(() => {
            result.current.setRotation(90);
        });

        const croppedFile = await result.current.getCroppedImage();
        
        expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalled();
        expect(croppedFile).not.toBe(mockFile);
        expect(croppedFile.name).toBe(mockFile.name);
    });
});
