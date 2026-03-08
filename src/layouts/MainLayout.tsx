import { Outlet } from "react-router-dom";
import DashboardHeader from "@/components/layout/DashboardHeader";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-muted text-foreground font-body flex flex-col">
      <DashboardHeader />

      <main className="flex-1 container mx-auto p-4 md:p-8">
        <Outlet />
      </main>

      <footer className="bg-card border-t border-border p-6 text-center text-xs text-muted-foreground/60">
        © {new Date().getFullYear()} JKE Solutions. All rights reserved.
      </footer>
    </div>
  );
}
