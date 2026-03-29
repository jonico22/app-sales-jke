import React from 'react';
import { Link as LinkIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ExternalTabProps {
  externalLink: { name: string; url: string; mimeType: string };
  onExternalLinkChange: (value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  isUploading: boolean;
  onCancel: () => void;
}

export const ExternalTab = React.memo(({
  externalLink,
  onExternalLinkChange,
  onSubmit,
  isUploading,
  onCancel,
}: ExternalTabProps) => {

  return (
    <form onSubmit={onSubmit} className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ext-name">Nombre del archivo</Label>
          <Input
            id="ext-name"
            placeholder="Ej: Catálogo 2024.pdf"
            value={externalLink.name}
            onChange={(e) => onExternalLinkChange((prev: any) => ({ ...prev, name: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ext-url">URL del archivo</Label>
          <Input
            id="ext-url"
            placeholder="https://ejemplo.com/archivo.pdf"
            value={externalLink.url}
            onChange={(e) => onExternalLinkChange((prev: any) => ({ ...prev, url: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ext-mime">Tipo de archivo</Label>
          <select
            id="ext-mime"
            className="w-full h-10 px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            value={externalLink.mimeType}
            onChange={(e) => onExternalLinkChange((prev: any) => ({ ...prev, mimeType: e.target.value }))}
          >
            <option value="application/pdf">PDF Document</option>
            <option value="image/jpeg">Image (JPEG)</option>
            <option value="image/png">Image (PNG)</option>
            <option value="image/webp">Image (WEBP)</option>
            <option value="text/csv">CSV Table</option>
            <option value="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">Excel Spreadsheet</option>
          </select>
        </div>
      </div>

      <div className="shrink-0 flex items-center justify-end gap-3 pt-6 border-t border-border mt-4">
        <Button variant="ghost" type="button" onClick={onCancel} disabled={isUploading}>Cancelar</Button>
        <Button
          variant="primary"
          type="submit"
          className="bg-[#56a3e2] hover:bg-[#4a8ec5] text-white font-bold h-11 px-8"
          disabled={isUploading}
        >
          {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LinkIcon className="w-4 h-4 mr-2" />}
          Registrar Enlace
        </Button>
      </div>
    </form>
  );
});

ExternalTab.displayName = 'ExternalTab';
