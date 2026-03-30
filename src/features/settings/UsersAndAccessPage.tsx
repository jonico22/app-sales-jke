import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { userService, type BusinessUser } from '@/services/user.service';
import { toast } from 'sonner';
import { CreateUserModal } from './components/CreateUserModal';
import { EditUserPanel } from './components/EditUserPanel';
import { DeleteUserModal } from './components/DeleteUserModal';
import { UsersHeader } from './components/UsersHeader';
import { UsersToolbar } from './components/UsersToolbar';
import { UsersTable } from './components/UsersTable';
import { UsersMobileList } from './components/UsersMobileList';
import { UsersPagination } from './components/UsersPagination';
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

    const fetchUsers = useCallback(async () => {
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
    }, [sortBy, sortOrder]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

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
            <UsersHeader onNewUser={() => setIsCreateModalOpen(true)} />

            <Card className="border-border shadow-sm overflow-hidden bg-card rounded-xl">
                <UsersToolbar 
                    searchTerm={searchTerm} 
                    onSearchChange={(val) => {
                        setSearchTerm(val);
                        setCurrentPage(1);
                    }} 
                />

                <UsersTable
                    users={paginatedUsers}
                    loading={loading}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                    onToggleStatus={handleToggleStatus}
                    onEdit={(user) => {
                        setUserToEdit(user);
                        setIsEditPanelOpen(true);
                    }}
                    onDelete={(id) => {
                        setUserToDelete(id);
                        setIsDeleteModalOpen(true);
                    }}
                    togglingUserId={togglingUserId}
                />

                <UsersMobileList
                    users={paginatedUsers}
                    loading={loading}
                    onToggleStatus={handleToggleStatus}
                    onEdit={(user) => {
                        setUserToEdit(user);
                        setIsEditPanelOpen(true);
                    }}
                    onDelete={(id) => {
                        setUserToDelete(id);
                        setIsDeleteModalOpen(true);
                    }}
                    togglingUserId={togglingUserId}
                />

                <UsersPagination
                    currentPage={currentPage}
                    usersPerPage={usersPerPage}
                    totalFilteredUsers={filteredUsers.length}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </Card>

            <CreateUserModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    setIsCreateModalOpen(false);
                    fetchUsers();
                }}
            />

            <EditUserPanel
                isOpen={isEditPanelOpen}
                onClose={() => {
                    setIsEditPanelOpen(false);
                    setTimeout(() => setUserToEdit(null), 300);
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
