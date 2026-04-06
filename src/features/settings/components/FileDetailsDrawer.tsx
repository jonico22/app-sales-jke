import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Trash2, Copy, FileText, FileCode, FileSpreadsheet, Image as ImageIcon, Check } from 'lucide-react';
import { type FileMetadata } from '@/services/file.service';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { downloadFileFromUrl } from '@/utils/download.utils';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface FileDetailsDrawerProps {
    file: FileMetadata | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onDelete: (id: string) => Promise<void>;
}

export function FileDetailsDrawer({ file, open, onOpenChange, onDelete }: FileDetailsDrawerProps) {
    const [isCopying, setIsCopying] = useState(false);
    const [dimensions, setDimensions] = useState<string | null>(null);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (open && file && file.mimeType.includes('image')) {
            const img = new Image();
            img.onload = () => {
                setDimensions(`${img.naturalWidth}x${img.naturalHeight} px`);
            };
            img.onerror = () => {
                setDimensions(null);
            };
            img.src = file.path;
        } else {
            setDimensions(null);
        }
    }, [file, open]);

    if (!file) return null;

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (mimeType: string, fileName: string) => {
        const lowerName = fileName.toLowerCase();
        if (mimeType.includes('image') || lowerName.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
            return <ImageIcon className="w-16 h-16 text-blue-500" />;
        }
        if (mimeType.includes('pdf')) return <FileText className="w-16 h-16 text-red-500" />;
        if (mimeType.includes('spreadsheet') || lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls')) {
            return <FileSpreadsheet className="w-16 h-16 text-emerald-600" />;
        }
        if (mimeType.includes('csv') || lowerName.endsWith('.csv')) {
            return <FileCode className="w-16 h-16 text-emerald-500" />;
        }
        return <FileText className="w-16 h-16 text-slate-400" />;
    };

    const handleCopyUrl = () => {
        const url = file.downloadUrl || file.path;
        navigator.clipboard.writeText(url);
        setIsCopying(true);
        toast.success('URL copiada al portapapeles');
        setTimeout(() => setIsCopying(false), 2000);
    };

    const handleDelete = async () => {
        if (file) {
            try {
                setIsDeleting(true);
                await onDelete(file.id);
                setIsDeleteConfirmOpen(false);
                onOpenChange(false);
            } catch (error) {
                console.error('Error deleting file:', error);
            } finally {
                setIsDeleting(false);
            }
        }
    };

    const downloadUrl = file.downloadUrl || file.path;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="flex flex-col h-full bg-white p-0">
                <SheetHeader>
                    <SheetTitle>Detalles del Archivo</SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Preview Section */}
                    <div className="h-52 w-full rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 overflow-hidden relative group">
                        {file.mimeType.includes('image') ? (
                            <img src={file.path} alt={file.name} className="w-full h-full object-contain" />
                        ) : (
                            getFileIcon(file.mimeType, file.name)
                        )}
                    </div>

                    {/* Metadata Section */}
                    <div className="space-y-6">
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
                                Nombre del archivo
                            </label>
                            <Input
                                value={file.name}
                                readOnly
                                className="bg-slate-50 border-none text-slate-700 font-medium"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                                    Tipo
                                </label>
                                <p className="text-sm text-slate-700 font-medium">{file.mimeType || 'Archivo'}</p>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                                    Tamaño
                                </label>
                                <p className="text-sm text-slate-700 font-medium">{formatSize(file.size)}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                                    Dimensiones
                                </label>
                                <p className="text-sm text-slate-700 font-medium">{dimensions || '-'}</p>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                                    Fecha de carga
                                </label>
                                <p className="text-sm text-slate-700 font-medium">
                                    {file.uploadedAt || '-'}
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                                Cloud Storage URL
                            </label>
                            <div className="space-y-2">
                                <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-500 break-all font-mono border border-slate-100">
                                    {downloadUrl}
                                </div>
                                <Button
                                    variant="primary"
                                    className="w-full bg-[#56a3e2] hover:bg-[#4a8ec5] text-white font-bold h-10"
                                    onClick={handleCopyUrl}
                                >
                                    {isCopying ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                                    {isCopying ? 'Copiado' : 'Copiar URL'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <SheetFooter className="p-6 border-t border-slate-50 flex flex-col gap-3 sm:flex-col sm:space-x-0 !mt-0 bg-slate-50/30">
                    <Button
                        variant="ghost"
                        className="w-full h-11 border border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300"
                        onClick={() => downloadFileFromUrl(downloadUrl, file.name)}
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Descargar Archivo
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full h-11 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => setIsDeleteConfirmOpen(true)}
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar permanentemente
                    </Button>
                </SheetFooter>
            </SheetContent>

            <ConfirmModal
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={handleDelete}
                title="Eliminar Archivo"
                description={`¿Estás seguro de que deseas eliminar permanentemente "${file.name}"? Esta acción no se puede deshacer.`}
                loading={isDeleting}
            />
        </Sheet>
    );
}
