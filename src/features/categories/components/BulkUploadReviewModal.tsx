import { X, FileText, CheckCircle2, AlertCircle, CloudUpload, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface AnalyzedRow {
    row: number;
    data: {
        NombreCategoria?: string;
        CodigoCategoria?: string;
        Descripcion?: string;
        [key: string]: unknown;
    };
    isValid: boolean;
    errors: string[];
}

export interface FileAnalysis {
    totalRows: number;
    validRows: number;
    errorRows: number;
    rows: AnalyzedRow[];
    originalFile: File | null;
}

interface BulkUploadReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isUploading: boolean;
    fileAnalysis: FileAnalysis;
}

export function BulkUploadReviewModal({
    isOpen,
    onClose,
    onConfirm,
    isUploading,
    fileAnalysis
}: BulkUploadReviewModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-card rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-5 py-3.5 border-b border-border flex items-center justify-between bg-card shrink-0">
                    <div>
                        <h3 className="text-base font-bold text-foreground uppercase tracking-tight">Revisión de Carga</h3>
                        <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Verifique los datos antes de completar la importación.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
                        disabled={isUploading}
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3 shrink-0 bg-muted/20">
                    <div className="bg-card p-3 rounded-xl border border-border shadow-sm flex items-center gap-3">
                        <div className="bg-muted p-2 rounded-lg">
                            <FileText className="h-5 w-5 text-muted-foreground/70" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Filas Totales</p>
                            <p className="text-lg font-bold text-foreground">{fileAnalysis.totalRows}</p>
                        </div>
                    </div>

                    <div className="bg-card p-3 rounded-xl border-l-4 border-l-green-500 border-y border-r border-border shadow-sm flex items-center gap-3">
                        <div className="bg-green-500/10 p-2 rounded-lg">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-green-500 uppercase tracking-wider">Registros Válidos</p>
                            <p className="text-lg font-bold text-green-600 dark:text-green-500">{fileAnalysis.validRows}</p>
                        </div>
                    </div>

                    <div className="bg-card p-3 rounded-xl border-l-4 border-l-destructive border-y border-r border-border shadow-sm flex items-center gap-3">
                        <div className="bg-destructive/10 p-2 rounded-lg">
                            <AlertCircle className="h-5 w-5 text-destructive" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-destructive uppercase tracking-wider">Con Errores</p>
                            <p className="text-lg font-bold text-destructive">{fileAnalysis.errorRows}</p>
                        </div>
                    </div>
                </div>

                {/* Table/Content Area */}
                <div className="flex-1 overflow-auto px-5 pb-5 mt-4">
                    <div className="border border-border rounded-lg overflow-hidden">
                        <table className="w-full text-[11px] text-left">
                            <thead className="bg-muted/50 text-muted-foreground font-bold uppercase text-[10px] tracking-wider sticky top-0 z-10 shadow-sm border-b border-border">
                                <tr>
                                    <th className="px-3 py-2.5 w-14 text-center">Estatus</th>
                                    <th className="px-3 py-2.5 w-28">Código</th>
                                    <th className="px-3 py-2.5 w-56">Nombre</th>
                                    <th className="px-3 py-2.5 w-56">Descripción</th>
                                    <th className="px-3 py-2.5">Observaciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {fileAnalysis.rows.map((row, index) => (
                                    <tr key={index} className={`hover:bg-muted/50 transition-colors ${!row.isValid ? 'bg-destructive/5' : ''}`}>
                                        <td className="px-3 py-2 text-center">
                                            {row.isValid ? (
                                                <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" />
                                            ) : (
                                                <AlertTriangle className="h-4 w-4 text-destructive mx-auto" />
                                            )}
                                        </td>
                                        <td className={`px-3 py-2 font-bold ${!row.data.CodigoCategoria ? 'text-destructive italic' : 'text-foreground'}`}>
                                            {row.data.CodigoCategoria || '—'}
                                        </td>
                                        <td className={`px-3 py-2 font-medium ${!row.data.NombreCategoria ? 'text-destructive italic' : 'text-foreground'}`}>
                                            {row.data.NombreCategoria || '[Vacío]'}
                                        </td>
                                        <td className="px-3 py-2 text-muted-foreground/80 truncate max-w-xs" title={(row.data.Descripcion || '').toString()}>
                                            {row.data.Descripcion || '—'}
                                        </td>
                                        <td className="px-3 py-2">
                                            {row.isValid ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded bg-green-500/10 text-green-600 dark:text-green-500 text-[9px] font-bold uppercase tracking-tight border border-green-500/20">
                                                    Correcto
                                                </span>
                                            ) : (
                                                <div className="flex flex-col gap-0.5">
                                                    {row.errors.map((error, i) => (
                                                        <span key={i} className="inline-flex items-center gap-1 text-destructive text-[10px] font-semibold">
                                                            <AlertCircle className="h-2.5 w-2.5" /> {error}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {fileAnalysis.rows.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-3 py-10 text-center text-muted-foreground text-xs italic">
                                            No se encontraron datos para mostrar.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-border bg-muted/20 flex flex-col sm:flex-row items-center justify-between shrink-0 gap-3">
                    <div className="flex items-center gap-2 text-muted-foreground text-[10px] font-medium order-2 sm:order-1">
                        <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                        <p>Se ignorarán los registros con errores durante la importación.</p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto order-1 sm:order-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            disabled={isUploading}
                            className="flex-1 sm:flex-none h-9 text-muted-foreground hover:text-foreground hover:bg-muted uppercase text-[10px] font-bold tracking-wider px-4 transition-all active:scale-95"
                        >
                            Cancelar
                        </Button>
                        <Button
                            size="sm"
                            onClick={onConfirm}
                            disabled={fileAnalysis.validRows === 0 || isUploading}
                            className="flex-1 sm:flex-none h-9 bg-primary hover:bg-primary/90 text-primary-foreground uppercase text-[10px] font-bold tracking-wider px-6 flex items-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95"
                        >
                            {isUploading ? (
                                <>Importando...</>
                            ) : (
                                <>
                                    <CloudUpload className="h-3.5 w-3.5" />
                                    Confirmar Importación ({fileAnalysis.validRows})
                                </>
                            )}
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    );
}
