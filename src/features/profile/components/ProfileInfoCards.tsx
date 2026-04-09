import { Shield, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { type User, type Role } from '@/services/auth.service';

interface ProfileInfoCardsProps {
    user: User | null;
    role: Role | null;
}

export function ProfileInfoCards({ user, role }: ProfileInfoCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
            {/* Role Information */}
            <Card className="p-8 border-border shadow-sm rounded-2xl flex flex-col justify-between">
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-[0.08em]">Rol del Usuario</h3>
                    <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full w-fit border border-primary/20">
                        <Shield className="h-4 w-4" />
                        <span className="text-xs font-semibold uppercase tracking-[0.12em]">{role?.name || 'Usuario'}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        {role?.code === 'ADMIN'
                            ? 'Tienes acceso total a todas las configuraciones y módulos del sistema.'
                            : 'Tienes acceso a las funciones asignadas según tu nivel de permiso.'}
                    </p>
                </div>
            </Card>

            {/* Last Connection */}
            <Card className="p-8 border-border shadow-sm rounded-2xl space-y-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 uppercase tracking-[0.08em]">
                    Última Conexión
                </h3>
                <div className="space-y-4">
                    {user?.sessions && user.sessions.length > 0 ? (
                        <>
                            <p className="text-xs text-muted-foreground">Sesión actual iniciada desde:</p>
                            <div className="space-y-1">
                                <p className="text-2xl font-semibold text-foreground tabular-nums">
                                    {new Date(user.sessions[0].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                <div className="flex flex-col gap-2 pt-2">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                        <MapPin className="h-3.5 w-3.5 text-primary" />
                                        <span>IP: {user.sessions[0].ipAddress}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                        <Shield className="h-3.5 w-3.5 text-primary" />
                                        <span className="truncate max-w-[250px]">{user.sessions[0].userAgent}</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <p className="text-sm text-slate-400">No hay información de sesiones recientes.</p>
                    )}
                </div>
            </Card>
        </div>
    );
}
