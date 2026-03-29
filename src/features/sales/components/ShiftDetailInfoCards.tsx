import { Building2, User, LogIn, LogOut } from 'lucide-react';
import type { CashShiftDetail } from '@/services/cash-shift.service';
import { fmtDate } from './SalesUtils';

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-center gap-2.5 sm:gap-3 bg-card border border-border rounded-2xl px-3 sm:px-4 py-3 shadow-sm">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-muted flex items-center justify-center shrink-0 text-muted-foreground">
                {icon}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-tight sm:tracking-wider leading-none mb-1">{label}</p>
                <p className="text-[13px] sm:text-sm font-bold text-foreground leading-tight break-words">{value}</p>
            </div>
        </div>
    );
}

interface ShiftDetailInfoCardsProps {
    shift: CashShiftDetail;
}

export function ShiftDetailInfoCards({ shift }: ShiftDetailInfoCardsProps) {
    const s = shift as any;
    
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
            <InfoCard
                icon={<Building2 size={16} />}
                label="Sucursal"
                value={shift.branch?.name ?? '—'}
            />
            <InfoCard
                icon={<User size={16} />}
                label="Cajero"
                value={s.userName ?? s.userId?.slice(0, 8) ?? '—'}
            />
            <InfoCard
                icon={<LogIn size={16} />}
                label="Apertura"
                value={fmtDate(shift.openedAt, 'dd/MM/yyyy hh:mm a')}
            />
            <InfoCard
                icon={<LogOut size={16} />}
                label="Cierre"
                value={shift.closedAt ? fmtDate(shift.closedAt, 'dd/MM/yyyy hh:mm a') : 'En curso...'}
            />
        </div>
    );
}
