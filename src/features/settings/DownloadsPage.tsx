import { useState, useEffect } from 'react';
import {
    FileText,
    Download,
    Trash2,
    Info,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    CheckCircle2,
    Clock,
    FileCode,
    FileSpreadsheet
} from 'lucide-react';
import { format, parseISO, isValid, parse } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button, Card, Badge } from '@/components/ui';
import { fileService, type FileMetadata } from '@/services/file.service';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const safeParseDate = (dateStr: string | undefined | null): Date => {
    if (!dateStr) return new Date(NaN);

    // Try ISO first
    let date = parseISO(dateStr);
    if (isValid(date) && date.getFullYear() > 1000) return date;

    // Try dd/MM/yyyy HH:mm:ss
    date = parse(dateStr, 'dd/MM/yyyy HH:mm:ss', new Date());
    if (isValid(date)) return date;

    // Try dd/MM/yyyy
    date = parse(dateStr, 'dd/MM/yyyy', new Date());
    if (isValid(date)) return date;

    return new Date(NaN);
};

export default function DownloadsPage() {
    const [reports, setReports] = useState<FileMetadata[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const fetchReports = async () => {
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
        };

        fetchReports();
    }, []);

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
        // We can derive status from expiration date if it exists
        if (expiresAt) {
            const expDate = safeParseDate(expiresAt);
            if (isValid(expDate) && expDate < new Date()) {
                return {
                    label: 'Expirado',
                    className: 'bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-50',
                    icon: AlertCircle
                };
            }
        }

        switch (status) {
            case 'AVAILABLE':
                return {
                    label: 'Disponible',
                    className: 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-50',
                    icon: CheckCircle2
                };
            case 'EXPIRING_SOON':
                return {
                    label: 'Expira pronto',
                    className: 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-50',
                    icon: Clock
                };
            case 'EXPIRED':
                return {
                    label: 'Expirado',
                    className: 'bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-50',
                    icon: AlertCircle
                };
            default:
                return {
                    label: 'Disponible',
                    className: 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-50',
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
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Breadcrumbs & Title */}
            <div className="space-y-4">
                <nav className="flex items-center gap-2 text-sm text-slate-400">
                    <span>Configuración</span>
                    <span>/</span>
                    <span className="text-slate-600 font-medium">DESCARGAS</span>
                </nav>

                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Historial de Reportes Generados</h1>
                    <p className="text-slate-500">
                        Aquí encontrarás los reportes procesados en segundo plano. Los archivos tienen una duración limitada antes de expirar.
                    </p>
                </div>
            </div>

            {/* Reports Card */}
            <Card className="border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Nombre del Reporte</th>
                                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Fecha de Generación</th>
                                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Fecha de Expiración</th>
                                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Tamaño</th>
                                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Estado</th>
                                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[11px] text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {reports.map((report) => {
                                const statusInfo = getStatusInfo(report.status, report.expiresAt);
                                const isExpired = statusInfo.label === 'Expirado';
                                const genDate = report.uploadedAt || report.createdAt;
                                const expDate = report.expiresAt;

                                return (
                                    <tr key={report.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={cn("p-2 rounded-lg bg-slate-50 transition-colors", isExpired && "opacity-50")}>
                                                    {getFileIcon(report.mimeType, report.name)}
                                                </div>
                                                <span className={cn("font-medium text-slate-700", isExpired && "text-slate-400")}>
                                                    {report.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span>{genDate ? (() => {
                                                    const d = safeParseDate(genDate);
                                                    return isValid(d) ? format(d, "d MMM yyyy, hh:mm", { locale: es }) : '-';
                                                })() : '-'}</span>
                                                <span className="text-[10px] uppercase">{genDate ? (() => {
                                                    const d = safeParseDate(genDate);
                                                    return isValid(d) ? format(d, "a") : '';
                                                })() : ''}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className={cn(report.status === 'EXPIRING_SOON' && "text-amber-600 font-medium")}>
                                                    {expDate ? (() => {
                                                        const d = safeParseDate(expDate);
                                                        return isValid(d) ? format(d, "d MMM yyyy", { locale: es }) : 'N/A';
                                                    })() : 'N/A'}
                                                </span>
                                                {report.status === 'EXPIRING_SOON' && (
                                                    <span className="text-[10px] text-amber-500 font-medium">Expira pronto</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {report.size > 1024 * 1024
                                                ? `${(report.size / (1024 * 1024)).toFixed(2)} MB`
                                                : `${(report.size / 1024).toFixed(0)} KB`}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "px-2.5 py-0.5 rounded-md font-medium text-[11px] flex items-center gap-1.5 w-fit border shadow-none",
                                                    statusInfo.className
                                                )}
                                            >
                                                {statusInfo.label}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className={cn(
                                                        "bg-sky-500 hover:bg-sky-600 text-white border-none h-9 px-4 rounded-lg font-bold transition-all shadow-sm flex items-center gap-2",
                                                        isExpired && "bg-slate-100 text-slate-400 cursor-not-allowed hover:bg-slate-100"
                                                    )}
                                                    disabled={isExpired}
                                                    onClick={() => window.open(report.downloadUrl || report.path, '_blank')}
                                                >
                                                    <Download className="w-4 h-4" />
                                                    Descargar
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-9 w-9 rounded-lg border-slate-200 text-slate-400 hover:text-destructive hover:border-destructive/30 hover:bg-destructive/5 transition-all"
                                                    onClick={() => handleDelete(report.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                        Mostrando <span className="font-medium text-slate-700">{reports.length}</span> de <span className="font-medium text-slate-700">{total}</span> reportes procesados
                    </p>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-slate-200 disabled:opacity-50" disabled>
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-slate-200">
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Storage Policy */}
            <div className="p-6 rounded-2xl bg-[#eff6ff] border border-[#dbeafe] flex gap-4 animate-in slide-in-from-bottom-4 duration-700">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Info className="w-5 h-5 text-[#3b82f6]" />
                </div>
                <div className="space-y-1">
                    <h3 className="font-bold text-slate-800">Política de Almacenamiento</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        Los reportes se eliminan automáticamente después de <span className="font-bold text-[#3b82f6]">7 días naturales</span> de su generación para optimizar el espacio de almacenamiento. Asegúrese de descargar los archivos importantes antes de su fecha de expiración.
                    </p>
                </div>
            </div>
        </div>
    );
}
