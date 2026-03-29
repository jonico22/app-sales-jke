import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import { MobileNavFooter } from './MobileNavFooter';
import { cn } from '@/lib/utils';
import { useSessionValidator } from '@/hooks/useSessionValidator';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { SessionExpiredModal } from '@/components/shared/SessionExpiredModal';
import { useAuthStore } from '@/store/auth.store';

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isSessionExpired, handleRedirect } = useSessionValidator();
  const user = useAuthStore((state) => state.user);
  const mustChangePassword = user?.mustChangePassword ?? false;

  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1024px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  // Auto-collapse on tablet screens
  useEffect(() => {
    if (isTablet) {
      setIsCollapsed(true);
    } else if (isDesktop) {
      setIsCollapsed(false);
    }
  }, [isTablet, isDesktop]);

  // Close sidebar when entering mobile
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
      setIsCollapsed(false);
    }
  }, [isMobile]);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <SessionExpiredModal
        isOpen={isSessionExpired}
        onLogin={handleRedirect}
      />

      {/* Sidebar - Hidden if password change required */}
      {!mustChangePassword && (
        <DashboardSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          isCollapsed={isCollapsed}
          toggleCollapse={toggleCollapse}
        />
      )}

      {/* Main Content Wrapper */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out",
          !mustChangePassword && (isCollapsed ? "md:ml-20" : "md:ml-64")
        )}
      >

        {/* Header - Passing toggler and hideMenu */}
        <DashboardHeader
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          hideMenu={mustChangePassword}
        />

        {/* Page Content - extra bottom padding on mobile for nav footer */}
        <main className={cn(
          "flex-1 p-6 overflow-auto",
          !mustChangePassword ? "pb-24 lg:pb-6" : ""
        )}>
          <Outlet />
        </main>
      </div>

      {/* Mobile Navigation Footer - Hidden if password change required */}
      {!mustChangePassword && (
        <MobileNavFooter onMenuClick={() => setIsSidebarOpen(true)} />
      )}
    </div>
  );
}
