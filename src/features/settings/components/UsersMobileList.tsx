import { Search, FileEdit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type BusinessUser } from '@/services/user.service';
import { getRoleBadgeColor } from '../UsersUtils';

interface UsersMobileListProps {
  users: BusinessUser[];
  loading: boolean;
  onToggleStatus: (userId: string, currentStatus: boolean) => void;
  onEdit: (user: BusinessUser) => void;
  onDelete: (userId: string) => void;
  togglingUserId: string | null;
}

export function UsersMobileList({
  users,
  loading,
  onToggleStatus,
  onEdit,
  onDelete,
  togglingUserId
}: UsersMobileListProps) {
  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="text-[10px] font-bold uppercase tracking-widest mt-2">Cargando usuarios...</span>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="py-12 text-center flex flex-col items-center justify-center p-6">
        <div className="h-12 w-12 bg-muted text-muted-foreground/20 rounded-full flex items-center justify-center mb-3">
          <Search className="w-6 h-6" />
        </div>
        <p className="font-black text-xs text-foreground uppercase tracking-tight">No hay usuarios</p>
        <p className="text-[11px] font-medium text-muted-foreground mt-1">Intente con otros filtros de búsqueda.</p>
      </div>
    );
  }

  return (
    <div className="md:hidden divide-y divide-border/60">
      {users.map((user) => (
        <div key={user.id} className="p-4 bg-card active:bg-muted/10 transition-colors">
          <div className="flex justify-between items-start gap-3 mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-xl bg-muted text-muted-foreground flex items-center justify-center flex-shrink-0 text-xs font-black border border-border/60 shadow-sm uppercase">
                {(user.person?.firstName?.[0] || user.name?.[0] || user.email[0])}
                {(user.person?.lastName?.[0] || '')}
              </div>
              <div className="min-w-0">
                <h3 className="font-black text-[13px] text-foreground tracking-tight leading-tight truncate uppercase">
                  {user.name || `${user.person?.firstName || ''} ${user.person?.lastName || ''}`}
                </h3>
                <p className="text-[11px] font-medium text-muted-foreground truncate lowercase">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="flex items-center h-full pt-1">
              <button
                onClick={() => onToggleStatus(user.id, user.isActive)}
                disabled={togglingUserId === user.id}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${user.isActive ? 'bg-primary shadow-sm shadow-primary/20' : 'bg-muted'} ${togglingUserId === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                role="switch"
                aria-checked={user.isActive}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow-md ring-0 transition duration-200 ease-in-out flex items-center justify-center ${user.isActive ? 'translate-x-[18px]' : 'translate-x-0.5'}`}>
                  {togglingUserId === user.id && (
                    <div className="animate-spin rounded-full h-2 w-2 border-b border-primary/50"></div>
                  )}
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 mb-4">
            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border ${getRoleBadgeColor(user.role.code)}`}>
              {user.role.name}
            </span>
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">
              Visto: <span className="text-foreground/80">{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Nunca'}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-border/40">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-9 rounded-xl text-[10px] font-bold uppercase tracking-widest border-border bg-card text-muted-foreground hover:bg-muted gap-2"
              onClick={() => onEdit(user)}
            >
              <FileEdit className="w-3.5 h-3.5" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-12 rounded-xl border-border bg-card text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
              onClick={() => onDelete(user.id)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
