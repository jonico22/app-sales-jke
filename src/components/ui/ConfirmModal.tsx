import { Modal } from './Modal';
import { Button } from './button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'primary';
    loading?: boolean;
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'danger',
    loading = false
}: ConfirmModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <div className="flex flex-col items-center text-center space-y-4">
                <div className={`p-4 rounded-full ${variant === 'danger' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                    <AlertTriangle className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                    <p className="text-slate-600 leading-relaxed">
                        {description}
                    </p>
                </div>
                <div className="flex gap-3 w-full pt-4">
                    <Button
                        variant="ghost"
                        className="flex-1 border border-slate-200"
                        onClick={onClose}
                        disabled={loading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant === 'danger' ? 'danger' : 'primary'}
                        className={`flex-1 ${variant === 'primary' ? 'bg-[#56a3e2] hover:bg-[#4a8ec5] text-white' : ''}`}
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? 'Confirmando...' : confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
