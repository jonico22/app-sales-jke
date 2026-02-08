import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button, Input } from '@/components/ui';
import { clientService, type CreateClientRequest, type ClientSelectOption } from '@/services/client.service';
import { Loader2 } from 'lucide-react';

interface AddClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onClientRegistered: (client: ClientSelectOption) => void;
}

export function AddClientModal({ isOpen, onClose, onClientRegistered }: AddClientModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<CreateClientRequest>({
        documentType: 'DNI',
        documentNumber: '',
        name: '',
        phone: '',
        email: '',
        isActive: true
    });

    const handleChange = (field: keyof CreateClientRequest, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await clientService.create(formData);
            if (response.success) {
                // Map the full client response to ClientSelectOption
                const newClientOption: ClientSelectOption = {
                    id: response.data.id,
                    name: response.data.name,
                    documentNumber: response.data.documentNumber
                };
                onClientRegistered(newClientOption);
                onClose();
                // Reset form
                setFormData({
                    documentType: 'DNI',
                    documentNumber: '',
                    name: '',
                    phone: '',
                    email: '',
                    isActive: true
                });
            }
        } catch (error) {
            console.error('Error registering client:', error);
            // Here you might want to show an error toast
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Registrar Nuevo Cliente" size="lg">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                            Tipo de Documento
                        </label>
                        <select
                            className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                            value={formData.documentType}
                            onChange={(e) => handleChange('documentType', e.target.value)}
                        >
                            <option value="DNI">DNI</option>
                            <option value="RUC">RUC</option>
                            <option value="CE">CE</option>
                            <option value="PASAPORTE">PASAPORTE</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                            Número de Documento
                        </label>
                        <Input
                            placeholder="Ej. 74582136"
                            value={formData.documentNumber}
                            onChange={(e) => handleChange('documentNumber', e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                        Nombres / Razón Social
                    </label>
                    <Input
                        placeholder="Ej. Carlos Alberto Ruiz"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                            Teléfono
                        </label>
                        <Input
                            placeholder="999 999 999"
                            value={formData.phone || ''}
                            onChange={(e) => handleChange('phone', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                            Correo (Opcional)
                        </label>
                        <Input
                            type="email"
                            placeholder="cliente@correo.com"
                            value={formData.email || ''}
                            onChange={(e) => handleChange('email', e.target.value)}
                        />
                    </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
                    >
                        Cancelar
                    </button>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-sky-500 hover:bg-sky-600 text-white min-w-[150px]"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Registrando...
                            </>
                        ) : (
                            'Registrar y Seleccionar'
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
