import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { societyService, type UpdateSocietyRequest } from '@/services/society.service';
import { currencyService, type CurrencySelectOption } from '@/services/currency.service';
import { useSocietyStore } from '@/store/society.store';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { fileService } from '@/services/file.service';
import { GeneralSettingsHeader } from './components/GeneralSettingsHeader';
import { LogoSettings } from './components/LogoSettings';
import { BusinessDataForm } from './components/BusinessDataForm';
import { SystemPreferences } from './components/SystemPreferences';

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
            const payload: UpdateSocietyRequest = {};

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

            if (logoId !== society.logo?.id) {
                payload.logoId = logoId;
            }

            if (dirtyFields.legalEntity && data.legalEntity) {
                const legalEntityPayload: NonNullable<UpdateSocietyRequest['legalEntity']> = {};
                const dirtyLegalEntity = dirtyFields.legalEntity;
                
                if (dirtyLegalEntity.businessName) legalEntityPayload.businessName = data.legalEntity.businessName;
                if (dirtyLegalEntity.documentNumber) legalEntityPayload.documentNumber = data.legalEntity.documentNumber;
                if (dirtyLegalEntity.fiscalAddress) legalEntityPayload.fiscalAddress = data.legalEntity.fiscalAddress;
                if (dirtyLegalEntity.phoneNumber) legalEntityPayload.phoneNumber = data.legalEntity.phoneNumber;
                if (dirtyLegalEntity.email) legalEntityPayload.email = data.legalEntity.email;
                
                payload.legalEntity = legalEntityPayload;
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

    const handleLogoUploadSuccess = (data: { id?: string; path?: string; downloadUrl?: string } | null) => {
        if (data) {
            if (data.id) setLogoId(data.id);
            if (data.path || data.downloadUrl) setLogoPreview(data.downloadUrl || data.path || null);
        }
    };

    const handleDeleteLogo = async () => {
        if (!society || !logoId) return;

        try {
            setIsDeletingLogo(true);
            const response = await societyService.put(society.code, {
                logoId: null
            });

            if (response.success) {
                try {
                    await fileService.delete(logoId);
                } catch {
                    console.error('Error deleting file, but society was updated');
                }

                setSociety(response.data);
                setLogoPreview(null);
                setLogoId(null);
                toast.success('Logo eliminado correctamente');
            }
        } catch {
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
                <GeneralSettingsHeader isSaving={isSaving} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <LogoSettings
                            logoPreview={logoPreview}
                            logoId={logoId}
                            isDeletingLogo={isDeletingLogo}
                            isLogoModalOpen={isLogoModalOpen}
                            onOpenModal={() => setIsLogoModalOpen(true)}
                            onCloseModal={() => setIsLogoModalOpen(false)}
                            onDeleteLogo={() => setIsDeleteModalOpen(true)}
                            onUploadSuccess={handleLogoUploadSuccess}
                        />
                        <BusinessDataForm register={register} errors={errors} />
                    </div>

                    <div className="space-y-8">
                        <SystemPreferences
                            register={register}
                            currencies={currencies}
                            storageLimit={society?.storageLimit}
                        />
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
