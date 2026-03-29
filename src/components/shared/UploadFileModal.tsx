import React, { useState, useCallback } from 'react';
import { Upload, File as FileIcon, Link as LinkIcon } from 'lucide-react';

import { Modal } from '@/components/ui/Modal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FileCategory } from '@/services/file.service';

// Hooks
import { useFileUpload } from './hooks/useFileUpload';
import { useFileLibrary } from './hooks/useFileLibrary';
import { useImageEditor } from './hooks/useImageEditor';

// Sub-components
import { UploadTab } from './upload/UploadTab';
import { LibraryTab } from './upload/LibraryTab';
import { ExternalTab } from './upload/ExternalTab';

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

export const UploadFileModal = React.memo(({
    isOpen,
    onClose,
    onSuccess,
    cropShape = 'none',
    title = 'Subir Nuevo Archivo',
    accept = 'image/jpeg,image/png,image/webp,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv',
    category = FileCategory.GENERAL,
    maxSizeMB = 2,
    showLibraryTab = false
}: UploadFileModalProps) => {
    const [activeTab, setActiveTab] = useState('upload');

    // Logic Hooks
    const {
        isUploading,
        selectedFile,
        setSelectedFile,
        previewUrl,
        isDragging,
        setIsDragging,
        uploadedFiles,
        setUploadedFiles,
        externalLink,
        setExternalLink,
        fileInputRef,
        handleFileSelect,
        handleUpload,
        handleRegisterExternal,
        resetUpload
    } = useFileUpload({ category, accept, maxSizeMB, onSuccess });

    const {
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
    } = useFileLibrary({ category, showLibraryTab, activeTab });

    const {
        rotation,
        zoom,
        isCropping,
        // setIsCropping, // Removed unused
        rotateLeft,
        rotateRight,
        toggleCropping,
        resetEditor,
        getCroppedImage,
        setZoom
    } = useImageEditor({ previewUrl, selectedFile, cropShape });

    // Handlers
    const handleClose = useCallback(() => {
        resetUpload();
        resetLibrary();
        resetEditor();
        setActiveTab('upload');
        onClose();
    }, [onClose, resetUpload, resetLibrary, resetEditor]);

    const onFileSelectChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        handleFileSelect(e.target.files?.[0] || null);
    }, [handleFileSelect]);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileSelect(e.dataTransfer.files[0] || null);
    }, [handleFileSelect, setIsDragging]);

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, [setIsDragging]);

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, [setIsDragging]);

    const onInternalUpload = useCallback(async () => {
        const fileToUpload = await getCroppedImage();
        handleUpload(fileToUpload);
    }, [getCroppedImage, handleUpload]);

    const onRegisterExternal = useCallback(async (e: React.FormEvent) => {
        const success = await handleRegisterExternal(e);
        if (success) handleClose();
    }, [handleRegisterExternal, handleClose]);

    const onLibraryConfirm = useCallback(() => {
        if (selectedLibraryFile) {
            onSuccess(selectedLibraryFile);
            handleClose();
        }
    }, [selectedLibraryFile, onSuccess, handleClose]);

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={title}
            size="lg"
            contentClassName="flex flex-col max-h-[min(650px,85vh)] overflow-hidden"
        >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col min-h-0">
                <TabsList className="mb-6 shrink-0">
                    <TabsTrigger value="upload" className="flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Subir nuevo
                    </TabsTrigger>
                    {showLibraryTab && (
                        <TabsTrigger value="library" className="flex items-center gap-2">
                            <FileIcon className="w-4 h-4" />
                            Biblioteca
                        </TabsTrigger>
                    )}
                    <TabsTrigger value="external" className="flex items-center gap-2">
                        <LinkIcon className="w-4 h-4" />
                        Enlace Externo
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="flex-1 flex flex-col min-h-0">
                    <UploadTab
                        selectedFile={selectedFile}
                        previewUrl={previewUrl}
                        isDragging={isDragging}
                        isUploading={isUploading}
                        uploadedFiles={uploadedFiles}
                        maxSizeMB={maxSizeMB}
                        accept={accept}
                        cropShape={cropShape}
                        isCropping={isCropping}
                        zoom={zoom}
                        rotation={rotation}
                        fileInputRef={fileInputRef as any}
                        onFileSelect={onFileSelectChange}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onUpload={onInternalUpload}
                        onRemoveSelected={() => setSelectedFile(null)}
                        onToggleCropping={toggleCropping}
                        onRotateLeft={rotateLeft}
                        onRotateRight={rotateRight}
                        onZoomChange={setZoom}
                        onRemoveUploaded={(idx) => setUploadedFiles(prev => prev.filter((_, i) => i !== idx))}
                    />
                </TabsContent>

                <TabsContent value="library" className="flex-1 flex flex-col min-h-0">
                    <LibraryTab
                        libraryFiles={libraryFiles}
                        librarySearch={librarySearch}
                        onSearchChange={setLibrarySearch}
                        isLoading={isLoadingLibrary}
                        libraryPage={libraryPage}
                        libraryTotalPages={libraryTotalPages}
                        onPageChange={setLibraryPage}
                        selectedLibraryFile={selectedLibraryFile}
                        onSelectFile={setSelectedLibraryFile}
                        onConfirm={onLibraryConfirm}
                    />
                </TabsContent>

                <TabsContent value="external" className="flex-1 flex flex-col min-h-0">
                    <ExternalTab
                        externalLink={externalLink}
                        onExternalLinkChange={setExternalLink}
                        onSubmit={onRegisterExternal}
                        isUploading={isUploading}
                        onCancel={handleClose}
                    />
                </TabsContent>
            </Tabs>
        </Modal>
    );
});

UploadFileModal.displayName = 'UploadFileModal';
