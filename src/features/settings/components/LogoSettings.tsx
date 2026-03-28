import { Store, Upload } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadFileModal } from '@/components/shared/UploadFileModal';
import { FileCategory } from '@/services/file.service';

interface LogoSettingsProps {
  logoPreview: string | null;
  logoId: string | null;
  isDeletingLogo: boolean;
  isLogoModalOpen: boolean;
  onOpenModal: () => void;
  onCloseModal: () => void;
  onDeleteLogo: () => void;
  onUploadSuccess: (data: any) => void;
}

export function LogoSettings({
  logoPreview,
  logoId,
  isDeletingLogo,
  isLogoModalOpen,
  onOpenModal,
  onCloseModal,
  onDeleteLogo,
  onUploadSuccess
}: LogoSettingsProps) {
  return (
    <Card className="p-6 border-border">
      <h2 className="text-sm font-bold text-foreground mb-6 flex items-center gap-2 uppercase tracking-tight">
        Logotipo
      </h2>
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="relative group">
          <div className="w-40 h-40 rounded-full border-4 border-dashed border-border flex items-center justify-center bg-muted/30 overflow-hidden transition-colors group-hover:border-primary/30">
            {logoPreview ? (
              <img src={logoPreview} alt="Business Logo" className="w-full h-full object-contain" />
            ) : (
              <Store className="w-12 h-12 text-muted-foreground/20" />
            )}
          </div>
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full"
            onClick={onOpenModal}
          >
            <Upload className="w-6 h-6" />
          </div>
        </div>
        <div className="space-y-4 text-center md:text-left">
          <div className="space-y-1">
            <h3 className="font-bold text-foreground text-sm">Logo de la Empresa</h3>
            <p className="text-xs text-muted-foreground">
              Sube tu logo en formato PNG o JPG. Se recomienda 400x400px. Máximo 2MB.
            </p>
          </div>
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenModal}
            >
              Cambiar imagen
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/5"
              onClick={onDeleteLogo}
              disabled={!logoId || isDeletingLogo}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </div>

      <UploadFileModal
        isOpen={isLogoModalOpen}
        onClose={onCloseModal}
        onSuccess={onUploadSuccess}
        title="Subir Logo del Negocio"
        accept="image/jpeg,image/png,image/webp"
        category={FileCategory.GENERAL}
        cropShape="round"
        showLibraryTab={true}
      />
    </Card>
  );
}
