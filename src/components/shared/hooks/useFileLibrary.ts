import { useState, useEffect, useCallback } from 'react';
import { fileService, FileCategory, type FileMetadata } from '@/services/file.service';
import { toast } from 'sonner';

export interface UseFileLibraryProps {
    category: FileCategory;
    showLibraryTab: boolean;
    activeTab: string;
}

export function useFileLibrary({ category, showLibraryTab, activeTab }: UseFileLibraryProps) {
    const [libraryFiles, setLibraryFiles] = useState<FileMetadata[]>([]);
    const [librarySearch, setLibrarySearch] = useState('');
    const [debouncedLibrarySearch, setDebouncedLibrarySearch] = useState('');
    const [libraryPage, setLibraryPage] = useState(1);
    const [libraryTotalPages, setLibraryTotalPages] = useState(1);
    const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
    const [selectedLibraryFile, setSelectedLibraryFile] = useState<FileMetadata | null>(null);

    // Debounce library search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedLibrarySearch(librarySearch), 500);
        return () => clearTimeout(timer);
    }, [librarySearch]);

    const fetchLibrary = useCallback(async () => {
        if (activeTab !== 'library' || !showLibraryTab) return;
        
        setIsLoadingLibrary(true);
        try {
            const params = {
                page: libraryPage,
                limit: 10,
                search: debouncedLibrarySearch,
                category: category
            };
            const res = await fileService.getGallery(params);
            setLibraryFiles(res.data.data);
            setLibraryTotalPages(res.data.pagination?.totalPages || 1);
        } catch (error) {
            toast.error('Error al cargar la biblioteca de medios');
        } finally {
            setIsLoadingLibrary(false);
        }
    }, [activeTab, libraryPage, debouncedLibrarySearch, category, showLibraryTab]);

    useEffect(() => {
        fetchLibrary();
    }, [fetchLibrary]);

    const resetLibrary = useCallback(() => {
        setLibrarySearch('');
        setLibraryPage(1);
        setSelectedLibraryFile(null);
    }, []);

    return {
        libraryFiles,
        librarySearch,
        setLibrarySearch,
        libraryPage,
        setLibraryPage,
        libraryTotalPages,
        isLoadingLibrary,
        selectedLibraryFile,
        setSelectedLibraryFile,
        resetLibrary,
        fetchLibrary
    };
}
