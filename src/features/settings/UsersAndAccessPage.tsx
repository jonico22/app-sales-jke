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
                return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'BUSINESS_MANAGER':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'SELLER':
                return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            default:
                return 'bg-amber-100 text-amber-700 border-amber-200';
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

            // Optimistically update the UI or use the real response
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
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Usuarios y Accesos</h1>
                    <p className="text-slate-500 mt-1">
                        Gestione el acceso al sistema y los permisos de usuario.
                    </p>
                </div>
                <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    variant="primary"
                    size="md"
                    className="flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Nuevo Usuario
                </Button>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200">
                <nav className="-mb-px flex space-x-8">
                    <a className="border-[#56a3e2] text-[#56a3e2] whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                        Lista de Usuarios
                    </a>
                    {/* Gestionar Roles tab removed as requested */}
                </nav>
            </div>

            {/* Content Card */}
            <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                {/* Toolbar */}
                <div className="p-4 border-b border-slate-100 bg-white flex items-center justify-between">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Buscar por nombre o email..."
                            className="pl-9 h-10 border-slate-200 bg-slate-50 focus-visible:bg-white"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1); // Reset to first page on search
                            }}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nombre</th>
                                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rol</th>
                                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Último Acceso</th>
                                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Estado</th>
                                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center">
                                        <div className="flex justify-center items-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="h-12 w-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center">
                                                <Search className="w-6 h-6" />
                                            </div>
                                            <p className="font-medium text-slate-600">No se encontraron usuarios</p>
                                            <p className="text-sm">No hay resultados para la búsqueda actual.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0 text-sm font-semibold select-none">
                                                    {(user.person?.firstName?.[0] || user.name?.[0] || user.email[0]).toUpperCase()}
                                                    {(user.person?.lastName?.[0] || '').toUpperCase()}
                                                </div>
                                                <div className="font-medium text-slate-700 text-sm">
                                                    {user.name || `${user.person?.firstName || ''} ${user.person?.lastName || ''}`}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-sm text-slate-500">{user.email}</span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium border ${getRoleBadgeColor(user.role.code)}`}>
                                                {getRoleName(user.role.code)}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            {user.lastLogin ? (
                                                <span className="text-sm text-slate-500">{new Date(user.lastLogin).toLocaleDateString()}</span>
                                            ) : (
                                                <span className="text-sm text-slate-400 italic">Nunca</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex justify-center items-center h-full">
                                                {/* Switch toggle implementation */}
                                                <button
                                                    onClick={() => handleToggleStatus(user.id, user.isActive)}
                                                    disabled={togglingUserId === user.id}
                                                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 ${user.isActive ? 'bg-[#56a3e2]' : 'bg-slate-200'} ${togglingUserId === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    role="switch"
                                                    aria-checked={user.isActive}
                                                >
                                                    {togglingUserId === user.id ? (
                                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out flex items-center justify-center ${user.isActive ? 'translate-x-4' : 'translate-x-0'}`}>
                                                            <div className="animate-spin rounded-full h-2.5 w-2.5 border-b-2 border-slate-400"></div>
                                                        </span>
                                                    ) : (
                                                        <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${user.isActive ? 'translate-x-4' : 'translate-x-0'}`} />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center justify-end gap-2 transition-opacity">
                                                <button
                                                    className="p-1.5 text-sky-500 hover:text-sky-600 hover:bg-sky-50 rounded-md transition-colors"
                                                    title="Editar usuario"
                                                    onClick={() => {
                                                        setUserToEdit(user);
                                                        setIsEditPanelOpen(true);
                                                    }}
                                                >
                                                    <FileEdit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                    title="Eliminar usuario"
                                                    onClick={() => {
                                                        setUserToDelete(user.id);
                                                        setIsDeleteModalOpen(true);
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4" />
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
                    <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between">
                        <div className="text-sm text-slate-500">
                            Mostrando <span className="font-medium text-slate-700">{(currentPage - 1) * usersPerPage + 1}</span> a <span className="font-medium text-slate-700">{Math.min(currentPage * usersPerPage, filteredUsers.length)}</span> de <span className="font-medium text-slate-700">{filteredUsers.length}</span> resultados
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-1.5 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-8 h-8 flex items-center justify-center text-sm font-medium rounded-md border transition-colors ${currentPage === page
                                        ? 'bg-[#56a3e2] text-white border-[#56a3e2]'
                                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-1.5 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
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
