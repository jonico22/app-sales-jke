import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useFileUpload } from './useFileUpload';
import { fileService, FileCategory } from '@/services/file.service';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('@/services/file.service', () => ({
  fileService: {
    upload: vi.fn(),
    registerExternal: vi.fn(),
  },
  FileCategory: {
    GENERAL: 'GENERAL',
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock ONLY the static URL methods while preserving the constructor
const OriginalURL = globalThis.URL;
vi.stubGlobal('URL', class extends OriginalURL {
  static override createObjectURL = vi.fn(() => 'mock-url');
  static override revokeObjectURL = vi.fn();
});

describe('useFileUpload hook', () => {
  const mockOnSuccess = vi.fn();
  const defaultProps = {
    category: FileCategory.GENERAL,
    accept: 'image/png,image/jpeg',
    maxSizeMB: 2,
    onSuccess: mockOnSuccess,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useFileUpload(defaultProps));
    expect(result.current.isUploading).toBe(false);
    expect(result.current.selectedFile).toBe(null);
    expect(result.current.previewUrl).toBe(null);
    expect(result.current.uploadedFiles).toEqual([]);
  });

  it('validates file size correctly', () => {
    const { result } = renderHook(() => useFileUpload(defaultProps));
    const largeFile = new File(['a'.repeat(3 * 1024 * 1024)], 'large.png', { type: 'image/png' });

    act(() => {
      result.current.handleFileSelect(largeFile);
    });

    expect(result.current.selectedFile).toBe(null);
    expect(toast.error).toHaveBeenCalledWith('El archivo excede el límite de 2MB');
  });

  it('validates file type correctly', () => {
    const { result } = renderHook(() => useFileUpload(defaultProps));
    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });

    act(() => {
      result.current.handleFileSelect(invalidFile);
    });

    expect(result.current.selectedFile).toBe(null);
    expect(toast.error).toHaveBeenCalledWith('Formato de archivo no soportado');
  });

  it('sets selected file and preview URL for images', () => {
    const { result } = renderHook(() => useFileUpload(defaultProps));
    const validFile = new File(['test'], 'image.png', { type: 'image/png' });

    act(() => {
      result.current.handleFileSelect(validFile);
    });

    expect(result.current.selectedFile).toBe(validFile);
    expect(result.current.previewUrl).toBe('mock-url');
  });

  it('handles successful upload', async () => {
    const mockResponse = { data: { id: '123' } };
    (fileService.upload as any).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useFileUpload(defaultProps));
    const validFile = new File(['test'], 'image.png', { type: 'image/png' });

    await act(async () => {
      result.current.setSelectedFile(validFile);
      await result.current.handleUpload(validFile);
    });

    expect(fileService.upload).toHaveBeenCalledWith(validFile, FileCategory.GENERAL);
    expect(toast.success).toHaveBeenCalledWith('Archivo subido exitosamente');
    expect(mockOnSuccess).toHaveBeenCalledWith(mockResponse.data);
    expect(result.current.selectedFile).toBe(null);
  });

  it('handles upload error', async () => {
    (fileService.upload as any).mockRejectedValue(new Error('Upload failed'));

    const { result } = renderHook(() => useFileUpload(defaultProps));
    const validFile = new File(['test'], 'image.png', { type: 'image/png' });

    await act(async () => {
      await result.current.handleUpload(validFile);
    });

    expect(toast.error).toHaveBeenCalledWith('Error al subir el archivo');
    expect(result.current.isUploading).toBe(false);
  });

  it('registers external link with validation', async () => {
    const mockResponse = { data: { id: 'ext-1' } };
    (fileService.registerExternal as any).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useFileUpload(defaultProps));

    // First, try with empty values
    await act(async () => {
      await result.current.handleRegisterExternal({ preventDefault: vi.fn() } as any);
    });
    expect(toast.error).toHaveBeenCalledWith('Por favor completa todos los campos');

    // Then, try with invalid URL
    act(() => {
        result.current.setExternalLink({ name: 'External', url: 'not-a-url', mimeType: 'application/pdf' });
    });
    await act(async () => {
        await result.current.handleRegisterExternal({ preventDefault: vi.fn() } as any);
    });
    expect(toast.error).toHaveBeenCalledWith('Por favor ingresa una URL válida');

    // Finally, valid case
    await act(async () => {
        result.current.setExternalLink({ name: 'ExternalDoc', url: 'https://example.com/doc.pdf', mimeType: 'application/pdf' });
    });
    
    expect(result.current.externalLink.name).toBe('ExternalDoc');

    await act(async () => {
        await result.current.handleRegisterExternal({ preventDefault: vi.fn() } as any);
    });

    expect(fileService.registerExternal).toHaveBeenCalled();

    if (vi.mocked(fileService.registerExternal).mock.calls.length === 0) {
        console.log('Current Link State:', result.current.externalLink);
    }

    expect(fileService.registerExternal).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalled();
    expect(mockOnSuccess).toHaveBeenCalled();
  });
});
