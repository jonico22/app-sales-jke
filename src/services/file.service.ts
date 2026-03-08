import api from './api.client';
import type { Pagination } from './order.service';

export const FileCategory = {
    REPORT: 'REPORT',
    GENERAL: 'GENERAL'
} as const;

export type FileCategory = typeof FileCategory[keyof typeof FileCategory];

export interface FileMetadata {
    id: string;
    name: string;
    originalName?: string;
    mimeType: string;
    size: number;
    path: string;
    key: string;
    category: FileCategory;
    status?: string;
    downloadUrl?: string;
    storageType?: 'EXTERNAL' | 'INTERNAL';
    uploadedAt?: string;
    expiresAt?: string;
    societyId?: string;
    uploadedById?: string;
    uploadedBy?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface FileResponse {
    success?: boolean;
    message?: string;
    data: FileMetadata;
}

export interface FileListResponse {
    success?: boolean;
    message?: string;
    data: {
        data: FileMetadata[];
        pagination: Pagination;
        storageInfo?: {
            limitBytes: number;
            usedBytes: number;
        };
    };
}

export interface FileQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    category?: FileCategory;
    excludeCategory?: FileCategory;
}

export interface RegisterExternalRequest {
    name: string;
    path: string;
    mimeType: string;
    storageType: 'EXTERNAL';
    category: FileCategory;
}

export interface UpdateFileRequest {
    name?: string;
    category?: FileCategory;
    path?: string; // in case we want to update external links
}

export const fileService = {
    /**
     * Listado de Reportes
     * Endpoint: GET /api/sales/files/reports
     * Filtra automáticamente por category=REPORT
     */
    getReports: async (params?: Partial<FileQueryParams>): Promise<FileListResponse> => {
        const response = await api.get<FileListResponse>('/sales/files/reports', { params });
        return response.data;
    },

    /**
     * Galería General de Archivos
     * Endpoint: GET /api/sales/files
     * Excluye automáticamente los reportes (excludeCategory=REPORT)
     */
    getGallery: async (params?: Partial<FileQueryParams>): Promise<FileListResponse> => {
        const response = await api.get<FileListResponse>('/sales/files', {
            params: { ...params, excludeCategory: FileCategory.REPORT }
        });
        return response.data;
    },

    /**
     * Subir Archivo Físico (R2)
     * Endpoint: POST /api/sales/files/upload
     * Content-Type: multipart/form-data
     */
    upload: async (file: File, category?: FileCategory): Promise<FileResponse> => {
        const formData = new FormData();
        formData.append('file', file);
        if (category) {
            formData.append('category', category);
        }

        const response = await api.post<FileResponse>('/sales/files/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    /**
     * Registrar Enlace Externo
     * Endpoint: POST /api/sales/files
     * Registra un archivo ya alojado en otro servicio.
     */
    registerExternal: async (data: RegisterExternalRequest): Promise<FileResponse> => {
        const response = await api.post<FileResponse>('/sales/files', data);
        return response.data;
    },

    /**
     * Ver Detalle de un Archivo
     * Endpoint: GET /api/sales/files/:id
     */
    getById: async (id: string): Promise<FileResponse> => {
        const response = await api.get<FileResponse>(`/sales/files/${id}`);
        return response.data;
    },

    /**
     * Actualizar Metadatos
     * Endpoint: PUT /api/sales/files/:id
     * Para renombrar, cambiar el enlace o la categoría.
     */
    update: async (id: string, data: UpdateFileRequest): Promise<FileResponse> => {
        const response = await api.put<FileResponse>(`/sales/files/${id}`, data);
        return response.data;
    },

    /**
     * Eliminar Archivo (Limpieza Total)
     * Endpoint: DELETE /api/sales/files/:id
     * Elimina el registro de la DB y el archivo físico de R2.
     */
    delete: async (id: string): Promise<{ success: boolean; message: string }> => {
        const response = await api.delete<{ success: boolean; message: string }>(`/sales/files/${id}`);
        return response.data;
    }
};
