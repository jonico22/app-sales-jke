import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
    Store,
    Upload,
    Hash,
    MapPin,
    Phone,
    Mail,
    Save,
    Coins,
    Percent,
    Clock,
    HardDrive
} from 'lucide-react';
import { Button, Input, Label, Card } from '@/components/ui';
import { societyService } from '@/services/society.service';
import { currencyService, type CurrencySelectOption } from '@/services/currency.service';
import { useSocietyStore } from '@/store/society.store';
import { UploadFileModal } from '@/components/shared/UploadFileModal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { fileService, FileCategory } from '@/services/file.service';

const businessSchema = z.object({
    name: z.string().min(1, { message: "El nombre comercial es requerido" }),
    legalEntity: z.object({
        businessName: z.string().nullable().or(z.literal('')),
        documentNumber: z.string().nullable().or(z.literal('')),
        fiscalAddress: z.string().nullable(),
        phoneNumber: z.string().nullable(),
        email: z.string().email({ message: "Email inválido" }).nullable().or(z.literal('')),
    }),
    mainCurrencyId: z.string().min(1, { message: "La moneda principal es requerida" }),
    taxValue: z.number().min(0).max(100),
    stockNotificationFrequency: z.string(),
    salesNotificationFrequency: z.string(),
});

type BusinessFormValues = z.infer<typeof businessSchema>;

