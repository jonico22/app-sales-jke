import { X, FileText, CheckCircle2, AlertCircle, CloudUpload, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface AnalyzedRow {
    row: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4">
            <div className="bg-card rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-border flex items-center justify-between gap-3 bg-card shrink-0">
                    <div className="min-w-0">
                        <h3 className="text-sm sm:text-base font-semibold text-foreground tracking-tight">Revisión de Carga Masiva</h3>
                        <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Verifique los datos antes de completar la importación al sistema.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
                        disabled={isUploading}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 shrink-0 bg-muted/30">
                    <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-4">
                        <div className="bg-muted p-3 rounded-lg">
                            <FileText className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.12em]">Filas Totales</p>
                            <p className="text-2xl font-semibold text-foreground tabular-nums">{fileAnalysis.totalRows}</p>
                        </div>
                    </div>

                    <div className="bg-card p-4 rounded-xl border-l-4 border-l-green-500 border-y border-r border-border shadow-sm flex items-center gap-4">
                        <div className="bg-green-500/10 p-3 rounded-lg">
                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-green-500 uppercase tracking-[0.12em]">Registros Válidos</p>
                            <p className="text-2xl font-semibold text-green-600 dark:text-green-500 tabular-nums">{fileAnalysis.validRows}</p>
                        </div>
                    </div>

                    <div className="bg-card p-4 rounded-xl border-l-4 border-l-destructive border-y border-r border-border shadow-sm flex items-center gap-4">
                        <div className="bg-destructive/10 p-3 rounded-lg">
                            <AlertCircle className="h-6 w-6 text-destructive" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-destructive uppercase tracking-[0.12em]">Con Errores</p>
                            <p className="text-2xl font-semibold text-destructive tabular-nums">{fileAnalysis.errorRows}</p>
                        </div>
                    </div>
                </div>

                {/* Table/Content Area */}
                <div className="flex-1 overflow-auto px-4 sm:px-6 pb-4 sm:pb-6">
                    <div className="border border-border rounded-lg overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground font-semibold uppercase text-xs tracking-[0.12em] sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="px-4 py-3 w-16 text-center">Estado</th>
                                    <th className="px-4 py-3 w-32">Código</th>
                                    <th className="px-4 py-3 w-64">Nombre</th>
                                    <th className="px-4 py-3 w-32">Categoría</th>
                                    <th className="px-4 py-3 w-24 text-right">Precio</th>
                                    <th className="px-4 py-3 w-20 text-center">Stock</th>
                                    <th className="px-4 py-3">Observaciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {fileAnalysis.rows.map((row, index) => (
                                    <tr key={index} className={`hover:bg-muted/50 transition-colors ${!row.isValid ? 'bg-destructive/10' : ''}`}>
                                        <td className="px-4 py-3 text-center">
                                            {row.isValid ? (
                                                <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                                            ) : (
                                                <AlertTriangle className="h-5 w-5 text-destructive mx-auto" />
                                            )}
                                        </td>
                                        <td className={`px-4 py-3 font-semibold ${!row.data.CodigoInterno ? 'text-destructive italic' : 'text-foreground'}`}>
                                            {row.data.CodigoInterno || '—'}
                                        </td>
                                        <td className={`px-4 py-3 ${!row.data.NombreProducto ? 'text-destructive italic' : 'text-foreground'}`}>
                                            {row.data.NombreProducto || '[Vacío]'}
                                        </td>
                                        <td className={`px-4 py-3 ${!row.data.CodigoCategoria ? 'text-destructive italic' : 'text-muted-foreground'}`}>
                                            {row.data.CodigoCategoria || '—'}
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono font-medium text-foreground">
                                            {row.data.PrecioVenta ? parseFloat(row.data.PrecioVenta).toFixed(2) : '—'}
                                        </td>
                                        <td className="px-4 py-3 text-center font-mono font-medium text-foreground">
                                            {row.data.StockInicial || '0'}
                                        </td>
                                        <td className="px-4 py-3">
                                            {row.isValid ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded bg-green-500/10 text-green-600 dark:text-green-500 text-[10px] font-semibold uppercase tracking-[0.12em]">
                                                    Correcto
                                                </span>
                                            ) : (
                                                <div className="flex flex-col gap-1">
                                                    {row.errors.map((error, i) => (
                                                        <span key={i} className="inline-flex items-center gap-1 text-destructive text-xs font-medium">
                                                            <AlertCircle className="h-3 w-3" /> {error}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {fileAnalysis.rows.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                                            No se encontraron datos para mostrar.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-4 sm:px-6 py-4 border-t border-border bg-muted/30 flex flex-col sm:flex-row items-center justify-between shrink-0 gap-3">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs order-2 sm:order-1">
                        <AlertCircle className="h-4 w-4" />
                        <p>Se ignorarán los registros con errores durante la importación.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto order-1 sm:order-2">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={isUploading}
                            className="w-full sm:w-auto px-6 border-input text-muted-foreground hover:text-foreground hover:bg-muted uppercase text-xs font-semibold tracking-[0.12em]"
                        >
                            Cancelar y Volver
                        </Button>
                        <Button
                            onClick={onConfirm}
                            disabled={fileAnalysis.validRows === 0 || isUploading}
                            className="w-full sm:w-auto px-6 bg-primary hover:bg-primary/90 text-primary-foreground uppercase text-xs font-semibold tracking-[0.12em] flex items-center justify-center gap-2"
                        >
                            {isUploading ? (
                                <>Importando...</>
                            ) : (
                                <>
                                    <CloudUpload className="h-4 w-4" />
                                    Confirmar e Importar ({fileAnalysis.validRows})
                                </>
                            )}
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    );
}
