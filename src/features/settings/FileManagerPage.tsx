import { useState, useEffect, useCallback } from 'react';
import {
    FileText,
    FileCode,
    FileSpreadsheet,
    Image as ImageIcon,
    HardDrive
} from 'lucide-react';
import { fileService, type FileMetadata } from '@/services/file.service';
import { useSocietyStore } from '@/store/society.store';
import { toast } from 'sonner';
import { UploadFileModal } from '@/components/shared/UploadFileModal';
import { FileDetailsDrawer } from './components/FileDetailsDrawer';

import { FileManagerHeader } from './components/FileManagerHeader';
import { StorageInfoBar } from './components/StorageInfoBar';
import { FileManagerToolbar } from './components/FileManagerToolbar';
import { FileGrid } from './components/FileGrid';
import { FileTable } from './components/FileTable';

export default function FileManagerPage() {
    const { society } = useSocietyStore();
    const [files, setFiles] = useState<FileMetadata[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [totalFiles, setTotalFiles] = useState(0);
    const [usedSpace, setUsedSpace] = useState(0);
    const [limitSpace, setLimitSpace] = useState(society?.storageLimit ? parseInt(society.storageLimit) : 5 * 1024 * 1024 * 1024);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<FileMetadata | null>(null);
    const [isFileDrawerOpen, setIsFileDrawerOpen] = useState(false);

    const storagePercentage = usedSpace > 0
        ? Math.max(Math.ceil((usedSpace / limitSpace) * 100), 1)
        : 0;

    const fetchFiles = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fileService.getGallery({
                search: searchQuery || undefined,
                limit: 20
            });
            if (response.data) {
                setFiles(response.data.data);
                setTotalFiles(response.data.pagination.total);

                if (response.data.storageInfo) {
                    setUsedSpace(response.data.storageInfo.usedBytes);
                    setLimitSpace(response.data.storageInfo.limitBytes);
                }
            }
        } catch (error) {
            console.error('Error fetching files:', error);
            toast.error('Error al cargar los archivos');
        } finally {
            setLoading(false);
        }
    }, [searchQuery]);

    useEffect(() => {
        fetchFiles();
    }, [fetchFiles]);

    const handleFileClick = (file: FileMetadata) => {
        setSelectedFile(file);
        setIsFileDrawerOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('¿Estás seguro de eliminar este archivo?')) return;
        try {
            const response = await fileService.delete(id);
            if (response.success) {
                toast.success('Archivo eliminado');
                await fetchFiles();
            }
        } catch {
            toast.error('Error al eliminar');
        }
    };

    const getFileIcon = (mimeType: string, fileName: string) => {
        const lowerName = fileName.toLowerCase();
        if (mimeType.includes('image') || lowerName.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
            return <ImageIcon className="w-8 h-8 text-blue-500" />;
        }
        if (mimeType.includes('pdf')) return <FileText className="w-8 h-8 text-red-500" />;
        if (mimeType.includes('spreadsheet') || lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls')) {
            return <FileSpreadsheet className="w-8 h-8 text-emerald-600" />;
        }
        if (mimeType.includes('csv') || lowerName.endsWith('.csv')) {
            return <FileCode className="w-8 h-8 text-emerald-500" />;
        }
        return <FileText className="w-8 h-8 text-slate-400" />;
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
            <FileManagerHeader onUpload={() => setIsUploadModalOpen(true)} />

            <StorageInfoBar 
                totalFiles={totalFiles}
                usedSpace={usedSpace}
                limitSpace={limitSpace}
                storagePercentage={storagePercentage}
                formatSize={formatSize}
            />

            <FileManagerToolbar 
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
            />

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
                    <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-bold uppercase tracking-widest leading-none">Cargando...</p>
                </div>
            ) : files.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border rounded-2xl bg-muted/30 text-muted-foreground gap-3">
                    <HardDrive className="w-12 h-12 opacity-20" />
                    <p className="font-bold text-sm uppercase tracking-tight">No se encontraron archivos</p>
                    <p className="text-xs font-medium">Intenta subir uno nuevo o cambiar los filtros.</p>
                </div>
            ) : viewMode === 'grid' ? (
                <FileGrid 
                    files={files}
                    onFileClick={handleFileClick}
                    onDelete={handleDelete}
                    getFileIcon={getFileIcon}
                    formatSize={formatSize}
                />
            ) : (
                <FileTable 
                    files={files}
                    onFileClick={handleFileClick}
                    onDelete={handleDelete}
                    getFileIcon={getFileIcon}
                    formatSize={formatSize}
                />
            )}

            <UploadFileModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onSuccess={fetchFiles}
            />

            <FileDetailsDrawer
                file={selectedFile}
                open={isFileDrawerOpen}
                onOpenChange={setIsFileDrawerOpen}
                onDelete={handleDelete}
            />
        </div>
    );
}
