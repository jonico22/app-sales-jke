import { FileText, ChevronLeft, ChevronRight, Trash2, Download, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type FileMetadata } from '@/services/file.service';
import { cn } from '@/lib/utils';
import { format, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

interface ReportsMobileListProps {
  reports: FileMetadata[];
  total: number;
  onDelete: (id: string) => void;
  getStatusInfo: (status: string | undefined, expiresAt?: string) => any;
  getFileIcon: (mimeType: string, fileName: string) => React.ReactNode;
  safeParseDate: (dateStr: string | undefined | null) => Date;
}

export function ReportsMobileList({
  reports,
  total,
  onDelete,
  getStatusInfo,
  getFileIcon,
  safeParseDate
}: ReportsMobileListProps) {
  return (
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
              <div className="p-4 border-b border-border/30 flex items-center gap-3 bg-muted/5">
                <div className={cn("w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 border border-border/50", isExpired && "opacity-30")}>
                  {getFileIcon(report.mimeType, report.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[13px] font-black text-foreground tracking-tight truncate leading-tight uppercase">
                    {report.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] font-black text-primary/50 uppercase tracking-widest">Reporte</span>
                    <div className="w-1 h-1 rounded-full bg-border/50" />
                    <span className="text-[10px] font-black text-foreground/70 uppercase">{fileSize}</span>
                  </div>
                </div>
              </div>

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
                  onClick={() => onDelete(report.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })
      )}

      {/* Mobile Pagination */}
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
  );
}
