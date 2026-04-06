import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useFileLibrary } from './useFileLibrary';
import { fileService, FileCategory } from '@/services/file.service';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('@/services/file.service', () => ({
  fileService: {
    getGallery: vi.fn(),
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

describe('useFileLibrary hook', () => {
  const defaultProps = {
    category: FileCategory.GENERAL,
    showLibraryTab: true,
    activeTab: 'library',
  };

  const mockGalleryResponse = {
    data: {
      data: [{ id: '1', name: 'File 1', path: '/path/1', mimeType: 'image/png' }],
      pagination: { totalPages: 2, totalItems: 15 }
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (fileService.getGallery as any).mockResolvedValue(mockGalleryResponse);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('fetches gallery data on mount if activeTab is library', async () => {
    await act(async () => {
      renderHook(() => useFileLibrary(defaultProps));
    });

    expect(fileService.getGallery).toHaveBeenCalled();
    const calls = vi.mocked(fileService.getGallery).mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    const callArgs = calls[0]?.[0];
    if (!callArgs) return; // For TS narrowing
    expect(callArgs.page).toBe(1);
    expect(callArgs.category).toBe(FileCategory.GENERAL);
  });

  it('does not fetch gallery if activeTab is not library', async () => {
    await act(async () => {
      renderHook(() => useFileLibrary({ ...defaultProps, activeTab: 'upload' }));
    });

    expect(fileService.getGallery).not.toHaveBeenCalled();
  });

  it('handles search debouncing', async () => {
    const { result } = renderHook(() => useFileLibrary(defaultProps));

    act(() => {
      result.current.setLibrarySearch('test-query');
    });

    // Advance 400ms - search should not be triggered yet (debounce is 500ms)
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(fileService.getGallery).toHaveBeenCalledTimes(1); // Only the initial call

    // Advance another 200ms
    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    expect(fileService.getGallery).toHaveBeenCalledTimes(2);
    expect(fileService.getGallery).toHaveBeenLastCalledWith(expect.objectContaining({
      search: 'test-query'
    }));
  });

  it('handles pagination changes', async () => {
    const { result } = renderHook(() => useFileLibrary(defaultProps));

    await act(async () => {
      result.current.setLibraryPage(2);
    });

    expect(fileService.getGallery).toHaveBeenLastCalledWith(expect.objectContaining({
      page: 2
    }));
  });

  it('handles fetch errors gracefully', async () => {
    (fileService.getGallery as any).mockRejectedValue(new Error('Fetch failed'));

    const { result } = renderHook(() => useFileLibrary(defaultProps));
    
    await act(async () => {
      // Re-fetch handled by useEffect
      vi.advanceTimersByTime(100); 
    });

    expect(toast.error).toHaveBeenCalledWith('Error al cargar la biblioteca de medios');
    expect(result.current.isLoadingLibrary).toBe(false);
  });

  it('resets library state correctly', async () => {
    const { result } = renderHook(() => useFileLibrary(defaultProps));

    act(() => {
      result.current.setLibrarySearch('something');
      result.current.setLibraryPage(5);
      result.current.setSelectedLibraryFile({ id: '1' } as any);
    });

    act(() => {
      result.current.resetLibrary();
    });

    expect(result.current.librarySearch).toBe('');
    expect(result.current.libraryPage).toBe(1);
    expect(result.current.selectedLibraryFile).toBe(null);
  });
});
