import { useState, useEffect, useCallback } from 'react';
import {
    FileText,
    AlertCircle,
    CheckCircle2,
    Clock,
    FileCode,
    FileSpreadsheet
} from 'lucide-react';
import { parseISO, isValid, parse } from 'date-fns';
import { fileService, type FileMetadata } from '@/services/file.service';
import { toast } from 'sonner';

import { DownloadsHeader } from './components/DownloadsHeader';
import { ReportsTable } from './components/ReportsTable';
import { ReportsMobileList } from './components/ReportsMobileList';
import { StoragePolicy } from './components/StoragePolicy';

const safeParseDate = (dateStr: string | undefined | null): Date => {
    if (!dateStr) return new Date(NaN);
    let date = parseISO(dateStr);
    if (isValid(date) && date.getFullYear() > 1000) return date;
    date = parse(dateStr, 'dd/MM/yyyy HH:mm:ss', new Date());
    if (isValid(date)) return date;
    date = parse(dateStr, 'dd/MM/yyyy', new Date());
    if (isValid(date)) return date;
    return new Date(NaN);
};

export default function DownloadsPage() {
    const [reports, setReports] = useState<FileMetadata[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);

    const fetchReports = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fileService.getReports();
            if (response.success && response.data) {
                setReports(response.data.data);
                setTotal(response.data.pagination.total);
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
            toast.error('Error al cargar el historial de reportes');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const handleDelete = async (id: string) => {
        try {
            const response = await fileService.delete(id);
            if (response.success) {
                setReports(prev => prev.filter(r => r.id !== id));
                toast.success('Reporte eliminado correctamente');
            }
        } catch (error) {
            toast.error('Error al eliminar el reporte');
        }
    };

    const getStatusInfo = (status: string = 'AVAILABLE', expiresAt?: string) => {
        if (expiresAt) {
            const expDate = safeParseDate(expiresAt);
            if (isValid(expDate) && expDate < new Date()) {
                return {
                    label: 'Expirado',
                    className: 'bg-muted text-muted-foreground border-border hover:bg-muted',
                    icon: AlertCircle
                };
            }
        }

        switch (status) {
            case 'AVAILABLE':
                return {
                    label: 'Disponible',
                    className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/15',
                    icon: CheckCircle2
                };
            case 'EXPIRING_SOON':
                return {
                    label: 'Expira pronto',
                    className: 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/15',
                    icon: Clock
                };
            case 'EXPIRED':
                return {
                    label: 'Expirado',
                    className: 'bg-muted text-muted-foreground border-border hover:bg-muted',
                    icon: AlertCircle
                };
            default:
                return {
                    label: 'Disponible',
                    className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/15',
                    icon: CheckCircle2
                };
        }
    };

    const getFileIcon = (mimeType: string, fileName: string) => {
        if (mimeType.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
        if (mimeType.includes('csv')) return <FileCode className="w-5 h-5 text-emerald-500" />;
        if (mimeType.includes('spreadsheet') || fileName.endsWith('.xlsx')) {
            return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
        }
        return <FileText className="w-5 h-5 text-slate-400" />;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
            <DownloadsHeader />

            <div className="space-y-4">
                <ReportsTable 
                    reports={reports}
                    total={total}
                    onDelete={handleDelete}
                    getStatusInfo={getStatusInfo}
                    getFileIcon={getFileIcon}
                    safeParseDate={safeParseDate}
                />

                <ReportsMobileList 
                    reports={reports}
                    total={total}
                    onDelete={handleDelete}
                    getStatusInfo={getStatusInfo}
                    getFileIcon={getFileIcon}
                    safeParseDate={safeParseDate}
                />
            </div>

            <StoragePolicy />
        </div>
    );
}
