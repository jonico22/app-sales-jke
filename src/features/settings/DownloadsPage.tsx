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
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
            {/* Breadcrumbs & Title */}
            <div className="space-y-1.5">
                <nav className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold tracking-tight">
                    <span className="opacity-50 uppercase">Configuración</span>
                    <span className="opacity-30">/</span>
                    <span className="text-primary uppercase">Descargas</span>
                </nav>

                <div className="space-y-0.5">
                    <h1 className="text-lg font-bold text-foreground tracking-tight uppercase">Historial de Reportes</h1>
                    <p className="text-muted-foreground text-[11px] max-w-2xl font-medium">
                        Reportes procesados en segundo plano. Los archivos se eliminan automáticamente tras 7 días.
                    </p>
                </div>
            </div>

            {/* Reports List */}
            <div className="space-y-4">
                {/* Desktop Table view */}
                <Card className="hidden md:block bg-card border-border overflow-hidden shadow-none rounded-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-muted/30 border-b border-border">
                                    <th className="px-5 py-3 font-semibold text-muted-foreground/70 uppercase tracking-wider text-[10px]">Archivo</th>
                                    <th className="px-5 py-3 font-semibold text-muted-foreground/70 uppercase tracking-wider text-[10px]">Generación</th>
                                    <th className="px-5 py-3 font-semibold text-muted-foreground/70 uppercase tracking-wider text-[10px]">Expiración</th>
                                    <th className="px-5 py-3 font-semibold text-muted-foreground/70 uppercase tracking-wider text-[10px]">Tamaño</th>
                                    <th className="px-5 py-3 font-semibold text-muted-foreground/70 uppercase tracking-wider text-[10px]">Estado</th>
                                    <th className="px-5 py-3 font-semibold text-muted-foreground/70 uppercase tracking-wider text-[10px] text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {reports.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <FileText size={32} className="opacity-10 mb-1" />
                                                <p className="font-semibold text-sm">No hay reportes disponibles</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    reports.map((report) => {
                                        const statusInfo = getStatusInfo(report.status, report.expiresAt);
                                        const isExpired = statusInfo.label === 'Expirado';
                                        const genDate = report.uploadedAt || report.createdAt;
                                        const expDate = report.expiresAt;

                                        return (
                                            <tr key={report.id} className="hover:bg-muted/10 transition-colors group">
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn("w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 border border-border transition-all", isExpired && "opacity-30")}>
                                                            {getFileIcon(report.mimeType, report.name)}
                                                        </div>
                                                        <span className={cn("font-semibold text-foreground tracking-tight", isExpired && "text-muted-foreground opacity-50")}>
                                                            {report.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3 text-muted-foreground whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-foreground/80">{genDate ? (() => {
                                                            const d = safeParseDate(genDate);
                                                            return isValid(d) ? format(d, "dd/MM/yyyy HH:mm:ss", { locale: es }) : '-';
                                                        })() : '-'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3 text-muted-foreground whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className={cn("font-medium", report.status === 'EXPIRING_SOON' ? "text-amber-500" : "text-foreground/80")}>
                                                            {expDate ? (() => {
                                                                const d = safeParseDate(expDate);
                                                                return isValid(d) ? format(d, "d MMM yyyy", { locale: es }) : 'N/A';
                                                            })() : 'N/A'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3 text-muted-foreground font-medium">
                                                    {report.size > 1024 * 1024
                                                        ? `${(report.size / (1024 * 1024)).toFixed(2)} MB`
                                                        : `${(report.size / 1024).toFixed(0)} KB`}
                                                </td>
                                                <td className="px-5 py-3">
                                                    <Badge
                                                        variant="outline"
                                                        className={cn(
                                                            "px-2 py-0.5 rounded-md font-bold text-[9px] flex items-center gap-1 w-fit border shadow-none uppercase tracking-wider",
                                                            statusInfo.className
                                                        )}
                                                    >
                                                        <statusInfo.icon size={10} />
                                                        {statusInfo.label}
                                                    </Badge>
                                                </td>
                                                <td className="px-5 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2 transition-opacity">
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            className={cn(
                                                                "bg-primary hover:bg-primary-hover text-primary-foreground border-none h-8 px-3 rounded-lg font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95 uppercase text-[10px] tracking-wider",
                                                                isExpired && "bg-muted text-muted-foreground cursor-not-allowed hover:bg-muted shadow-none opacity-50"
                                                            )}
                                                            disabled={isExpired}
                                                            onClick={() => window.open(report.downloadUrl || report.path, '_blank')}
                                                        >
                                                            <Download className="w-3.5 h-3.5" />
                                                            Descargar
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-8 w-8 rounded-lg border-border bg-card text-muted-foreground hover:text-danger hover:border-danger/30 hover:bg-danger/5 transition-all active:scale-95"
                                                            onClick={() => handleDelete(report.id)}
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Desktop Pagination */}
                    <div className="px-5 py-3 bg-muted/20 border-t border-border flex items-center justify-between">
                        <p className="text-[11px] font-medium text-muted-foreground">
                            Mostrando <span className="text-foreground font-bold">{reports.length}</span> de <span className="text-foreground font-bold">{total}</span> reportes
                        </p>
                        <div className="flex items-center gap-1.5">
                            <Button variant="outline" size="icon" className="h-7 w-7 rounded-lg border-border bg-card hover:bg-muted disabled:opacity-30 active:scale-95 transition-all" disabled>
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="h-7 w-7 rounded-lg border-border bg-card hover:bg-muted active:scale-95 transition-all">
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                    {reports.length === 0 ? (
                        <Card className="p-12 text-center text-muted-foreground/50 bg-card/50 rounded-2xl border-dashed">
                            <FileText size={40} className="mx-auto mb-3 opacity-10" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Sin reportes registrados</p>
                        </Card>
                    ) : (
                        reports.map((report) => {
                            const statusInfo = getStatusInfo(report.status, report.expiresAt);
                            const isExpired = statusInfo.label === 'Expirado';
                            const genDateStr = report.uploadedAt || report.createdAt;
                            const expDateStr = report.expiresAt;
                            const fileSize = report.size > 1024 * 1024
                                ? `${(report.size / (1024 * 1024)).toFixed(2)} MB`
                                : `${(report.size / 1024).toFixed(0)} KB`;

                            return (
                                <div 
                                    key={report.id}
                                    className={cn(
                                        "bg-card rounded-2xl border border-border/80 shadow-none relative overflow-hidden flex flex-col transition-all active:scale-[0.99]",
                                        isExpired && "opacity-60"
                                    )}
                                >
                                    {/* 1. Header: File Icon + Name + Size (Safe Layout) */}
                                    <div className="p-4 border-b border-border/30 flex items-center gap-3 bg-muted/5">
                                        <div className={cn("w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 border border-border/50", isExpired && "opacity-30")}>
                                            {getFileIcon(report.mimeType, report.name)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-[13px] font-black text-foreground tracking-tight truncate leading-tight uppercase">
                                                {report.name}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[9px] font-black text-primary/50 uppercase tracking-widest">Informativo</span>
                                                <div className="w-1 h-1 rounded-full bg-border/50" />
                                                <span className="text-[10px] font-black text-foreground/70 uppercase">{fileSize}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2. Info Row: Dates & Status */}
                                    <div className="p-4 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[8px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] mb-1.5">Generación</p>
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-foreground/80">
                                                    <Clock size={10} className="opacity-40" />
                                                    <span>{genDateStr ? (() => {
                                                        const d = safeParseDate(genDateStr);
                                                        return isValid(d) ? format(d, "dd MMM, hh:mm a", { locale: es }) : '-';
                                                    })() : '-'}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] mb-1.5">Expira en</p>
                                                <div className={cn("flex items-center gap-1.5 text-[10px] font-bold", report.status === 'EXPIRING_SOON' ? "text-amber-500" : "text-foreground/80")}>
                                                    <AlertCircle size={10} className="opacity-40" />
                                                    <span>{expDateStr ? (() => {
                                                        const d = safeParseDate(expDateStr);
                                                        return isValid(d) ? format(d, "d MMM yyyy", { locale: es }) : 'N/A';
                                                    })() : 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-border/10">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">Estado</span>
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        "px-2 py-0.5 rounded-md font-bold text-[8px] flex items-center gap-1 border shadow-none uppercase tracking-wider",
                                                        statusInfo.className
                                                    )}
                                                >
                                                    <statusInfo.icon size={10} />
                                                    {statusInfo.label}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 3. Actions Footer */}
                                    <div className="p-3 bg-muted/20 border-t border-border/30 flex items-center gap-2">
                                        <Button
                                            className={cn(
                                                "flex-1 flex items-center justify-center gap-2 h-11 bg-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-[0.97]",
                                                isExpired && "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                                            )}
                                            disabled={isExpired}
                                            onClick={() => window.open(report.downloadUrl || report.path, '_blank')}
                                        >
                                            <Download className="w-4 h-4" />
                                            Descargar Reporte
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="w-11 h-11 rounded-xl border-border bg-card text-muted-foreground hover:text-destructive hover:bg-destructive/5 active:scale-[0.97] transition-all"
                                            onClick={() => handleDelete(report.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    
                    {/* Mobile Pagination (Simplified) */}
                    <div className="flex items-center justify-between p-2">
                        <span className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest">
                            {total} total
                        </span>
                        <div className="flex gap-2">
                            <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-border bg-card opacity-50" disabled>
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-border bg-card">
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Storage Policy */}
            <div className="p-4 sm:p-5 rounded-xl bg-primary/5 border border-primary/10 flex flex-col sm:flex-row gap-3 sm:gap-4 animate-in slide-in-from-bottom-4 duration-700 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] transition-opacity group-hover:opacity-[0.05] rotate-12 pointer-events-none">
                    <FileText size={60} />
                </div>
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20">
                    <Info className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-0.5 relative z-10">
                    <h3 className="text-xs sm:text-sm font-bold text-foreground tracking-tight uppercase">Política de Almacenamiento</h3>
                    <p className="text-muted-foreground leading-relaxed max-w-3xl font-medium text-[10px] sm:text-[11px]">
                        Los reportes se eliminan automáticamente después de <span className="font-bold text-primary bg-primary/10 px-1 py-0.5 rounded-md text-[9px] sm:text-[10px]">7 días naturales</span> de su generación. Descargue archivos importantes antes de su expiración.
                    </p>
                </div>
            </div>
        </div>
    );
}
