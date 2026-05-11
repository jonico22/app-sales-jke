import { type LucideIcon, FileText, ChevronLeft, ChevronRight, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type FileMetadata } from '@/services/file.service';
import { cn } from '@/lib/utils';
import { format, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import { dataTableFooterClassName, dataTableHeadClassName, dataTableHeaderRowClassName, dataTableRowClassName } from '@/components/shared/dataTableStyles';

interface StatusInfo {
  label: string;
  className: string;
  icon: LucideIcon;
}

interface ReportsTableProps {
  reports: FileMetadata[];
  total: number;
  onDelete: (id: string) => void;
  getStatusInfo: (status: string | undefined, expiresAt?: string) => StatusInfo;
  getFileIcon: (mimeType: string, fileName: string) => React.ReactNode;
  safeParseDate: (dateStr: string | undefined | null) => Date;
}

export function ReportsTable({
  reports,
  total,
  onDelete,
  getStatusInfo,
  getFileIcon,
  safeParseDate
}: ReportsTableProps) {
  return (
    <Card className="hidden md:block bg-card border-border/80 overflow-hidden shadow-sm rounded-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className={dataTableHeaderRowClassName}>
              <th className={`${dataTableHeadClassName} px-5 py-3`}>Archivo</th>
              <th className={`${dataTableHeadClassName} px-5 py-3`}>Generación</th>
              <th className={`${dataTableHeadClassName} px-5 py-3`}>Expiración</th>
              <th className={`${dataTableHeadClassName} px-5 py-3`}>Tamaño</th>
              <th className={`${dataTableHeadClassName} px-5 py-3`}>Estado</th>
              <th className={`${dataTableHeadClassName} px-5 py-3 text-right`}>Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/70">
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
                  <tr key={report.id} className={dataTableRowClassName}>
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
                          onClick={() => onDelete(report.id)}
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

      {/* Pagination Footer */}
      <div className={dataTableFooterClassName}>
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-tight leading-none">
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
  );
}
