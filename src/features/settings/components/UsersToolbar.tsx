import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface UsersToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function UsersToolbar({ searchTerm, onSearchChange }: UsersToolbarProps) {
  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="border-b border-border overflow-x-auto no-scrollbar">
        <nav className="-mb-px flex space-x-6">
          <button className="border-primary text-primary whitespace-nowrap py-3 px-1 border-b-2 font-black text-[10px] sm:text-[11px] uppercase tracking-tighter">
            Lista de Usuarios
          </button>
        </nav>
      </div>

      {/* Toolbar */}
      <div className="p-3 sm:p-4 border-b border-border bg-card">
        <div className="relative w-full max-w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
          <Input
            placeholder="Buscar usuarios..."
            className="pl-9 h-10 border-border bg-muted/30 focus-visible:bg-background text-[13px] rounded-xl sm:rounded-lg"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
