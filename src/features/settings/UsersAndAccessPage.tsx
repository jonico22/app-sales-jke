import { useState, useEffect, useMemo } from 'react';
import { Card, Input, Button } from '@/components/ui';
import { Search, Plus, FileEdit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { userService, type BusinessUser } from '@/services/user.service';
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

    const fetchUsers = async () => {
        try {
            const response = await userService.getBusinessUsers();
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
    }, []);

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

    const getRoleBadgeColor = (roleCode: string) => {
        switch (roleCode) {
            case 'OWNER':
                return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
            case 'BUSINESS_MANAGER':
                return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'SELLER':
                return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            default:
                return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
        }
    };

    const getRoleName = (roleCode: string) => {
        switch (roleCode) {
            case 'OWNER': return 'Propietario';
            case 'BUSINESS_MANAGER': return 'Administrador';
            case 'SELLER': return 'Vendedor';
            default: return roleCode;
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

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-0.5">
                    <h1 className="text-lg font-bold text-foreground tracking-tight uppercase">Usuarios y Accesos</h1>
                    <p className="text-muted-foreground text-[11px] font-medium">
                        Gestione el acceso al sistema y los permisos de usuario.
                    </p>
                </div>
                <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    variant="primary"
                    size="sm"
                    className="flex items-center gap-2 h-8 px-4 rounded-lg font-bold text-[10px] uppercase tracking-wider"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Nuevo Usuario
                </Button>
            </div>

            {/* Tabs */}
            <div className="border-b border-border">
                <nav className="-mb-px flex space-x-6">
                    <button className="border-primary text-primary whitespace-nowrap py-3 px-1 border-b-2 font-bold text-[11px] uppercase tracking-tighter">
                        Lista de Usuarios
                    </button>
                </nav>
            </div>

            {/* Content Card */}
            <Card className="border-border shadow-sm overflow-hidden bg-card rounded-xl">
                {/* Toolbar */}
                <div className="p-3 border-b border-border bg-card flex items-center justify-between">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                        <Input
                            placeholder="Buscar por nombre o email..."
                            className="pl-9 h-9 border-border bg-muted/30 focus-visible:bg-background text-xs rounded-lg"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/30 border-b border-border">
                                <th className="py-3 px-5 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">Nombre</th>
                                <th className="py-3 px-5 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">Email</th>
                                <th className="py-3 px-5 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">Rol</th>
                                <th className="py-3 px-5 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">Último Acceso</th>
                                <th className="py-3 px-5 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider text-center">Estado</th>
                                <th className="py-3 px-5 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider text-right text-right">Acciones</th>
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
                                                {getRoleName(user.role.code)}
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
                                            <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    className="p-1.5 text-primary hover:bg-primary/5 rounded-lg transition-colors active:scale-95"
                                                    title="Editar usuario"
                                                    onClick={() => {
                                                        setUserToEdit(user);
                                                        setIsEditPanelOpen(true);
                                                    }}
                                                >
                                                    <FileEdit className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    className="p-1.5 text-danger/70 hover:text-danger hover:bg-danger/5 rounded-lg transition-colors active:scale-95"
                                                    title="Eliminar usuario"
                                                    onClick={() => {
                                                        setUserToDelete(user.id);
                                                        setIsDeleteModalOpen(true);
                                                    }}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                {!loading && filteredUsers.length > 0 && (
                    <div className="p-3 border-t border-border bg-muted/10 flex items-center justify-between">
                        <div className="text-[11px] font-medium text-muted-foreground">
                            Mostrando <span className="font-bold text-foreground">{(currentPage - 1) * usersPerPage + 1}</span> a <span className="font-bold text-foreground">{Math.min(currentPage * usersPerPage, filteredUsers.length)}</span> de <span className="font-bold text-foreground">{filteredUsers.length}</span> resultados
                        </div>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="h-7 w-7 flex items-center justify-center border border-border text-muted-foreground hover:bg-muted rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-7 h-7 flex items-center justify-center text-[11px] font-bold rounded-lg border transition-all active:scale-95 ${currentPage === page
                                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                        : 'border-border text-muted-foreground hover:bg-muted'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="h-7 w-7 flex items-center justify-center border border-border text-muted-foreground hover:bg-muted rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                            >
                                <ChevronRight className="w-3.5 h-3.5" />
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
