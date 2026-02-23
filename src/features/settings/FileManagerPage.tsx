import { useState, useEffect } from 'react';
import {
    Search,
    Plus,
    Cloud,
    Grid,
    List,
    Download,
    Trash2,
    FileText,
    FileCode,
    FileSpreadsheet,
    Image as ImageIcon,
    HardDrive
} from 'lucide-react';
import { Button, Input, Card } from '@/components/ui';
import { fileService, type FileMetadata } from '@/services/file.service';
import { useSocietyStore } from '@/store/society.store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { UploadFileModal } from '@/components/shared/UploadFileModal';
import { FileDetailsDrawer } from './components/FileDetailsDrawer';

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

    const fetchFiles = async () => {
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
    };

    useEffect(() => {
        fetchFiles();
    }, [searchQuery]);

    const handleFileClick = (file: FileMetadata) => {
        setSelectedFile(file);
        setIsFileDrawerOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            const response = await fileService.delete(id);
            if (response.success) {
                toast.success('Archivo eliminado');
                await fetchFiles();
            }
        } catch (error) {
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
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Manejador de Archivos</h1>
                    <p className="text-slate-500 text-sm">Gestiona y organiza todos los archivos de tu negocio.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="primary"
                        className="bg-[#56a3e2] hover:bg-[#4a8ec5] text-white font-bold"
                        onClick={() => setIsUploadModalOpen(true)}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Subir Nuevo
                    </Button>
                </div>
            </div>

            {/* Storage Info Bar */}
            <Card className="p-4 border-slate-100 bg-slate-50/50">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-slate-600 font-medium">
                            <Cloud className="w-4 h-4 text-sky-500" />
                            Almacenamiento en la nube
                        </div>
                        <div className="text-slate-500">
                            <span className="font-bold text-slate-700">{totalFiles}</span> archivos
                            <span className="mx-2 text-slate-300">|</span>
                            <span className="font-bold text-slate-700">{formatSize(usedSpace)}</span> de {formatSize(limitSpace)} utilizados - {storagePercentage}%
                        </div>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                            className={cn(
                                "h-full transition-all duration-500",
                                storagePercentage > 90 ? "bg-red-500" : storagePercentage > 70 ? "bg-amber-500" : "bg-sky-500"
                            )}
                            style={{ width: `${storagePercentage}%` }}
                        />
                    </div>
                </div>
            </Card>

            {/* Filters and Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Buscar por nombre de archivo..."
                        className="pl-10 bg-white border-slate-200"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3">
                    <select className="h-10 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/20">
                        <option>Todos los tipos</option>
                        <option>Imágenes</option>
                        <option>Documentos</option>
                        <option>Hojas de cálculo</option>
                    </select>
                    <select className="h-10 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/20">
                        <option>Más recientes</option>
                        <option>Nombre (A-Z)</option>
                        <option>Tamaño</option>
                    </select>
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={cn("p-1.5 rounded-md transition-all", viewMode === 'grid' ? "bg-white shadow-sm text-sky-600" : "text-slate-500")}
                        >
                            <Grid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={cn("p-1.5 rounded-md transition-all", viewMode === 'list' ? "bg-white shadow-sm text-sky-600" : "text-slate-500")}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
                    <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
                    <p>Cargando archivos...</p>
                </div>
            ) : files.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 text-slate-400 gap-3">
                    <HardDrive className="w-12 h-12 opacity-20" />
                    <p className="font-medium">No se encontraron archivos</p>
                    <p className="text-sm">Intenta subir uno nuevo o cambiar los filtros.</p>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {files.map(file => (
                        <Card
                            key={file.id}
                            className="group overflow-hidden border-slate-200 hover:border-sky-300 transition-all hover:shadow-lg cursor-pointer"
                            onClick={() => handleFileClick(file)}
                        >
                            <div className="aspect-square bg-slate-50 flex items-center justify-center relative">
                                {file.mimeType.includes('image') ? (
                                    <img src={file.path} alt={file.name} className="w-full h-full object-cover" />
                                ) : (
                                    getFileIcon(file.mimeType, file.name)
                                )}
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 bg-white/80 hover:bg-white backdrop-blur shadow-sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(file.downloadUrl || file.path, '_blank');
                                        }}
                                    >
                                        <Download className="w-4 h-4 text-slate-600" />
                                    </Button>
                                </div>
                            </div>
                            <div className="p-3">
                                <p className="text-sm font-bold text-slate-700 truncate" title={file.name}>
                                    {file.name}
                                </p>
                                <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                                    <span>{formatSize(file.size)}</span>
                                    <span>{file.uploadedAt || '-'}</span>
                                </div>
                                <div className="flex items-center justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm('¿Estás seguro de eliminar este archivo?')) {
                                                handleDelete(file.id);
                                            }
                                        }}
                                    >
                                        <Trash2 className="w-3 h-3 mr-1" />
                                        Eliminar
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="overflow-hidden border-slate-200">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-4 py-3 font-bold text-slate-700">Nombre</th>
                                <th className="px-4 py-3 font-bold text-slate-700">Tipo</th>
                                <th className="px-4 py-3 font-bold text-slate-700">Tamaño</th>
                                <th className="px-4 py-3 font-bold text-slate-700">Fecha</th>
                                <th className="px-4 py-3 font-bold text-slate-700 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {files.map(file => (
                                <tr
                                    key={file.id}
                                    className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                                    onClick={() => handleFileClick(file)}
                                >
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center flex-shrink-0">
                                                {file.mimeType.includes('image') ? (
                                                    <img src={file.path} alt="" className="w-full h-full object-cover rounded" />
                                                ) : (
                                                    <div className="scale-50">{getFileIcon(file.mimeType, file.name)}</div>
                                                )}
                                            </div>
                                            <span className="font-medium text-slate-700 truncate max-w-[200px]">{file.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-500">{file.mimeType.split('/')[1]?.toUpperCase() || 'Archivo'}</td>
                                    <td className="px-4 py-3 text-slate-500">{formatSize(file.size)}</td>
                                    <td className="px-4 py-3 text-slate-500">{file.uploadedAt || '-'}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => window.open(file.downloadUrl || file.path, '_blank')}>
                                                <Download className="w-4 h-4 text-slate-500" />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => {
                                                if (confirm('¿Estás seguro de eliminar este archivo?')) {
                                                    handleDelete(file.id);
                                                }
                                            }}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
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
