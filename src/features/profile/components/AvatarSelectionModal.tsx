import { useState, useEffect } from 'react';
import { Modal, Button, Input, Label } from '@/components/ui';
import { Dices, Check, Loader2, Palette, FlipHorizontal } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';

interface AvatarSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (avatarUrl: string, updatedUser: any) => void;
    initialName?: string;
}

export function AvatarSelectionModal({ isOpen, onClose, onConfirm, initialName = 'Usuario' }: AvatarSelectionModalProps) {
    const [style, setStyle] = useState('adventurer');
    const [seed, setSeed] = useState(initialName);
    const [previewUrl, setPreviewUrl] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    // Advanced options
    const [backgroundColor, setBackgroundColor] = useState('transparent');
    const [flip, setFlip] = useState(false);

    // Dynamic Schema options
    const [schemaProps, setSchemaProps] = useState<any>({});
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

    // Tabs state
    const [activeTab, setActiveTab] = useState<'basic' | 'detailed'>('basic');

    useEffect(() => {
        if (isOpen && initialName && seed === 'Usuario') {
            setSeed(initialName);
        }
    }, [isOpen, initialName]);

    useEffect(() => {
        const fetchSchema = async () => {
            try {
                const res = await fetch(`https://api.dicebear.com/9.x/${style}/schema.json`);
                const data = await res.json();

                // Filter properties to only those that are customizable arrays with enums
                const props: any = {};
                const coreProps = ['backgroundColor', 'backgroundType', 'backgroundRotation', 'base', 'flip', 'radius', 'scale', 'rotate', 'size', 'seed', 'translateX', 'translateY', 'clip', 'randomizeIds'];

                if (data.properties) {
                    Object.keys(data.properties).forEach(key => {
                        if (coreProps.includes(key) || key.endsWith('Probability')) return;

                        const prop = data.properties[key];
                        if (prop.type === 'array' && prop.items?.enum) {
                            props[key] = prop.items.enum;
                        }
                    });
                }
                setSchemaProps(props);
                setSelectedOptions({}); // Reset options when style changes
            } catch (error) {
                console.error("Failed to fetch dicebear schema", error);
                setSchemaProps({});
            }
        };
        fetchSchema();
    }, [style]);

    useEffect(() => {
        // Construct DiceBear API URL with advanced parameters
        const safeSeed = encodeURIComponent(seed.trim() || 'default');
        const params = new URLSearchParams();
        params.append('seed', safeSeed);

        if (backgroundColor && backgroundColor !== 'transparent') {
            // DiceBear expects colors without the hash
            params.append('backgroundColor', backgroundColor.replace('#', ''));
        }
        if (flip) {
            params.append('flip', 'true');
        }

        // Append user selected dynamic options
        Object.keys(selectedOptions).forEach(key => {
            if (selectedOptions[key]) {
                params.append(key, selectedOptions[key]);
            }
        });

        setPreviewUrl(`https://api.dicebear.com/9.x/${style}/svg?${params.toString()}`);
    }, [style, seed, backgroundColor, flip, selectedOptions]);

    const handleRandomize = () => {
        const randomString = Math.random().toString(36).substring(2, 8);
        setSeed(randomString);
    };

    const handleConfirm = async () => {
        try {
            setIsUpdating(true);
            const response = await authService.updateProfile({ image: previewUrl });

            if (response.success) {
                toast.success('Avatar actualizado correctamente');
                onConfirm(previewUrl, response.data);
                onClose();
            }
        } catch (error: any) {
            console.error('Error updating avatar:', error);
            const message = error.response?.data?.message || 'Error al actualizar el avatar';
            toast.error(message);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Seleccionar Imagen" size="lg" hideHeader>
            <div className="space-y-6">
                <div className="flex items-center justify-between pb-2 border-b border-border mb-4 -mx-6 px-6 -mt-2">
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">
                        Seleccionar Imagen
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground hover:bg-muted p-2 rounded-lg transition-colors -mr-2"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <div>
                    <p className="text-xs text-muted-foreground mt-4">
                        Elige cómo quieres actualizar tu foto de perfil con avatares divertidos.
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Left Options Area */}
                    <div className="flex-1 flex flex-col min-w-0">
                        {/* Tabs Navigation */}
                        <div className="flex border-b border-border mb-6 shrink-0">
                            <button
                                type="button"
                                onClick={() => setActiveTab('basic')}
                                className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors uppercase tracking-wider ${activeTab === 'basic'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                                    }`}
                            >
                                Básico
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('detailed')}
                                className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors uppercase tracking-wider ${activeTab === 'detailed'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                                    }`}
                            >
                                Detalles {Object.keys(schemaProps).length > 0 && `(${Object.keys(schemaProps).length})`}
                            </button>
                        </div>

                        {/* Tab Content (Scrollable Area) */}
                        <div className={`flex-1 ${activeTab === 'detailed' ? 'max-h-[380px] overflow-y-auto pr-2 custom-scrollbar' : ''}`}>
                            {/* Basic Tab Content */}
                            {activeTab === 'basic' && (
                                <div className="space-y-6">
                                    {/* Style Selection */}
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-bold text-foreground uppercase tracking-wider">Estilo del Avatar</Label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {['adventurer', 'avataaars', 'bottts', 'fun-emoji', 'lorelei', 'notionists', 'rings', 'shapes', 'thumbs'].map(s => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => setStyle(s)}
                                                    className={`p-2 rounded-lg text-[10px] font-bold text-center transition-all ${style === s ? 'bg-primary/10 text-primary ring-2 ring-primary ring-offset-1' : 'bg-muted/30 text-muted-foreground hover:bg-muted border border-border'}`}
                                                >
                                                    <span className="capitalize">{s}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Seed / Identifier Input */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-700">Identificador (Semilla)</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="text"
                                                placeholder="Ej. Juan, Admin123..."
                                                value={seed}
                                                onChange={(e) => setSeed(e.target.value)}
                                                className="flex-1 bg-muted/30 border-border text-xs"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleRandomize}
                                                className="px-3"
                                                title="Generar al azar"
                                            >
                                                <Dices className="h-4 w-4 text-slate-500" />
                                            </Button>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground mt-1">Cambia el texto o usa el botón de dado para variar el avatar.</p>
                                    </div>

                                    {/* Advanced Customization Options */}
                                    <div className="pt-4 border-t border-border space-y-4">
                                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Opciones Adicionales</h4>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {/* Background Color */}
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                    <Palette className="w-4 h-4 text-slate-400" />
                                                    Color de Fondo
                                                </Label>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="color"
                                                        value={backgroundColor === 'transparent' ? '#ffffff' : backgroundColor}
                                                        onChange={(e) => setBackgroundColor(e.target.value)}
                                                        className="h-10 w-14 p-1 cursor-pointer bg-background border border-border rounded"
                                                        title="Elegir color"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setBackgroundColor('transparent')}
                                                        className={`text-[10px] px-3 py-2 rounded-md transition-colors font-bold uppercase ${backgroundColor === 'transparent' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted'}`}
                                                    >
                                                        Transparente
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Flip */}
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                    Dirección
                                                </Label>
                                                <label className="flex items-center gap-3 cursor-pointer group w-fit mt-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setFlip(!flip)}
                                                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${flip ? 'bg-primary' : 'bg-muted'}`}
                                                        role="switch"
                                                        aria-checked={flip}
                                                    >
                                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${flip ? 'translate-x-4' : 'translate-x-1'}`} />
                                                    </button>
                                                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 flex items-center gap-2" onClick={() => setFlip(!flip)}>
                                                        <FlipHorizontal className="w-4 h-4 text-slate-400" />
                                                        Voltear Avatar
                                                    </span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Detailed Tab Content */}
                            {activeTab === 'detailed' && (
                                <div className="space-y-6">
                                    {/* Dynamic Options based on schema */}
                                    {Object.keys(schemaProps).length > 0 ? (
                                        <div className="space-y-4">
                                            <p className="text-xs text-slate-500">
                                                Personaliza los detalles específicos para el estilo <span className="font-semibold capitalize text-sky-600">{style}</span>.
                                            </p>
                                            <div className="grid grid-cols-2 gap-4">
                                                {Object.keys(schemaProps).map(propKey => (
                                                    <div key={propKey} className="space-y-1.5">
                                                        <Label className="text-[11px] font-medium text-slate-600 capitalize">
                                                            {propKey.replace(/([A-Z])/g, ' $1').trim()}
                                                        </Label>
                                                        <select
                                                            value={selectedOptions[propKey] || ''}
                                                            onChange={(e) => setSelectedOptions(prev => ({ ...prev, [propKey]: e.target.value }))}
                                                            className="w-full h-9 px-3 bg-muted/30 border border-border rounded-md text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent transition-shadow"
                                                        >
                                                            <option value="">Aleatorio</option>
                                                            {schemaProps[propKey].map((val: string) => (
                                                                <option key={val} value={val}>{val.replace(/variant/i, 'Var ')}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-10 text-center">
                                            <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center mb-3 border border-border">
                                                <Dices className="w-6 h-6 text-muted-foreground/40" />
                                            </div>
                                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-tight">No hay detalles configurables</p>
                                            <p className="text-[10px] text-muted-foreground/70 mt-1 max-w-[250px] mx-auto">
                                                Este estilo de avatar no tiene opciones de personalización avanzadas.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Right Preview Area - Instruction 3: Added justify-center to vertically center content */}
                    <div className="w-full md:w-56 shrink-0 flex flex-col justify-center">
                        <div className="p-6 bg-muted/20 border border-border rounded-xl flex flex-col items-center justify-center shadow-inner">
                            <span className="text-[10px] font-bold text-muted-foreground/50 tracking-widest uppercase mb-4 text-center">VISTA PREVIA</span>

                            <div className="relative">
                                <div className="h-40 w-40 sm:h-44 sm:w-44 rounded-full bg-muted/50 border-4 border-background shadow-xl overflow-hidden flex items-center justify-center">
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Avatar Preview" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="animate-pulse w-full h-full bg-muted"></div>
                                    )}
                                </div>
                                <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-card p-1 rounded-full shadow-md border border-border flex items-center justify-center">
                                    <div className="bg-primary/10 rounded-full p-1.5 flex items-center justify-center text-primary">
                                        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={3} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 pt-6 border-t border-border mt-6">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isUpdating}
                        className="px-6 py-2.5 bg-muted/50 border border-border text-foreground hover:bg-muted rounded-lg text-xs font-bold uppercase tracking-wider"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={isUpdating}
                        variant="primary"
                        className="px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                    >
                        {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isUpdating ? 'Guardando...' : 'Confirmar e Insertar'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
