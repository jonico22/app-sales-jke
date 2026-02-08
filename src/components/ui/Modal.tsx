import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div
                ref={modalRef}
                className={`relative bg-white rounded-2xl shadow-xl w-full ${sizeClasses[size]} transform transition-all animate-in fade-in zoom-in-95 duration-200`}
                role="dialog"
                aria-modal="true"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
}
