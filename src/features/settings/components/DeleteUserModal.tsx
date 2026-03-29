import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
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
                <div className="p-3.5 rounded-full bg-danger/10 text-danger mb-4">
                    <AlertTriangle className="w-7 h-7" />
                </div>

                <h3 className="text-base font-bold text-foreground mb-2 uppercase tracking-tight">
                    ¿Confirmar eliminación?
                </h3>

                <p className="text-[11px] text-muted-foreground leading-relaxed mb-6 font-medium">
                    Esta acción borrará permanentemente al usuario del sistema. Recomendamos solo eliminar si hubo un error en el ingreso de datos. Para retirar accesos de forma segura, le sugerimos usar la opción de <span className="font-bold text-foreground">DESACTIVAR</span> en el listado.
                </p>

                <div className="flex flex-col gap-2.5 w-full">
                    <Button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="w-full bg-danger hover:bg-danger/90 text-white h-9 text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-sm shadow-danger/10 transition-all active:scale-95"
                    >
                        {isDeleting ? (
                            <>
                                <span className="animate-spin w-3.5 h-3.5 mr-2 border-2 border-white/20 border-t-white rounded-full"></span>
                                Eliminando...
                            </>
                        ) : (
                            'Eliminar de todas formas'
                        )}
                    </Button>

                    <Button
                        onClick={onClose}
                        disabled={isDeleting}
                        variant="ghost"
                        className="w-full text-muted-foreground hover:text-foreground h-9 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all active:scale-95"
                    >
                        Cancelar y volver
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
