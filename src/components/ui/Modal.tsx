import { useEffect, useRef, memo } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    hideHeader?: boolean;
    contentClassName?: string;
}

export const Modal = memo(({ isOpen, onClose, title, children, size = 'md', hideHeader = false, contentClassName = '' }: ModalProps) => {
    const modalRef = useRef<HTMLDivElement>(null);

    // Initial focus and Escape key handling
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';

            const handleEscape = (e: KeyboardEvent) => {
                if (e.key === 'Escape') onClose();
            };

            document.addEventListener('keydown', handleEscape);
            return () => {
                document.body.style.overflow = 'unset';
                document.removeEventListener('keydown', handleEscape);
            };
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl'
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div
                ref={modalRef}
                className={`relative bg-card rounded-xl sm:rounded-2xl shadow-xl w-full ${sizeClasses[size]} max-h-[calc(100vh-1.5rem)] sm:max-h-[calc(100vh-2rem)] flex flex-col transform transition-all animate-in fade-in zoom-in-95 duration-200`}
                role="dialog"
                aria-modal="true"
            >
                {/* Header */}
                {!hideHeader ? (
                    <div className="flex items-center justify-between gap-3 px-4 py-3.5 sm:p-6 border-b border-border shrink-0">
                        <h3 className="text-base sm:text-lg font-semibold text-foreground leading-tight">
                            {title}
                        </h3>
                        <button
                            onClick={onClose}
                            className="shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted p-1.5 sm:p-2 rounded-lg transition-colors"
                            aria-label="Cerrar"
                        >
                            <X className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                    </div>
                ) : null}

                {/* Body */}
                <div className={`p-4 sm:p-6 overflow-y-auto custom-scrollbar ${contentClassName}`}>
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
});

Modal.displayName = 'Modal';
