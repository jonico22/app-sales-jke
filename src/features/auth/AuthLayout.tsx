import { Outlet } from 'react-router-dom';
import { useThemeStore } from '@/store/theme.store';
import logo from '@/assets/logo.png'; // Assuming logo is in src/assets

export default function AuthLayout() {
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
          className={`h-12 w-auto object-contain transition-all ${isDark ? 'brightness-0 invert' : ''}`}
        />
      </div>

      <div className="relative w-full max-w-md z-10">
        <Outlet />
      </div>

      <footer className="relative mt-8 text-center text-xs text-muted-foreground/80 z-10">
        © {new Date().getFullYear()} JKE Solutions. All rights reserved.
      </footer>
    </div>
  );
}
