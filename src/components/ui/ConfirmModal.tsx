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
            <div className="flex flex-col items-center text-center space-y-4 sm:space-y-5">
                <div className={`p-3 sm:p-4 rounded-full ${variant === 'danger' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                    <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <div className="space-y-2">
                    <p className="text-sm text-slate-600 leading-relaxed">
                        {description}
                    </p>
                </div>
                <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 w-full pt-2 sm:pt-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 border border-slate-200"
                        onClick={onClose}
                        disabled={loading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant === 'danger' ? 'danger' : 'primary'}
                        size="sm"
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
