import { useState, useRef, useEffect } from 'react';
import {
    Upload,
    Link as LinkIcon,
    File as FileIcon,
    Loader2,
    Trash2,
    Crop,
    RotateCw,
    RotateCcw,
    Minus,
    Plus,
    CheckCircle2,
    Search,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

import {
    Modal,
    Button,
    Input,
    Label,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent
} from '@/components/ui';
import { fileService, FileCategory, type FileMetadata } from '@/services/file.service';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface UploadFileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (data?: any) => void;
    cropShape?: 'round' | 'square' | 'none';
    title?: string;
    accept?: string;
    category?: FileCategory;
    maxSizeMB?: number;
    showLibraryTab?: boolean;
}

export function UploadFileModal({
    isOpen,
    onClose,
    onSuccess,
    cropShape = 'none',
    title = 'Subir Nuevo Archivo',
    accept = 'image/jpeg,image/png,image/webp,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv',
    category = FileCategory.GENERAL,
    maxSizeMB = 2,
    showLibraryTab = false
}: UploadFileModalProps) {
    const [activeTab, setActiveTab] = useState('upload');
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [zoom, setZoom] = useState(1);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isCropping, setIsCropping] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string, size: number, type: string, url?: string }>>([]);

    // Library State
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

    // Fetch library ONLY conditionally on tab click
    useEffect(() => {
        if (activeTab === 'library' && showLibraryTab) {
            const fetchLibrary = async () => {
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
            };
            fetchLibrary();
        }
    }, [activeTab, libraryPage, debouncedLibrarySearch, category, showLibraryTab]);


    // Initial cleanup and effect for preview
    useEffect(() => {
        if (!selectedFile) {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
            setRotation(0);
            setZoom(1);
            setIsCropping(false);
            return;
        }

        if (selectedFile.type.startsWith('image/')) {
            const url = URL.createObjectURL(selectedFile);
            setPreviewUrl(url);
            setRotation(0);
            setZoom(1);
            setIsCropping(false);
            return () => URL.revokeObjectURL(url);
        } else {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
            setRotation(0);
            setZoom(1);
            setIsCropping(false);
        }
    }, [selectedFile]);

    // External Link Form State
    const [externalLink, setExternalLink] = useState({
        name: '',
        url: '',
        mimeType: 'application/pdf'
    });

    const validateFile = (file: File): boolean => {
        const maxSize = maxSizeMB * 1024 * 1024;
        if (file.size > maxSize) {
            toast.error(`El archivo excede el límite de ${maxSizeMB}MB`);
            return false;
        }

        const validTypes = accept.split(',');

        if (!validTypes.includes(file.type)) {
            toast.error('Formato de archivo no soportado');
            return false;
        }

        return true;
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && validateFile(file)) {
            setSelectedFile(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file && validateFile(file)) {
            setSelectedFile(file);
        }
    };

    const getCroppedImage = async (): Promise<File> => {
        if (!selectedFile || !selectedFile.type.startsWith('image/')) return selectedFile as File;
        if (zoom === 1 && rotation === 0 && !isCropping) return selectedFile as File;

        return new Promise((resolve) => {
            const image = new Image();
            image.src = previewUrl as string;
            image.onload = () => {
                const canvas = document.createElement('canvas');
                const canvasSize = 800; // High quality square output
                canvas.width = canvasSize;
                canvas.height = canvasSize;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(selectedFile as File);
                    return;
                }

                // If not PNG, fill with white to avoid black background in JPGs
                if (selectedFile.type !== 'image/png') {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }

                // Move to center to apply rotation and scale
                ctx.translate(canvasSize / 2, canvasSize / 2);

                // Apply circular mask if requested
                if (cropShape === 'round' && isCropping) {
                    ctx.beginPath();
                    ctx.arc(0, 0, canvasSize / 2, 0, Math.PI * 2);
                    ctx.clip();
                }

                ctx.rotate((rotation * Math.PI) / 180);
                ctx.scale(zoom, zoom);

                // Simulate object-fit: contain logic in the canvas
                const scale = canvasSize / Math.max(image.width, image.height);
                const drawWidth = image.width * scale;
                const drawHeight = image.height * scale;

                ctx.drawImage(
                    image,
                    -drawWidth / 2,
                    -drawHeight / 2,
                    drawWidth,
                    drawHeight
                );

                canvas.toBlob((blob) => {
                    if (!blob) {
                        resolve(selectedFile as File);
                        return;
                    }
                    const croppedFile = new File([blob], selectedFile.name, {
                        type: selectedFile.type,
                        lastModified: Date.now(),
                    });
                    resolve(croppedFile);
                }, selectedFile.type, 0.95);
            };
            image.onerror = () => {
                resolve(selectedFile as File);
            };
        });
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        try {
            const fileToUpload = await getCroppedImage();
            const response = await fileService.upload(fileToUpload, category);

            toast.success('Archivo subido exitosamente');

            if (selectedFile) {
                // If the selected file is an image, store the objectUrl or the cropped image payload to display it in the list (if we still have the previewUrl)
                setUploadedFiles(prev => [...prev, { name: selectedFile.name, size: selectedFile.size, type: selectedFile.type, url: selectedFile.type.startsWith('image/') && previewUrl ? previewUrl : undefined }]);
                setSelectedFile(null);
                setPreviewUrl(null);
                setRotation(0);
                setZoom(1);
                setIsCropping(false);
            }
            onSuccess(response.data);
        } catch (error) {
            toast.error('Error al subir el archivo');
        } finally {
            setIsUploading(false);
        }
    };

    const handleRegisterExternal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!externalLink.name || !externalLink.url) {
            toast.error('Por favor completa todos los campos');
            return;
        }

        // Basic URL validation
        try {
            new URL(externalLink.url);
        } catch (e) {
            toast.error('Por favor ingresa una URL válida');
            return;
        }

        try {
            setIsUploading(true);
            const response = await fileService.registerExternal({
                name: externalLink.name,
                path: externalLink.url,
                mimeType: externalLink.mimeType,
                storageType: 'EXTERNAL',
                category: category
            });
            if (response.data) {
                toast.success('Enlace externo registrado');
                onSuccess(response.data);
                handleClose();
            }
        } catch (error) {
            toast.error('Error al registrar el enlace');
        } finally {
            setIsUploading(false);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const handleClose = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setRotation(0);
        setZoom(1);
        setIsCropping(false);
        setUploadedFiles([]);
        setExternalLink({ name: '', url: '', mimeType: 'application/pdf' });
        // Reset library state
        setLibrarySearch('');
        setLibraryPage(1);
        setSelectedLibraryFile(null);
        setActiveTab('upload');
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={title}
            size="lg"
        >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-6">
                    <TabsTrigger value="upload" className="flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Subir nuevo
                    </TabsTrigger>
                    {showLibraryTab && (
                        <TabsTrigger value="library" className="flex items-center gap-2">
                            <FileIcon className="w-4 h-4" />
                            Biblioteca de medios
                        </TabsTrigger>
                    )}
                    <TabsTrigger value="external" className="flex items-center gap-2">
                        <LinkIcon className="w-4 h-4" />
                        Enlace Externo
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="space-y-6">
                    {!selectedFile && (
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={cn(
                                "group relative border-2 border-dashed rounded-xl p-10 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 text-center",
                                isDragging
                                    ? "border-sky-500 bg-sky-50"
                                    : "border-slate-200 hover:border-sky-400 hover:bg-slate-50/50"
                            )}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                accept={accept}
                                className="hidden"
                            />

                            <div className="w-16 h-16 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 bg-sky-50 text-sky-500">
                                <Upload className="w-8 h-8" />
                            </div>

                            <div>
                                <p className="font-bold text-slate-700">
                                    {uploadedFiles.length > 0 ? "Arrastra y suelta otro archivo aquí" : "Arrastra y suelta tu archivo aquí"}
                                </p>
                                <p className="text-sm text-slate-500 mt-1">
                                    O haz clic para seleccionar (Máx. {maxSizeMB}MB)
                                </p>
                            </div>

                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                                Tamaño máximo: {maxSizeMB}MB • Formatos permitidos: {accept.split(',').map(t => t.split('/')[1]?.toUpperCase()).join(', ')}
                            </p>
                        </div>
                    )}

                    {selectedFile && (
                        <div className="space-y-4 pt-2">
                            {selectedFile.type.startsWith('image/') && previewUrl ? (
                                <div className="flex flex-col items-center pt-2 pb-6">
                                    <div className="relative w-full aspect-square max-w-[320px] rounded overflow-hidden bg-[#595856] mb-6 flex items-center justify-center">
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="max-w-full max-h-full object-contain z-0"
                                            style={{
                                                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                                                transition: 'transform 0.2s ease-in-out'
                                            }}
                                        />
                                        {cropShape !== 'none' && isCropping && (
                                            <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
                                                <div className={cn(
                                                    "w-[85%] h-[85%] ring-[200px] ring-black/40 border-[1px] border-white/20",
                                                    cropShape === 'round' ? "rounded-full" : "rounded-lg"
                                                )}></div>
                                                <div className="absolute top-4 left-4 w-6 h-6 border-t-[3px] border-l-[3px] border-sky-400"></div>
                                                <div className="absolute top-4 right-4 w-6 h-6 border-t-[3px] border-r-[3px] border-sky-400"></div>
                                                <div className="absolute bottom-4 left-4 w-6 h-6 border-b-[3px] border-l-[3px] border-sky-400"></div>
                                                <div className="absolute bottom-4 right-4 w-6 h-6 border-b-[3px] border-r-[3px] border-sky-400"></div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col items-center gap-1 mb-6 text-center">
                                        <span className="text-sm font-bold text-slate-700 truncate max-w-[280px]">
                                            {selectedFile.name}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            {formatFileSize(selectedFile.size)} • {selectedFile.type.split('/')[1].toUpperCase()}
                                        </span>
                                        <button
                                            onClick={() => setSelectedFile(null)}
                                            className="text-xs text-sky-500 font-medium hover:underline mt-1.5"
                                        >
                                            Cambiar archivo
                                        </button>
                                    </div>

                                    <div className="flex flex-col items-center gap-8 w-full max-w-[280px]">
                                        <div className="flex items-center gap-6">
                                            <button
                                                onClick={() => setIsCropping(!isCropping)}
                                                className={cn(
                                                    "p-3.5 rounded-xl transition-colors border",
                                                    isCropping
                                                        ? "bg-[#f0f7fd] text-sky-500 border-sky-100/50"
                                                        : "text-slate-400 hover:text-slate-600 border-transparent hover:bg-slate-50"
                                                )}
                                                title={cropShape === 'round' ? "Recortar (Máscara Circular)" : "Recortar"}
                                            >
                                                <Crop className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => setRotation(r => r - 90)}
                                                className="p-3 text-sky-500 hover:bg-sky-50 rounded-xl transition-colors"
                                                title="Rotar a la izquierda"
                                            >
                                                <RotateCcw className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => setRotation(r => r + 90)}
                                                className="p-3 text-sky-500 hover:bg-sky-50 rounded-xl transition-colors"
                                                title="Rotar a la derecha"
                                            >
                                                <RotateCw className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {isCropping && (
                                            <div className="flex flex-col items-center gap-2.5 w-full">
                                                <div className="flex items-center w-full gap-4">
                                                    <button
                                                        onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
                                                        className="text-slate-400 hover:text-slate-600 font-bold"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <div className="relative flex-1 flex items-center h-6">
                                                        <input
                                                            type="range"
                                                            min="0.5"
                                                            max="3"
                                                            step="0.1"
                                                            value={zoom}
                                                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                                                            className="w-full absolute inset-0 opacity-0 cursor-pointer z-10"
                                                        />
                                                        <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-sky-500"
                                                                style={{ width: `${((zoom - 0.5) / 2.5) * 100}%` }}
                                                            ></div>
                                                        </div>
                                                        <div
                                                            className="absolute w-4 h-4 bg-sky-500 rounded-full shadow-sm pointer-events-none transform -translate-x-1/2"
                                                            style={{ left: `${((zoom - 0.5) / 2.5) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                    <button
                                                        onClick={() => setZoom(z => Math.min(3, z + 0.1))}
                                                        className="text-slate-400 hover:text-slate-600 font-bold"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">
                                                    ZOOM
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">Archivo Seleccionado</span>
                                    </div>

                                    <div className="border border-slate-100 rounded-xl bg-white p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                                <FileIcon className="w-6 h-6" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-700 truncate max-w-[280px]">
                                                    {selectedFile.name}
                                                </span>
                                                <span className="text-xs text-slate-500">
                                                    {formatFileSize(selectedFile.size)}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedFile(null)}
                                            className="p-2.5 text-slate-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {!selectedFile && uploadedFiles.length > 0 && (
                        <div className="space-y-3 mt-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">Archivos Subidos</span>
                            </div>
                            {uploadedFiles.map((file, idx) => (
                                <div key={idx} className="border border-slate-100 rounded-xl bg-white p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-[84px] h-[84px] rounded-xl bg-[#f5dfce] flex items-center justify-center text-orange-200/50 overflow-hidden relative">
                                            {file.url ? (
                                                <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-10 h-10 border-2 border-current rounded-md flex items-center justify-center opacity-70">
                                                    <div className="w-6 h-6 border-b-2 border-current rounded-full"></div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-slate-700 truncate max-w-[200px]">
                                                    {file.name}
                                                </span>
                                                <CheckCircle2 className="w-[18px] h-[18px] text-[#4caf50]" fill="currentColor" stroke="white" />
                                            </div>
                                            <span className="text-xs text-slate-500 mt-1 mb-2">
                                                {formatFileSize(file.size)} • {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                                            </span>
                                            <div className="inline-flex">
                                                <span className="px-2.5 py-0.5 rounded-full bg-[#f0f9f1] text-[#4caf50] border border-[#d2edd4] text-[10px] font-bold uppercase tracking-wider">
                                                    ¡Carga Existosa!
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== idx))}
                                        className="p-2.5 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex flex-col items-center gap-6 pt-6 border-t border-slate-100/50 mt-6 pb-2">
                        <p className="text-sm text-slate-500 font-medium text-center">
                            ¿Tu imagen es muy pesada? <a href="#" className="text-sky-500 hover:underline">Optimizala aquí</a>
                        </p>
                        <div className="flex items-center justify-end w-full gap-3">
                            <Button
                                variant="ghost"
                                onClick={handleClose}
                                disabled={isUploading}
                                className="font-bold text-slate-500 hover:text-slate-700"
                            >
                                Cerrar
                            </Button>
                            {!selectedFile && uploadedFiles.length > 0 ? (
                                <Button
                                    variant="primary"
                                    className="bg-[#56a3e2] hover:bg-[#4a8ec5] text-white font-bold h-11 px-6 shadow-sm"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Subir otro archivo
                                </Button>
                            ) : (
                                <Button
                                    variant="primary"
                                    className="bg-[#56a3e2] hover:bg-[#4a8ec5] text-white font-bold h-11 px-8 shadow-sm"
                                    onClick={handleUpload}
                                    disabled={!selectedFile || isUploading}
                                >
                                    {isUploading ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Upload className="w-4 h-4 mr-2" />
                                    )}
                                    {isUploading ? "Subiendo..." : "Iniciar Carga"}
                                </Button>
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="external" className="space-y-5">
                    <form onSubmit={handleRegisterExternal} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="ext-name">Nombre del archivo</Label>
                            <Input
                                id="ext-name"
                                placeholder="Ej: Catálogo 2024.pdf"
                                value={externalLink.name}
                                onChange={(e) => setExternalLink(prev => ({ ...prev, name: e.target.value }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="ext-url">URL del archivo</Label>
                            <Input
                                id="ext-url"
                                placeholder="https://ejemplo.com/archivo.pdf"
                                value={externalLink.url}
                                onChange={(e) => setExternalLink(prev => ({ ...prev, url: e.target.value }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="ext-mime">Tipo de archivo</Label>
                            <select
                                id="ext-mime"
                                className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                                value={externalLink.mimeType}
                                onChange={(e) => setExternalLink(prev => ({ ...prev, mimeType: e.target.value }))}
                            >
                                <option value="application/pdf">PDF Document</option>
                                <option value="image/jpeg">Image (JPEG)</option>
                                <option value="image/png">Image (PNG)</option>
                                <option value="image/webp">Image (WEBP)</option>
                                <option value="text/csv">CSV Table</option>
                                <option value="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">Excel Spreadsheet</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-6">
                            <Button
                                variant="ghost"
                                type="button"
                                onClick={handleClose}
                                disabled={isUploading}
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="primary"
                                type="submit"
                                className="bg-[#56a3e2] hover:bg-[#4a8ec5] text-white font-bold h-11 px-8"
                                disabled={isUploading}
                            >
                                {isUploading ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <LinkIcon className="w-4 h-4 mr-2" />
                                )}
                                Registrar Enlace
                            </Button>
                        </div>
                    </form>
                </TabsContent>
                <TabsContent value="library" className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Buscar por nombre de archivo..."
                            value={librarySearch}
                            onChange={(e) => {
                                setLibrarySearch(e.target.value);
                                setLibraryPage(1);
                            }}
                            className="pl-9 bg-white"
                        />
                    </div>

                    <div className="min-h-[260px]">
                        {isLoadingLibrary ? (
                            <div className="flex flex-col flex-1 h-[260px] items-center justify-center text-slate-400">
                                <Loader2 className="w-6 h-6 animate-spin mb-2" />
                                <span className="text-sm">Cargando biblioteca...</span>
                            </div>
                        ) : libraryFiles.length === 0 ? (
                            <div className="flex flex-col flex-1 h-[260px] items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                                <FileIcon className="w-8 h-8 mb-2 opacity-50" />
                                <span className="text-sm">No se encontraron archivos</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                                {libraryFiles.map(file => (
                                    <div
                                        key={file.id}
                                        onClick={() => setSelectedLibraryFile(file)}
                                        className={cn(
                                            "relative aspect-square border rounded-xl cursor-pointer overflow-hidden transition-all bg-slate-50 group",
                                            selectedLibraryFile?.id === file.id
                                                ? "border-sky-500 ring-2 ring-sky-500/20 bg-orange-50/50"
                                                : "border-slate-200 hover:border-sky-300"
                                        )}
                                    >
                                        {file.mimeType && file.mimeType.startsWith('image/') ? (
                                            <img src={file.path || file.downloadUrl} alt={file.name} className="object-cover w-full h-full" />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center w-full h-full text-slate-400">
                                                <FileIcon className="w-6 h-6 mb-1 opacity-50" />
                                                <span className="text-[10px] uppercase truncate w-full text-center px-1">{file.mimeType ? file.mimeType.split('/')[1] : 'FILE'}</span>
                                            </div>
                                        )}
                                        {selectedLibraryFile?.id === file.id && (
                                            <div className="absolute top-1.5 right-1.5 bg-sky-500 rounded-full text-white shadow-sm z-10 w-4 h-4 flex items-center justify-center">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pagination control */}
                    {libraryTotalPages > 1 && (
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100/50 mt-4">
                            <span className="text-xs text-slate-500 font-medium">
                                Página {libraryPage} de {libraryTotalPages}
                            </span>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => setLibraryPage(p => Math.max(1, p - 1))}
                                    disabled={libraryPage === 1 || isLoadingLibrary}
                                    className="h-8 px-2"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => setLibraryPage(p => Math.min(libraryTotalPages, p + 1))}
                                    disabled={libraryPage === libraryTotalPages || isLoadingLibrary}
                                    className="h-8 px-2"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-end w-full gap-3 pt-6 border-t border-slate-100 mt-4">
                        <Button
                            variant="ghost"
                            onClick={handleClose}
                            className="font-bold text-slate-500 hover:text-slate-700 h-10"
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="primary"
                            className="bg-[#56a3e2] hover:bg-[#4a8ec5] text-white font-bold h-10 px-6 shadow-sm"
                            onClick={() => {
                                if (selectedLibraryFile) {
                                    // To match what registerExternal/upload return, we pass selectedLibraryFile
                                    onSuccess(selectedLibraryFile);
                                    handleClose();
                                }
                            }}
                            disabled={!selectedLibraryFile || isLoadingLibrary}
                        >
                            Seleccionar e Insertar
                        </Button>
                    </div>
                </TabsContent>
            </Tabs>
        </Modal >
    );
}
