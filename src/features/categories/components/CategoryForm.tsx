import { PenLine, Wand2, Save } from 'lucide-react';
import { Button, Input, Label, Textarea, Switch } from '@/components/ui';

export default function CategoryForm() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:p-8 h-full flex flex-col">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-blue-50 p-3 rounded-xl">
          <PenLine className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-lg">Ingreso Manual</h3>
          <p className="text-sm text-slate-500">Crear una nueva categoría individualmente.</p>
        </div>
      </div>

      <form className="space-y-6 flex-1 flex flex-col">
        {/* Code Field */}
        <div className="space-y-2">
          <Label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Código</Label>
          <div className="flex gap-2">
            <Input placeholder="Generar automáticamente" className="bg-slate-50/50" readOnly />
            <Button type="button" className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white px-3">
              <Wand2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Name Field */}
        <div className="space-y-2">
          <Label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Nombre de la Categoría</Label>
          <Input placeholder="Ej. Electrodomésticos" />
        </div>

        {/* Description Field */}
        <div className="space-y-2">
          <Label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Descripción <span className="text-slate-400 font-normal normal-case">(Opcional)</span></Label>
          <Textarea placeholder="Breve descripción de la categoría..." className="resize-none h-32" />
        </div>

        {/* Status Field */}
        <div className="space-y-3 pt-2">
          <Label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Estado</Label>
          <div className="flex items-center gap-3">
            <Switch defaultChecked />
            <span className="text-sm font-medium text-slate-700">Activo</span>
          </div>
        </div>
        
        <div className="border-t border-slate-100 my-6"></div>

        {/* Submit Button */}
        <Button className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white py-6 rounded-lg text-base font-semibold shadow-lg shadow-sky-500/20 mt-auto">
          <Save className="h-5 w-5 mr-2" /> Guardar Categoría
        </Button>
      </form>
    </div>
  );
}
