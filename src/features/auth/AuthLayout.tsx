import { useThemeStore } from '@/store/theme.store';
import logo from '@/assets/logo.webp'; // Optimized WebP version

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();
  // Determine if it's currently rendering dark mode
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-foreground font-body relative overflow-hidden">
      {/* Background soft gradient/pattern matching the application's style */}
      <div className="absolute inset-0 bg-muted/30 pointer-events-none" />

      <div className="relative mb-8 flex flex-col items-center gap-3">
        <img
          src={logo}
          alt="JKE Solutions Logo"
          width={180}
          height={48}
          fetchPriority="high"
          loading="eager"
          className={`h-12 w-auto object-contain transition-all ${isDark ? 'brightness-0 invert' : ''}`}
        />
      </div>

      <main className="relative w-full max-w-md z-10">
        {children}
      </main>

      <footer className="relative mt-8 text-center text-xs text-muted-foreground font-medium z-10">
        © {new Date().getFullYear()} JKE Solutions. All rights reserved.
      </footer>
    </div>
  );
}