export default function GeneralSettingsPage() {
    const { society, setSociety } = useSocietyStore();
    const [currencies, setCurrencies] = useState<CurrencySelectOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [logoId, setLogoId] = useState<string | null>(null);
    const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeletingLogo, setIsDeletingLogo] = useState(false);

    const { register, handleSubmit, reset, formState: { errors, dirtyFields } } = useForm<BusinessFormValues>({
        resolver: zodResolver(businessSchema),
        defaultValues: {
            name: '',
            legalEntity: {
                businessName: '',
                documentNumber: '',
                fiscalAddress: '',
                phoneNumber: '',
                email: '',
            },
            mainCurrencyId: '',
            taxValue: 0,
            stockNotificationFrequency: 'DAILY',
            salesNotificationFrequency: 'DAILY',
        }
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [societyData, currenciesData] = await Promise.all([
                    societyService.getCurrent(),
                    currencyService.getForSelect()
                ]);

                if (societyData.success) {
                    const s = societyData.data;
                    setSociety(s);
                    setLogoPreview(s.logo?.path || null);
                    setLogoId(s.logo?.id || null);

                    reset({
                        name: s.name,
                        legalEntity: {
                            businessName: s.legalEntity?.businessName || '',
                            documentNumber: s.legalEntity?.documentNumber || '',
                            fiscalAddress: s.legalEntity?.fiscalAddress || '',
                            phoneNumber: s.legalEntity?.phoneNumber || '',
                            email: s.legalEntity?.email || '',
                        },
                        mainCurrencyId: s.mainCurrency?.id || '',
                        taxValue: s.taxes?.[0]?.value || 0,
                        stockNotificationFrequency: s.stockNotificationFrequency || 'DAILY',
                        salesNotificationFrequency: s.salesNotificationFrequency || 'DAILY',
                    });
                }
                setCurrencies(currenciesData.data);
            } catch (error) {
                console.error('Error loading settings:', error);
                toast.error('Error al cargar la configuración');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [reset, setSociety]);

    const onSubmit = async (data: BusinessFormValues) => {
        if (!society) return;

        try {
            setIsSaving(true);

            // Construct payload with only changed fields
            const payload: any = {};

            if (dirtyFields.name) payload.name = data.name;
            if (dirtyFields.mainCurrencyId) payload.mainCurrencyId = data.mainCurrencyId;
            if (dirtyFields.taxValue) payload.taxValue = data.taxValue;
            if (dirtyFields.stockNotificationFrequency) {
                payload.stockNotificationFrequency = data.stockNotificationFrequency;
                payload.stockNotificationEnabled = data.stockNotificationFrequency !== 'NEVER';
            }
            if (dirtyFields.salesNotificationFrequency) {
                payload.salesNotificationFrequency = data.salesNotificationFrequency;
                payload.salesNotificationEnabled = data.salesNotificationFrequency !== 'NEVER';
            }

            // Handle logoId separately as it's state-based
            if (logoId !== society.logo?.id) {
                payload.logoId = logoId;
            }

            // Handle legalEntity fields
            if (dirtyFields.legalEntity) {
                payload.legalEntity = {};
                if (dirtyFields.legalEntity.businessName) payload.legalEntity.businessName = data.legalEntity.businessName;
                if (dirtyFields.legalEntity.documentNumber) payload.legalEntity.documentNumber = data.legalEntity.documentNumber;
                if (dirtyFields.legalEntity.fiscalAddress) payload.legalEntity.fiscalAddress = data.legalEntity.fiscalAddress;
                if (dirtyFields.legalEntity.phoneNumber) payload.legalEntity.phoneNumber = data.legalEntity.phoneNumber;
                if (dirtyFields.legalEntity.email) payload.legalEntity.email = data.legalEntity.email;
            }

            if (Object.keys(payload).length === 0) {
                toast.info('No se detectaron cambios para guardar');
                return;
            }

            const response = await societyService.put(society.code, payload);

            if (response.success) {
                setSociety(response.data);
                toast.success('Configuración actualizada correctamente');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Error al guardar los cambios');
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogoUploadSuccess = (data: any) => {
        if (data) {
            if (data.id) setLogoId(data.id);
            if (data.path || data.downloadUrl) setLogoPreview(data.downloadUrl || data.path);
        }
    };

    const handleDeleteLogo = async () => {
        if (!society || !logoId) return;

        try {
            setIsDeletingLogo(true);

            // 1. Remove relationship from society
            const response = await societyService.put(society.code, {
                logoId: null
            });

            if (response.success) {
                // 2. Delete the file
                try {
                    await fileService.delete(logoId);
                } catch (fileError) {
                    console.error('Error deleting file, but society was updated:', fileError);
                }

                // 3. Update local state
                setSociety(response.data);
                setLogoPreview(null);
                setLogoId(null);
                toast.success('Logo eliminado correctamente');
            }
        } catch (error) {
            console.error('Error deleting logo:', error);
            toast.error('Error al eliminar el logo');
        } finally {
            setIsDeletingLogo(false);
            setIsDeleteModalOpen(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            <form
                onSubmit={handleSubmit(onSubmit, (errors) => {
                    console.error('Validation errors:', errors);
                    toast.error('Por favor corrige los errores en el formulario');
                })}
                className="space-y-8"
            >
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Configuración del Negocio</h1>
                        <p className="text-slate-500 mt-1">
                            Gestiona los detalles de tu empresa, información fiscal y preferencias globales.
                        </p>
                    </div>
                    <Button
                        type="submit"
                        className="bg-[#56a3e2] hover:bg-[#4a8ec5] text-white px-8 py-6 rounded-xl font-bold h-auto shadow-md"
                        disabled={isSaving}
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Logo & Business Data */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Logotipo */}
                        <Card className="p-6 border-slate-200">
                            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                Logotipo
                            </h2>
                            <div className="flex flex-col md:flex-row items-center gap-8">
                                <div className="relative group">
                                    <div className="w-40 h-40 rounded-full border-4 border-dashed border-slate-200 flex items-center justify-center bg-slate-50 overflow-hidden transition-colors group-hover:border-primary/30">
                                        {logoPreview ? (
                                            <img src={logoPreview} alt="Business Logo" className="w-full h-full object-contain" />
                                        ) : (
                                            <Store className="w-12 h-12 text-slate-300" />
                                        )}
                                    </div>
                                    <div
                                        className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full"
                                        onClick={() => setIsLogoModalOpen(true)}
                                    >
                                        <Upload className="w-6 h-6" />
                                    </div>
                                </div>
                                <div className="space-y-4 text-center md:text-left">
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-slate-700">Logo de la Empresa</h3>
                                        <p className="text-sm text-slate-500">
                                            Sube tu logo en formato PNG o JPG. Se recomienda 400x400px. Máximo 2MB.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 justify-center md:justify-start">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIsLogoModalOpen(true)}
                                        >
                                            Cambiar imagen
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="text-destructive hover:text-destructive hover:bg-destructive/5"
                                            onClick={() => setIsDeleteModalOpen(true)}
                                            disabled={!logoId || isDeletingLogo}
                                        >
                                            Eliminar
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <UploadFileModal
                                isOpen={isLogoModalOpen}
                                onClose={() => setIsLogoModalOpen(false)}
                                onSuccess={handleLogoUploadSuccess}
                                title="Subir Logo del Negocio"
                                accept="image/jpeg,image/png,image/webp"
                                category={FileCategory.GENERAL}
                                cropShape="round"
                                showLibraryTab={true}
                            />
                        </Card>

                        {/* Datos del Negocio */}
                        <Card className="p-6 border-slate-200">
                            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                Datos del Negocio
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Nombre Comercial</Label>
                                    <div className="relative">
                                        <Input
                                            {...register('name')}
                                            placeholder="Ej. JKE Solutions"
                                            className="pl-10"
                                        />
                                        <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    </div>
                                    {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Razón Social</Label>
                                    <div className="relative">
                                        <Input
                                            {...register('legalEntity.businessName')}
                                            placeholder="Ej. JKE Solutions S.A.C."
                                            className="pl-10"
                                        />
                                        <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    </div>
                                    {errors.legalEntity?.businessName && <p className="text-xs text-destructive">{errors.legalEntity.businessName.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>RUC / Tax ID</Label>
                                    <div className="relative">
                                        <Input
                                            {...register('legalEntity.documentNumber')}
                                            placeholder="20601234567"
                                            className="pl-10"
                                        />
                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    </div>
                                    {errors.legalEntity?.documentNumber && <p className="text-xs text-destructive">{errors.legalEntity.documentNumber.message}</p>}
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Dirección Fiscal</Label>
                                    <div className="relative">
                                        <Input
                                            {...register('legalEntity.fiscalAddress')}
                                            placeholder="Ej. Av. Javier Prado Este 1234, Lima"
                                            className="pl-10"
                                        />
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Teléfono de Contacto</Label>
                                    <div className="relative">
                                        <Input
                                            {...register('legalEntity.phoneNumber')}
                                            placeholder="+51 999 999 999"
                                            className="pl-10"
                                        />
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Email del Negocio</Label>
                                    <div className="relative">
                                        <Input
                                            {...register('legalEntity.email')}
                                            placeholder="admin@jkesolutions.com"
                                            className="pl-10"
                                        />
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    </div>
                                    {errors.legalEntity?.email && <p className="text-xs text-destructive">{errors.legalEntity.email.message}</p>}
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right Column: Preferences */}
                    <div className="space-y-8">
                        <Card className="p-6 border-slate-200">
                            <h2 className="text-lg font-bold text-slate-800 mb-6">Preferencias del Sistema</h2>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Coins className="w-4 h-4 text-slate-400" />
                                        Moneda Principal
                                    </Label>
                                    <select
                                        {...register('mainCurrencyId')}
                                        className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%2364748b%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat"
                                    >
                                        <option value="">Seleccionar moneda</option>
                                        {currencies.map(c => (
                                            <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                                        ))}
                                    </select>
                                    <p className="text-[10px] text-slate-400">Moneda base para reportes e inventario.</p>
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Percent className="w-4 h-4 text-slate-400" />
                                        Porcentaje de Impuestos (IGV)
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            {...register('taxValue', { valueAsNumber: true })}
                                            className="pr-10"
                                        />
                                        <div className="absolute right-0 top-0 h-full w-10 flex items-center justify-center bg-slate-50 border-l border-slate-200 rounded-r-lg text-slate-500 text-sm">
                                            %
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100 flex flex-col gap-8">
                                    {/* Alertas de Stock Bajo */}
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <Label className="text-slate-700 font-bold">Alertas de Stock Bajo</Label>
                                            <p className="text-xs text-slate-500">Recibir notificaciones cuando el inventario llegue al mínimo.</p>
                                        </div>
                                        <div className="space-y-2 pl-0">
                                            <Label className="text-xs text-slate-500 flex items-center gap-2">
                                                <Clock className="h-3 w-3" /> Frecuencia de Alerta
                                            </Label>
                                            <select
                                                {...register('stockNotificationFrequency')}
                                                className="w-full h-9 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%2364748b%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.1rem_1.1rem] bg-[right_0.4rem_center] bg-no-repeat"
                                            >
                                                <option value="DAILY">Diario</option>
                                                <option value="WEEKLY">Semanal</option>
                                                <option value="MONTHLY">Mensual</option>
                                                <option value="NEVER">Nunca</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Alertas de Ventas Realizadas */}
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <Label className="text-slate-700 font-bold">Alertas de Ventas Realizadas</Label>
                                            <p className="text-xs text-slate-500">Recibir una notificación cada vez que se complete una transacción.</p>
                                        </div>
                                        <div className="space-y-2 pl-0">
                                            <Label className="text-xs text-slate-500 flex items-center gap-2">
                                                <Clock className="h-3 w-3" /> Frecuencia de Alerta
                                            </Label>
                                            <select
                                                {...register('salesNotificationFrequency')}
                                                className="w-full h-9 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%2364748b%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.1rem_1.1rem] bg-[right_0.4rem_center] bg-no-repeat"
                                            >
                                                <option value="DAILY">Diario</option>
                                                <option value="WEEKLY">Semanal</option>
                                                <option value="MONTHLY">Mensual</option>
                                                <option value="NEVER">Nunca</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 pt-4 border-t border-slate-100">
                                    <Label className="flex items-center gap-2">
                                        <HardDrive className="w-4 h-4 text-slate-400" />
                                        Capacidad de Almacenamiento
                                    </Label>
                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                        <p className="text-sm font-bold text-slate-700">
                                            {society?.storageLimit ?
                                                `${(parseInt(society.storageLimit) / (1024 * 1024)).toFixed(0)} MB` :
                                                'No definido'}
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-1">
                                            Límite total de archivos permitido para tu suscripción.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </form>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteLogo}
                title="¿Eliminar logotipo?"
                description="Esta acción eliminará permanentemente el logo de tu empresa. ¿Deseas continuar?"
                confirmText="Eliminar"
                cancelText="Cancelar"
                variant="danger"
                loading={isDeletingLogo}
            />
        </div>
    );
}
