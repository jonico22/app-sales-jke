import { useState, useEffect, useMemo } from 'react';
import { Card, Input, Button } from '@/components/ui';
import { Search, Plus, FileEdit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { userService, type BusinessUser } from '@/services/user.service';
import { SortableTableHead } from '@/components/shared/SortableTableHead';
import { toast } from 'sonner';
import { CreateUserModal } from './components/CreateUserModal';
import { EditUserPanel } from './components/EditUserPanel';
import { DeleteUserModal } from './components/DeleteUserModal';

import { isAxiosError } from 'axios';

export default function UsersAndAccessPage() {
    const [users, setUsers] = useState<BusinessUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<BusinessUser | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<string | null>(null);
    const usersPerPage = 5;

    // Sorting state
    const [sortBy, setSortBy] = useState<string>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await userService.getBusinessUsers({
                sortBy,
                sortOrder
            });
            if (response && response.data) {
                setUsers(response.data);
            }
        } catch (error) {
            console.error('Error fetching business users:', error);
            toast.error('Error al cargar la lista de usuarios');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [sortBy, sortOrder]);

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return users;
        const lowerSearch = searchTerm.toLowerCase();
        return users.filter(user =>
            user.name?.toLowerCase().includes(lowerSearch) ||
            user.person?.firstName?.toLowerCase().includes(lowerSearch) ||
            user.person?.lastName?.toLowerCase().includes(lowerSearch) ||
            user.email?.toLowerCase().includes(lowerSearch)
        );
    }, [users, searchTerm]);

    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * usersPerPage;
        return filteredUsers.slice(startIndex, startIndex + usersPerPage);
    }, [filteredUsers, currentPage]);

    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    const getRoleBadgeColor = (fullRoleCode: string) => {
        const roleCode = fullRoleCode.split('-')[0]; // Extract base role (e.g., SELLER from SELLER-SOC-...)
        switch (roleCode) {
            case 'OWNER':
                return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
            case 'BUSINESS_MANAGER':
                return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
            case 'SELLER':
                return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
            default:
                return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
        }
    };


    const [togglingUserId, setTogglingUserId] = useState<string | null>(null);

    const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
        try {
            setTogglingUserId(userId);
            const response = await userService.toggleUserStatus(userId);

            setUsers(currentUsers =>
                currentUsers.map(u =>
                    u.id === userId ? { ...u, isActive: response.data?.isActive ?? !currentStatus } : u
                )
            );

            toast.success(response.message || `Usuario ${currentStatus ? 'desactivado' : 'activado'} correctamente`);
        } catch (error) {
            console.error('Error toggling user status:', error);
            if (isAxiosError(error) && error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Ocurrió un error al cambiar el estado del usuario');
            }
        } finally {
            setTogglingUserId(null);
        }
    };

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 md:px-0 space-y-4 md:space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                    <h1 className="text-base sm:text-lg font-black text-foreground tracking-tight uppercase">Usuarios y Accesos</h1>
                    <p className="text-muted-foreground text-[10px] sm:text-[11px] font-medium leading-none">
                        Gestione el acceso al sistema y permisos.
                    </p>
                </div>
                <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    variant="primary"
                    size="sm"
                    className="flex items-center justify-center gap-2 h-10 sm:h-8 w-full sm:w-auto px-5 rounded-xl font-bold text-[10px] uppercase tracking-wider shadow-lg shadow-primary/20"
                >
                    <Plus className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                    Nuevo Usuario
                </Button>
            </div>

            {/* Tabs */}
            <div className="border-b border-border overflow-x-auto no-scrollbar">
                <nav className="-mb-px flex space-x-6">
                    <button className="border-primary text-primary whitespace-nowrap py-3 px-1 border-b-2 font-black text-[10px] sm:text-[11px] uppercase tracking-tighter">
                        Lista de Usuarios
                    </button>
                </nav>
            </div>

            {/* Content Card */}
            <Card className="border-border shadow-sm overflow-hidden bg-card rounded-xl">
                {/* Toolbar */}
                <div className="p-3 sm:p-4 border-b border-border bg-card">
                    <div className="relative w-full max-w-full sm:max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                        <Input
                            placeholder="Buscar usuarios..."
                            className="pl-9 h-10 border-border bg-muted/30 focus-visible:bg-background text-[13px] rounded-xl sm:rounded-lg"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/30 border-b border-border">
                                <SortableTableHead 
                                    field="name" 
                                    currentSortBy={sortBy} 
                                    currentSortOrder={sortOrder} 
                                    onSort={handleSort}
                                    className="py-3 px-5 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider"
                                >
                                    Nombre
                                </SortableTableHead>
                                <SortableTableHead 
                                    field="email" 
                                    currentSortBy={sortBy} 
                                    currentSortOrder={sortOrder} 
                                    onSort={handleSort}
                                    className="py-3 px-5 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider"
                                >
                                    Email
                                </SortableTableHead>
                                <SortableTableHead 
                                    field="roleId" 
                                    currentSortBy={sortBy} 
                                    currentSortOrder={sortOrder} 
                                    onSort={handleSort}
                                    className="py-3 px-5 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider"
                                >
                                    Rol
                                </SortableTableHead>
                                <SortableTableHead 
                                    field="lastLogin" 
                                    currentSortBy={sortBy} 
                                    currentSortOrder={sortOrder} 
                                    onSort={handleSort}
                                    className="py-3 px-5 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider"
                                >
                                    Último Acceso
                                </SortableTableHead>
                                <SortableTableHead 
                                    field="isActive" 
                                    currentSortBy={sortBy} 
                                    currentSortOrder={sortOrder} 
                                    onSort={handleSort}
                                    className="py-3 px-5 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider text-center"
                                >
                                    Estado
                                </SortableTableHead>
                                <th className="py-3 px-5 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center">
                                        <div className="flex justify-center items-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedUsers.length === 0 ? (
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
                                paginatedUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-muted/10 transition-colors group">
                                        <td className="py-3 px-5">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center flex-shrink-0 text-[11px] font-bold border border-border select-none">
                                                    {(user.person?.firstName?.[0] || user.name?.[0] || user.email[0]).toUpperCase()}
                                                    {(user.person?.lastName?.[0] || '').toUpperCase()}
                                                </div>
                                                <div className="font-bold text-foreground text-xs tracking-tight">
                                                    {user.name || `${user.person?.firstName || ''} ${user.person?.lastName || ''}`}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-5">
                                            <span className="text-[11px] font-medium text-muted-foreground">{user.email}</span>
                                        </td>
                                        <td className="py-3 px-5">
                                            <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold border shadow-none uppercase tracking-wider ${getRoleBadgeColor(user.role.code)}`}>
                                                {user.role.name}
                                            </span>
                                        </td>
                                        <td className="py-3 px-5">
                                            {user.lastLogin ? (
                                                <span className="text-[11px] font-medium text-muted-foreground/80">{new Date(user.lastLogin).toLocaleDateString()}</span>
                                            ) : (
                                                <span className="text-[11px] font-medium text-muted-foreground/40 italic">Nunca</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-5">
                                            <div className="flex justify-center items-center h-full">
                                                <button
                                                    onClick={() => handleToggleStatus(user.id, user.isActive)}
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
                                                    className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors active:scale-95 cursor-pointer"
                                                    title="Editar usuario"
                                                    onClick={() => {
                                                        setUserToEdit(user);
                                                        setIsEditPanelOpen(true);
                                                    }}
                                                >
                                                    <FileEdit className="w-4 h-4 cursor-pointer" />
                                                </button>
                                                <button
                                                    className="p-1.5 text-red-500 hover:text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors active:scale-95 cursor-pointer"
                                                    title="Eliminar usuario"
                                                    onClick={() => {
                                                        setUserToDelete(user.id);
                                                        setIsDeleteModalOpen(true);
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4 cursor-pointer" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-border/60">
                    {loading ? (
                        <div className="py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            <span className="text-[10px] font-bold uppercase tracking-widest mt-2">Cargando usuarios...</span>
                        </div>
                    ) : paginatedUsers.length === 0 ? (
                        <div className="py-12 text-center flex flex-col items-center justify-center p-6">
                            <div className="h-12 w-12 bg-muted text-muted-foreground/20 rounded-full flex items-center justify-center mb-3">
                                <Search className="w-6 h-6" />
                            </div>
                            <p className="font-black text-xs text-foreground uppercase tracking-tight">No hay usuarios</p>
                            <p className="text-[11px] font-medium text-muted-foreground mt-1">Intente con otros filtros de búsqueda.</p>
                        </div>
                    ) : (
                        paginatedUsers.map((user) => (
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
                                            onClick={() => handleToggleStatus(user.id, user.isActive)}
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
                                        onClick={() => {
                                            setUserToEdit(user);
                                            setIsEditPanelOpen(true);
                                        }}
                                    >
                                        <FileEdit className="w-3.5 h-3.5" />
                                        Editar
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-9 w-12 rounded-xl border-border bg-card text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                                        onClick={() => {
                                            setUserToDelete(user.id);
                                            setIsDeleteModalOpen(true);
                                        }}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination Footer */}
                {!loading && filteredUsers.length > 0 && (
                    <div className="p-4 sm:p-3 border-t border-border bg-muted/5 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
                        <div className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-tight w-full sm:w-auto text-center sm:text-left">
                            Mostrando <span className="font-black text-foreground bg-muted px-1.5 py-0.5 rounded-lg">{(currentPage - 1) * usersPerPage + 1}-{Math.min(currentPage * usersPerPage, filteredUsers.length)}</span> de <span className="font-black text-foreground bg-muted px-1.5 py-0.5 rounded-lg">{filteredUsers.length}</span>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="h-8 w-8 sm:h-7 sm:w-7 flex items-center justify-center border border-border text-muted-foreground hover:bg-muted bg-card rounded-xl sm:rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
                            >
                                <ChevronLeft className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                            </button>

                            <div className="flex items-center gap-1.5 px-2 bg-muted/20 py-1 rounded-xl border border-border/40">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-7 h-7 flex items-center justify-center text-[10px] font-black rounded-lg transition-all active:scale-95 ${currentPage === page
                                            ? 'bg-primary text-primary-foreground shadow-sm'
                                            : 'text-muted-foreground hover:bg-muted'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="h-8 w-8 sm:h-7 sm:w-7 flex items-center justify-center border border-border text-muted-foreground hover:bg-muted bg-card rounded-xl sm:rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
                            >
                                <ChevronRight className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                            </button>
                        </div>
                    </div>
                )}
            </Card>

            <CreateUserModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    setIsCreateModalOpen(false);
                    fetchUsers(); // Refresh the list after success
                }}
            />

            <EditUserPanel
                isOpen={isEditPanelOpen}
                onClose={() => {
                    setIsEditPanelOpen(false);
                    setTimeout(() => setUserToEdit(null), 300); // clear after animation
                }}
                user={userToEdit}
                onSuccess={() => {
                    setIsEditPanelOpen(false);
                    fetchUsers();
                }}
            />

            <DeleteUserModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setTimeout(() => setUserToDelete(null), 300);
                }}
                userId={userToDelete}
                onSuccess={() => {
                    setIsDeleteModalOpen(false);
                    fetchUsers();
                }}
            />
        </div>
    );
}
