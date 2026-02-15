import { X, FileText, CheckCircle2, AlertCircle, CloudUpload, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui';

export interface AnalyzedRow {
    row: number;
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Revisión de Carga de Archivo</h3>
                        <p className="text-sm text-slate-500">Verifique los datos antes de completar la importación al sistema.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                        disabled={isUploading}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0 bg-slate-50/50">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="bg-slate-100 p-3 rounded-lg">
                            <FileText className="h-6 w-6 text-slate-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filas Totales</p>
                            <p className="text-2xl font-bold text-slate-800">{fileAnalysis.totalRows}</p>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border-l-4 border-l-green-500 border-y border-r border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="bg-green-50 p-3 rounded-lg">
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-green-600 uppercase tracking-wider">Registros Válidos</p>
                            <p className="text-2xl font-bold text-green-700">{fileAnalysis.validRows}</p>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border-l-4 border-l-red-500 border-y border-r border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="bg-red-50 p-3 rounded-lg">
                            <AlertCircle className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-red-600 uppercase tracking-wider">Con Errores</p>
                            <p className="text-2xl font-bold text-red-700">{fileAnalysis.errorRows}</p>
                        </div>
                    </div>
                </div>

                {/* Table/Content Area */}
                <div className="flex-1 overflow-auto px-6 pb-6">
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="px-4 py-3 w-16 text-center">Estado</th>
                                    <th className="px-4 py-3 w-32">Código</th>
                                    <th className="px-4 py-3 w-64">Nombre</th>
                                    <th className="px-4 py-3 w-64">Descripción</th>
                                    <th className="px-4 py-3">Observaciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {fileAnalysis.rows.map((row, index) => (
                                    <tr key={index} className={`hover:bg-slate-50 transition-colors ${!row.isValid ? 'bg-red-50/30' : ''}`}>
                                        <td className="px-4 py-3 text-center">
                                            {row.isValid ? (
                                                <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                                            ) : (
                                                <AlertTriangle className="h-5 w-5 text-red-500 mx-auto" />
                                            )}
                                        </td>
                                        <td className={`px-4 py-3 font-medium ${!row.data.CodigoCategoria ? 'text-red-500 italic' : 'text-slate-700'}`}>
                                            {row.data.CodigoCategoria || '—'}
                                        </td>
                                        <td className={`px-4 py-3 ${!row.data.NombreCategoria ? 'text-red-500 italic' : 'text-slate-700'}`}>
                                            {row.data.NombreCategoria || '[Vacío]'}
                                        </td>
                                        <td className="px-4 py-3 text-slate-500 truncate max-w-xs" title={row.data.Descripcion}>
                                            {row.data.Descripcion || '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            {row.isValid ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wide">
                                                    Correcto
                                                </span>
                                            ) : (
                                                <div className="flex flex-col gap-1">
                                                    {row.errors.map((error, i) => (
                                                        <span key={i} className="inline-flex items-center gap-1 text-red-600 text-xs font-medium">
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
                                        <td colSpan={5} className="px-4 py-12 text-center text-slate-400">
                                            No se encontraron datos para mostrar.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2 text-slate-500 text-xs">
                        <AlertCircle className="h-4 w-4" />
                        <p>Se ignorarán los registros con errores durante la importación.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={isUploading}
                            className="px-6 border-slate-300 text-slate-600 hover:text-slate-800 uppercase text-xs font-bold tracking-wide"
                        >
                            Cancelar y Volver
                        </Button>
                        <Button
                            onClick={onConfirm}
                            disabled={fileAnalysis.validRows === 0 || isUploading}
                            className="px-6 bg-[#0ea5e9] hover:bg-sky-600 text-white uppercase text-xs font-bold tracking-wide flex items-center gap-2"
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
