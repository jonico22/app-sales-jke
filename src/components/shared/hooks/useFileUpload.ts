import { useState, useCallback, useRef, useEffect } from 'react';
import { fileService, FileCategory } from '@/services/file.service';
import { toast } from 'sonner';

export interface UseFileUploadProps {
  category: FileCategory;
  accept: string;
  maxSizeMB: number;
  onSuccess: (data?: any) => void;
}

export function useFileUpload({ category, accept, maxSizeMB, onSuccess }: UseFileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string, size: number, type: string, url?: string }>>([]);
  const [externalLink, setExternalLink] = useState({ name: '', url: '', mimeType: 'application/pdf' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): boolean => {
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
  }, [maxSizeMB, accept]);

  const handleFileSelect = useCallback((file: File | null) => {
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  }, [validateFile]);

  // Handle URL creation/revoking for previews
  useEffect(() => {
    if (!selectedFile) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      return;
    }

    if (selectedFile.type.startsWith('image/')) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }, [selectedFile]);

  const handleUpload = useCallback(async (fileToUpload: File) => {
    if (!fileToUpload) return;
    setIsUploading(true);
    try {
      const response = await fileService.upload(fileToUpload, category);
      toast.success('Archivo subido exitosamente');
      
      setUploadedFiles(prev => [...prev, { 
        name: fileToUpload.name, 
        size: fileToUpload.size, 
        type: fileToUpload.type, 
        url: fileToUpload.type.startsWith('image/') && previewUrl ? previewUrl : undefined 
      }]);
      
      setSelectedFile(null);
      setPreviewUrl(null);
      onSuccess(response.data);
    } catch (error) {
      toast.error('Error al subir el archivo');
    } finally {
      setIsUploading(false);
    }
  }, [category, onSuccess, previewUrl]);

  const handleRegisterExternal = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!externalLink.name || !externalLink.url) {
        toast.error('Por favor completa todos los campos');
        return;
    }

    try {
        new URL(externalLink.url);
    } catch (e) {
        toast.error('Por favor ingresa una URL válida');
        return;
    }

    setIsUploading(true);
    try {
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
            return true; // Used to trigger modal closing
        }
    } catch (error) {
        toast.error('Error al registrar el enlace');
    } finally {
        setIsUploading(false);
    }
    return false;
  }, [externalLink, category, onSuccess]);

  const resetUpload = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadedFiles([]);
    setExternalLink({ name: '', url: '', mimeType: 'application/pdf' });
  }, []);

  return {
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
  };
}
