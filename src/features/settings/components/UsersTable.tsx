import { Search, FileEdit, Trash2 } from 'lucide-react';
import { SortableTableHead } from '@/components/shared/SortableTableHead';
import {
  dataTableActionButtonClassName,
  dataTableActionDestructiveClassName,
  dataTableActionIconClassName,
  dataTableActionPrimaryClassName,
  dataTableCellPrimaryClassName,
  dataTableCellSecondaryClassName,
  dataTableHead,
  dataTableHeaderRowClassName,
  dataTableRowClassName,
  dataTableShellClassName
} from '@/components/shared/dataTableStyles';
import { type BusinessUser } from '@/services/user.service';
import { getRoleBadgeColor } from '../UsersUtils';
import { cn } from '@/lib/utils';

interface UsersTableProps {
  users: BusinessUser[];
  loading: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
  onToggleStatus: (userId: string, currentStatus: boolean) => void;
  onEdit: (user: BusinessUser) => void;
  onDelete: (userId: string) => void;
  togglingUserId: string | null;
}

export function UsersTable({
  users,
  loading,
  sortBy,
  sortOrder,
  onSort,
  onToggleStatus,
  onEdit,
  onDelete,
  togglingUserId
}: UsersTableProps) {
  return (
    <div className={`hidden md:block w-full ${dataTableShellClassName}`}>
      <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className={dataTableHeaderRowClassName}>
            <SortableTableHead
              field="name"
              currentSortBy={sortBy}
              currentSortOrder={sortOrder}
              onSort={onSort}
              className={dataTableHead('py-3 px-5')}
            >
              Nombre
            </SortableTableHead>
            <SortableTableHead
              field="email"
              currentSortBy={sortBy}
              currentSortOrder={sortOrder}
              onSort={onSort}
              className={dataTableHead('py-3 px-5')}
            >
              Email
            </SortableTableHead>
            <SortableTableHead
              field="roleId"
              currentSortBy={sortBy}
              currentSortOrder={sortOrder}
              onSort={onSort}
              className={dataTableHead('py-3 px-5')}
            >
              Rol
            </SortableTableHead>
            <SortableTableHead
              field="lastLogin"
              currentSortBy={sortBy}
              currentSortOrder={sortOrder}
              onSort={onSort}
              className={dataTableHead('py-3 px-5')}
            >
              Último Acceso
            </SortableTableHead>
            <SortableTableHead
              field="isActive"
              currentSortBy={sortBy}
              currentSortOrder={sortOrder}
              onSort={onSort}
              className={dataTableHead('py-3 px-5 text-center')}
            >
              Estado
            </SortableTableHead>
            <th className={dataTableHead('py-3 px-5 text-right')}>Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/70">
          {loading ? (
            <tr>
              <td colSpan={6} className="py-12 text-center">
                <div className="flex justify-center items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              </td>
            </tr>
          ) : users.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-12 text-center text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-10 w-10 bg-muted text-muted-foreground/30 rounded-full flex items-center justify-center">
                    <Search className="w-5 h-5" />
                  </div>
                  <p className="font-bold text-xs text-foreground/80">No se encontraron usuarios</p>
                  <p className="text-[11px] font-medium opacity-60">No hay resultados para la búsqueda actual.</p>
                </div>
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id} className={dataTableRowClassName}>
                <td className="py-3 px-5">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center flex-shrink-0 text-[11px] font-bold border border-border select-none">
                      {(user.person?.firstName?.[0] || user.name?.[0] || user.email[0]).toUpperCase()}
                      {(user.person?.lastName?.[0] || '').toUpperCase()}
                    </div>
                    <div className={dataTableCellPrimaryClassName}>
                      {user.name || `${user.person?.firstName || ''} ${user.person?.lastName || ''}`}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-5">
                  <span className={dataTableCellSecondaryClassName}>{user.email}</span>
                </td>
                <td className="py-3 px-5">
                  <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold border shadow-none uppercase tracking-[0.08em] ${getRoleBadgeColor(user.role.code)}`}>
                    {user.role.name}
                  </span>
                </td>
                <td className="py-3 px-5">
                  {user.lastLogin ? (
                    <span className={dataTableCellSecondaryClassName}>{new Date(user.lastLogin).toLocaleDateString()}</span>
                  ) : (
                    <span className={cn(dataTableCellSecondaryClassName, 'italic text-muted-foreground/40')}>Nunca</span>
                  )}
                </td>
                <td className="py-3 px-5">
                  <div className="flex justify-center items-center h-full">
                    <button
                      onClick={() => onToggleStatus(user.id, user.isActive)}
                      disabled={togglingUserId === user.id}
                      className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer items-center rounded-full border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${user.isActive ? 'bg-primary' : 'bg-muted'} ${togglingUserId === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      role="switch"
                      aria-checked={user.isActive}
                    >
                      {togglingUserId === user.id ? (
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out flex items-center justify-center ${user.isActive ? 'translate-x-4' : 'translate-x-1'}`}>
                          <div className="animate-spin rounded-full h-2 w-2 border-b border-primary/50"></div>
                        </span>
                      ) : (
                        <span className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${user.isActive ? 'translate-x-4' : 'translate-x-1'}`} />
                      )}
                    </button>
                  </div>
                </td>
                <td className="py-3 px-5">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      className={cn(dataTableActionButtonClassName, dataTableActionPrimaryClassName)}
                      title="Editar usuario"
                      onClick={() => onEdit(user)}
                    >
                      <FileEdit className={dataTableActionIconClassName} />
                    </button>
                    <button
                      className={cn(dataTableActionButtonClassName, dataTableActionDestructiveClassName, 'text-red-500 dark:text-red-400')}
                      title="Eliminar usuario"
                      onClick={() => onDelete(user.id)}
                    >
                      <Trash2 className={dataTableActionIconClassName} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
}
