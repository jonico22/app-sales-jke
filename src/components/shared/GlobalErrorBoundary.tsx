import { useRouteError } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export function GlobalErrorBoundary() {
  const error = useRouteError() as any;
  const isChunkError = error?.message?.includes('Failed to fetch dynamically imported module');

  const handleReload = () => {
    // Force a fresh request to bypass browser cache
    const url = new URL(window.location.href);
    url.searchParams.set('v', Date.now().toString());
    window.location.href = url.toString();
  };

  // If it's a chunk error, try an immediate reload to heal it automatically
  // (Only do it once to avoid infinite loops)
  if (isChunkError) {
    const hasReloaded = sessionStorage.getItem('global_chunk_reload');
    if (!hasReloaded) {
      sessionStorage.setItem('global_chunk_reload', 'true');
      handleReload();
      return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4 text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground">
              Actualizando aplicación...
            </p>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="flex min-h-[100dvh] w-full items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center text-center max-w-sm gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-500">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Oops, algo salió mal
          </h2>
          <p className="text-sm text-muted-foreground">
            {isChunkError 
              ? "Hay una nueva versión disponible. Por favor, actualiza la página."
              : "Ha ocurrido un error inesperado al cargar la página."}
          </p>
        </div>
        <Button 
          onClick={handleReload}
          className="mt-2 w-full flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Actualizar Página
        </Button>
      </div>
    </div>
  );
}
