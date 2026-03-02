import { Modal } from '@/components/ui';
import { Button } from '@/components/ui';
import { AlertTriangle } from 'lucide-react';
import { userService } from '@/services/user.service';
import { toast } from 'sonner';
import { useState } from 'react';

interface DeleteUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string | null;
    onSuccess: () => void;
}

export function DeleteUserModal({ isOpen, onClose, userId, onSuccess }: DeleteUserModalProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!userId) return;

        try {
            setIsDeleting(true);
            await userService.deleteBusinessUser(userId);
            toast.success('Usuario eliminado correctamente');
            onSuccess();
        } catch (error: any) {
            console.error('Error deleting user:', error);
            const message = error.response?.data?.message || 'Error al eliminar el usuario';
            toast.error(message);
        } finally {
            setIsDeleting(false);
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Eliminar usuario" size="sm" hideHeader>
            <div className="flex flex-col items-center text-center p-2">
                <div className="p-3 rounded-full bg-red-50 text-red-500 mb-4">
                    <AlertTriangle className="w-8 h-8" />
                </div>

                <h3 className="text-xl font-bold text-slate-800 mb-3">
                    ¿Confirmar eliminación de usuario?
                </h3>

                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                    Esta acción borrará permanentemente al usuario del sistema. Recomendamos solo eliminar si hubo un error en el ingreso de datos. Para retirar accesos de forma segura, le sugerimos usar la opción de <span className="font-bold">DESACTIVAR</span> en el listado.
                </p>

                <div className="flex flex-col gap-2 w-full">
                    <Button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="w-full bg-[#E5534B] hover:bg-[#D4423A] text-white py-2.5 h-auto text-sm font-medium"
                    >
                        {isDeleting ? (
                            <>
                                <span className="animate-spin w-4 h-4 mr-2 border-2 border-white/20 border-t-white rounded-full"></span>
                                Eliminando...
                            </>
                        ) : (
                            'Eliminar de todas formas'
                        )}
                    </Button>

                    <Button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="w-full bg-white border border-slate-200 text-slate-700 py-2.5 h-auto text-sm font-medium hover:bg-slate-50"
                    >
                        Cancelar y volver
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
