import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-muted text-foreground font-body flex flex-col">
      <header className="bg-white shadow-sm border-b border-muted p-4 flex justify-between items-center">
        <div className="font-headings font-bold text-xl text-primary">
          JKE Solutions
        </div>
        <nav className="flex gap-4 text-sm font-medium text-foreground/80">
          <a href="#" className="hover:text-primary transition-colors">
            Dashboard
          </a>
          <a href="#" className="hover:text-primary transition-colors">
            Settings
          </a>
        </nav>
      </header>

      <main className="flex-1 container mx-auto p-4 md:p-8">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-muted p-6 text-center text-sm text-foreground/60">
        © {new Date().getFullYear()} JKE Solutions. All rights reserved.
      </footer>
    </div>
  );
}
