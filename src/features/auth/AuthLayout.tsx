import { Outlet } from 'react-router-dom';
import logo from '@/assets/logo.png'; // Assuming logo is in src/assets

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/30 font-body">
      <div className="mb-8 flex flex-col items-center gap-3">
        <img src={logo} alt="JKE Solutions Logo" className="h-12 w-auto object-contain" />
      </div>

      <div className="w-full max-w-md">
        <Outlet />
      </div>

      <footer className="mt-8 text-center text-xs text-muted-foreground/80">
        © {new Date().getFullYear()} JKE Solutions. All rights reserved.
      </footer>
    </div>
  );
}
